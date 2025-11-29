
import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAICoachingStream } from "@/hooks/useAICoachingStream";
import { useAIAssistant } from "@/hooks/useAIAssistant";
import { useBusiness } from "@/hooks/useBusiness";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, MessageCircle, Loader2, Send, Wifi, WifiOff, Bot } from "lucide-react";
import { RichTextDisplay } from "./RichTextDisplay";

interface AICoachingPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSuggestionApply: (suggestion: string) => void;
  currentContent: string;
  fieldType: 'mission' | 'culture' | 'benefits' | 'general' | 'cover_letter';
  businessContext: any;
}

interface Message {
  role: 'user' | 'coach';
  content: string;
  isStreaming?: boolean;
}

export const AICoachingPanel = ({ 
  isOpen, 
  onClose, 
  onSuggestionApply, 
  currentContent, 
  fieldType, 
  businessContext
}: AICoachingPanelProps) => {
  const [question, setQuestion] = useState("");
  const [conversation, setConversation] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const streamingMessageRef = useRef<string>('');

  // Check for AI Assistant
  const { data: business } = useBusiness();
  const { data: assistant } = useAIAssistant(business?.id);
  
  const isAssistantActive = assistant && assistant.is_active && 
    (!assistant.expires_at || new Date(assistant.expires_at) > new Date());

  // WebSocket streaming hook (fallback when no assistant)
  const { sendMessage, disconnect, connectionStatus, isStreaming, usingFallback } = useAICoachingStream({
    autoConnect: isOpen && !isAssistantActive, // Only connect if no assistant
    onStreamStart: () => {
      console.log('Stream started');
      streamingMessageRef.current = '';
      const coachMessage: Message = { role: 'coach', content: "", isStreaming: true };
      setConversation(prev => [...prev, coachMessage]);
    },
    onStreamToken: (token: string) => {
      streamingMessageRef.current += token;
      setConversation(prev => 
        prev.map((msg, index) => 
          index === prev.length - 1 && msg.isStreaming 
            ? { ...msg, content: streamingMessageRef.current }
            : msg
        )
      );
    },
    onStreamEnd: (fullContent: string) => {
      console.log('Stream ended');
      setConversation(prev => 
        prev.map((msg, index) => 
          index === prev.length - 1 && msg.isStreaming 
            ? { role: 'coach', content: fullContent, isStreaming: false }
            : msg
        )
      );
    },
    onError: (error: string) => {
      console.error('Streaming error:', error);
      setConversation(prev => 
        prev.map((msg, index) => 
          index === prev.length - 1 && msg.isStreaming 
            ? { role: 'coach', content: "Sorry, I encountered an error. Please try again.", isStreaming: false }
            : msg
        )
      );
    }
  });

  const handleAskCoachWithAssistant = async (questionToSend: string) => {
    if (!assistant || !questionToSend.trim() || isProcessing) return;

    setIsProcessing(true);
    
    try {
      // Add user message to conversation
      const userMessage: Message = { role: 'user', content: questionToSend };
      setConversation(prev => [...prev, userMessage]);

      // Add streaming coach message
      const coachMessage: Message = { role: 'coach', content: "", isStreaming: true };
      setConversation(prev => [...prev, coachMessage]);

      // Prepare context message for the assistant
      const contextMessage = `I'm working on the ${fieldType} section of my business profile. Current content: "${currentContent}". Question: ${questionToSend}`;

      // Send message to OpenAI assistant via edge function
      const { data, error } = await supabase.functions.invoke('ai-assistant-chat', {
        body: {
          assistantId: assistant.openai_assistant_id,
          threadId: assistant.openai_thread_id,
          message: contextMessage
        }
      });

      if (error) throw error;

      // Update the conversation with the response
      setConversation(prev => 
        prev.map((msg, index) => 
          index === prev.length - 1 && msg.isStreaming 
            ? { role: 'coach', content: data.response, isStreaming: false }
            : msg
        )
      );

    } catch (error) {
      console.error('Assistant chat error:', error);
      setConversation(prev => 
        prev.map((msg, index) => 
          index === prev.length - 1 && msg.isStreaming 
            ? { role: 'coach', content: "Sorry, I encountered an error. Please try again.", isStreaming: false }
            : msg
        )
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAskCoachWithFallback = async (questionToSend: string) => {
    if (!questionToSend.trim() || isProcessing) return;

    setIsProcessing(true);
    
    try {
      // Add user message to conversation
      const userMessage: Message = { role: 'user', content: questionToSend };
      const updatedConversation = [...conversation, userMessage];
      setConversation(updatedConversation);

      // Add streaming coach message
      const coachMessage: Message = { role: 'coach', content: "", isStreaming: true };
      setConversation(prev => [...prev, coachMessage]);

      // Send conversation history to maintain context
      const { data, error } = await supabase.functions.invoke('ai-coaching', {
        body: { 
          prompt: questionToSend, 
          context: currentContent, 
          type: fieldType,
          conversationHistory: updatedConversation.filter(msg => !msg.isStreaming)
        }
      });

      if (error) throw error;

      if (data?.coaching) {
        // Update the conversation with the response
        setConversation(prev => 
          prev.map((msg, index) => 
            index === prev.length - 1 && msg.isStreaming 
              ? { role: 'coach', content: data.coaching, isStreaming: false }
              : msg
          )
        );
      } else {
        throw new Error('No response received from AI coaching service');
      }
    } catch (error) {
      console.error('Fallback coaching error:', error);
      setConversation(prev => 
        prev.map((msg, index) => 
          index === prev.length - 1 && msg.isStreaming 
            ? { role: 'coach', content: "Sorry, I encountered an error. Please try again.", isStreaming: false }
            : msg
        )
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleQuestionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setQuestion(e.target.value);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAskCoach();
    }
  };

  const handleAskCoach = () => {
    if (!question.trim() || isStreaming || isProcessing) return;

    const questionToSend = question;
    setQuestion("");

    if (isAssistantActive) {
      handleAskCoachWithAssistant(questionToSend);
    } else {
      handleAskCoachWithFallback(questionToSend);
    }
  };

  // Clean up connection when panel closes
  useEffect(() => {
    if (!isOpen) {
      disconnect();
      setConversation([]);
      setQuestion("");
    }
  }, [isOpen, disconnect]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [conversation]);

  const handleApplySuggestion = (suggestion: string) => {
    onSuggestionApply(suggestion);
  };

  const getPlaceholder = () => {
    switch (fieldType) {
      case 'mission':
        return "Ask about developing your mission statement...";
      case 'culture':
        return "Ask about defining your company culture...";
      case 'benefits':
        return "Ask about employee benefits and perks...";
      case 'cover_letter':
        return "Ask for help writing your cover letter...";
      default:
        return "Ask the AI coach for guidance...";
    }
  };

  const getConnectionIcon = () => {
    if (isAssistantActive) {
      return <Bot className="h-3 w-3 text-blue-500" />;
    }
    if (usingFallback) {
      return <WifiOff className="h-3 w-3 text-orange-500" />;
    }
    switch (connectionStatus) {
      case 'connected':
        return <Wifi className="h-3 w-3 text-green-500" />;
      case 'connecting':
        return <Loader2 className="h-3 w-3 text-blue-500 animate-spin" />;
      case 'failed':
      case 'disconnected':
        return <WifiOff className="h-3 w-3 text-gray-400" />;
    }
  };

  const getConnectionText = () => {
    if (isAssistantActive) return "AI Assistant active";
    if (usingFallback) return "Using fallback mode with context";
    switch (connectionStatus) {
      case 'connected':
        return "Real-time connection active";
      case 'connecting':
        return "Connecting...";
      case 'failed':
        return "Connection failed - using fallback";
      case 'disconnected':
        return "Disconnected";
    }
  };

  const isCurrentlyProcessing = isStreaming || isProcessing;

  // Check if we should show the apply suggestion button
  const shouldShowApplyButton = fieldType !== 'general';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            AI Business Coach
            <div className="flex items-center gap-1 ml-auto">
              {getConnectionIcon()}
              <span className="text-xs text-gray-500">{getConnectionText()}</span>
            </div>
          </DialogTitle>
          <p className="text-sm text-gray-600 mt-1">
            Get personalized guidance to help develop your business profile
            {isAssistantActive && (
              <span className="text-blue-600 font-medium"> • Using your persistent AI Assistant</span>
            )}
          </p>
        </DialogHeader>
        
        <div className="flex-1 flex flex-col min-h-0">
          {/* Chat Messages Area */}
          <div className="flex-1 min-h-0 py-4">
            <ScrollArea 
              ref={scrollAreaRef}
              className="h-full px-1"
            >
              {conversation.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 flex items-center justify-center mb-4">
                    <MessageCircle className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">
                    Welcome to your AI Business Coach
                  </h3>
                  <p className="text-gray-600 max-w-md">
                    I'm here to help you craft compelling content for your business profile. Ask me anything about your {fieldType} or business strategy.
                    {isAssistantActive && (
                      <span className="block mt-2 text-blue-600 font-medium">
                        ✨ Your persistent AI Assistant is active and will remember our conversation!
                      </span>
                    )}
                  </p>
                </div>
              ) : (
                <div className="space-y-6 pb-4">
                  {conversation.map((message, index) => (
                    <div
                      key={index}
                      className={`flex gap-3 ${
                        message.role === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      {message.role === 'coach' && (
                        <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 mt-1">
                          {message.isStreaming ? (
                            <Loader2 className="h-4 w-4 text-white animate-spin" />
                          ) : (
                            <Sparkles className="h-4 w-4 text-white" />
                          )}
                        </div>
                      )}
                      
                      <div className={`max-w-[70%] ${
                        message.role === 'user' ? 'order-1' : ''
                      }`}>
                        <div className={`rounded-2xl px-4 py-3 ${
                          message.role === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {message.role === 'coach' && !message.isStreaming ? (
                            <RichTextDisplay 
                              content={message.content}
                              className="text-gray-800 prose-sm [&>*]:mb-2 [&>*:last-child]:mb-0"
                            />
                          ) : message.isStreaming ? (
                            <div className="text-gray-700">
                              {message.content || "Thinking..."}
                              <span className="animate-pulse ml-1">●</span>
                            </div>
                          ) : (
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">
                              {message.content}
                            </p>
                          )}
                        </div>
                        
                        {message.role === 'coach' && !message.isStreaming && message.content && shouldShowApplyButton && (
                          <div className="mt-3">
                            <Button
                              onClick={() => handleApplySuggestion(message.content)}
                              variant="outline"
                              size="sm"
                              className="text-xs border-blue-200 text-blue-600 hover:bg-blue-50"
                            >
                              Apply This Suggestion
                            </Button>
                          </div>
                        )}
                      </div>
                      
                      {message.role === 'user' && (
                        <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0 mt-1">
                          <div className="h-4 w-4 rounded-full bg-white"></div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Input Area */}
          <div className="border-t pt-4 flex-shrink-0">
            <div className="flex gap-3">
              <Textarea
                value={question}
                onChange={handleQuestionChange}
                placeholder={getPlaceholder()}
                className="flex-1 min-h-[60px] max-h-[120px] resize-none border-gray-200 focus:border-blue-300"
                onKeyPress={handleKeyPress}
              />
              <Button 
                onClick={handleAskCoach} 
                disabled={!question.trim() || isCurrentlyProcessing}
                className="h-[60px] px-6 bg-blue-600 hover:bg-blue-700 flex-shrink-0"
              >
                {isCurrentlyProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
