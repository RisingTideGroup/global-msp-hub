
import { useState, useRef, useCallback, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

interface StreamMessage {
  type: 'stream_start' | 'stream_token' | 'stream_end' | 'error' | 'connection_established';
  content?: string;
  error?: string;
  message?: string;
}

interface UseAICoachingStreamProps {
  onStreamStart?: () => void;
  onStreamToken?: (token: string) => void;
  onStreamEnd?: (fullContent: string) => void;
  onError?: (error: string) => void;
  autoConnect?: boolean;
}

export const useAICoachingStream = ({
  onStreamStart,
  onStreamToken,
  onStreamEnd,
  onError,
  autoConnect = false
}: UseAICoachingStreamProps) => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'failed'>('disconnected');
  const wsRef = useRef<WebSocket | null>(null);
  const contentRef = useRef<string>('');
  const [usingFallback, setUsingFallback] = useState(false);
  const connectionAttemptedRef = useRef(false);

  const fallbackToRestAPI = useCallback(async (prompt: string, context: string, type: string) => {
    console.log('Falling back to REST API...');
    setUsingFallback(true);
    
    try {
      onStreamStart?.();
      
      const { data, error } = await supabase.functions.invoke('ai-coaching', {
        body: { prompt, context, type }
      });

      if (error) {
        throw new Error(error.message || 'AI coaching request failed');
      }

      if (data?.coaching) {
        const content = data.coaching;
        contentRef.current = content;
        
        // Display the response immediately without simulated streaming
        onStreamEnd?.(content);
      } else {
        throw new Error('No response received from AI coaching service');
      }
    } catch (error) {
      console.error('Fallback API error:', error);
      onError?.(error instanceof Error ? error.message : 'Failed to get AI coaching response');
    } finally {
      setIsStreaming(false);
      setUsingFallback(false);
    }
  }, [onStreamStart, onStreamEnd, onError]);

  const connectWebSocket = useCallback(() => {
    // Prevent multiple connection attempts
    if (wsRef.current?.readyState === WebSocket.OPEN || 
        wsRef.current?.readyState === WebSocket.CONNECTING ||
        connectionAttemptedRef.current) {
      console.log('WebSocket already open, connecting, or connection already attempted');
      return;
    }

    console.log('Establishing WebSocket connection...');
    setConnectionStatus('connecting');
    connectionAttemptedRef.current = true;
    
    const wsUrl = `wss://onrslzaubwvbgfzjjlio.functions.supabase.co/functions/v1/ai-coaching-stream`;
    console.log('Connecting to:', wsUrl);
    
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    // Connection timeout
    const connectionTimeout = setTimeout(() => {
      if (ws.readyState === WebSocket.CONNECTING) {
        console.log('WebSocket connection timeout');
        ws.close();
        setConnectionStatus('failed');
        connectionAttemptedRef.current = false;
      }
    }, 10000); // 10 second timeout

    ws.onopen = () => {
      console.log('WebSocket connected successfully');
      clearTimeout(connectionTimeout);
      setConnectionStatus('connected');
    };

    ws.onmessage = (event) => {
      console.log('Received WebSocket message:', event.data);
      try {
        const message: StreamMessage = JSON.parse(event.data);
        
        switch (message.type) {
          case 'connection_established':
            console.log('Connection established:', message.message);
            break;
          case 'stream_start':
            console.log('Stream started');
            onStreamStart?.();
            break;
          case 'stream_token':
            if (message.content) {
              contentRef.current += message.content;
              onStreamToken?.(message.content);
            }
            break;
          case 'stream_end':
            console.log('Stream ended');
            setIsStreaming(false);
            onStreamEnd?.(contentRef.current);
            break;
          case 'error':
            console.error('Stream error:', message.error);
            setIsStreaming(false);
            onError?.(message.error || 'Unknown streaming error');
            break;
        }
      } catch (parseError) {
        console.error('Error parsing WebSocket message:', parseError);
        onError?.('Failed to parse server response');
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      clearTimeout(connectionTimeout);
      setConnectionStatus('failed');
      connectionAttemptedRef.current = false;
    };

    ws.onclose = (event) => {
      console.log('WebSocket disconnected. Code:', event.code, 'Reason:', event.reason);
      clearTimeout(connectionTimeout);
      setConnectionStatus('disconnected');
      wsRef.current = null;
      connectionAttemptedRef.current = false;
    };
  }, [onStreamStart, onStreamToken, onStreamEnd, onError]);

  const sendMessage = useCallback(async (prompt: string, context: string, type: string) => {
    if (isStreaming) {
      console.log('Already streaming, ignoring new request');
      return;
    }

    contentRef.current = '';
    setIsStreaming(true);

    // If WebSocket is connected, use it
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log('Sending message via WebSocket');
      const message = { prompt, context, type };
      try {
        wsRef.current.send(JSON.stringify(message));
        return; // Exit early, WebSocket will handle the response
      } catch (sendError) {
        console.error('Error sending WebSocket message:', sendError);
      }
    }

    // Fallback to REST API
    console.log('Using REST API fallback');
    await fallbackToRestAPI(prompt, context, type);
  }, [isStreaming, fallbackToRestAPI]);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      console.log('Disconnecting WebSocket...');
      wsRef.current.close(1000, 'User disconnected');
      wsRef.current = null;
    }
    setConnectionStatus('disconnected');
    setIsStreaming(false);
    setUsingFallback(false);
    connectionAttemptedRef.current = false;
  }, []);

  // Auto-connect when requested - only attempt once
  useEffect(() => {
    if (autoConnect && connectionStatus === 'disconnected' && !connectionAttemptedRef.current) {
      connectWebSocket();
    }
  }, [autoConnect]); // Removed connectWebSocket and connectionStatus from dependencies

  return {
    sendMessage,
    disconnect,
    connectWebSocket,
    isStreaming,
    connectionStatus,
    usingFallback
  };
};
