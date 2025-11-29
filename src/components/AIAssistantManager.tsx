import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, Sparkles, Zap, Crown, Key, MessageCircle, Trash2, RefreshCw } from "lucide-react";
import { useCreateAIAssistant, useAIAssistant, useDeleteAIAssistant } from "@/hooks/useAIAssistant";
import { useToast } from "@/hooks/use-toast";
import { AICoachingPanel } from "./AICoachingPanel";

interface AIAssistantManagerProps {
  businessId?: string;
}

export const AIAssistantManager = ({ businessId }: AIAssistantManagerProps) => {
  const { toast } = useToast();
  const [customApiKey, setCustomApiKey] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<'basic' | 'premium' | null>(null);
  const [showAICoaching, setShowAICoaching] = useState(false);
  const [hasCustomApiKey, setHasCustomApiKey] = useState(false);
  
  const { data: assistant, isLoading, refetch } = useAIAssistant(businessId);
  const { mutate: createAssistant, isPending: isCreating } = useCreateAIAssistant();
  const { mutate: deleteAssistant, isPending: isDeleting } = useDeleteAIAssistant();

  const handleSetupAI = (assistantType: 'basic' | 'premium') => {
    if (!businessId) return;

    setSelectedPlan(assistantType);
    createAssistant({
      businessId,
      assistantType,
      businessContext: {} // This would be populated with business data
    });
  };

  const handleSaveApiKey = () => {
    if (!customApiKey.startsWith('sk-')) {
      toast({
        title: "Invalid API Key",
        description: "Please enter a valid OpenAI API key starting with 'sk-'",
        variant: "destructive"
      });
      return;
    }

    setHasCustomApiKey(true);
    toast({
      title: "API Key Saved",
      description: "Your OpenAI API key has been saved. Premium features are now enabled."
    });
  };

  const handleDeleteOrReset = () => {
    if (!assistant) return;

    const actionText = hasCustomApiKey ? "reset" : "delete";
    const confirmText = hasCustomApiKey 
      ? "Are you sure you want to reset your AI assistant? This will create a new assistant with your current settings."
      : "Are you sure you want to delete your AI assistant? This action cannot be undone.";

    if (!confirm(confirmText)) return;

    deleteAssistant({
      assistantId: assistant.openai_assistant_id,
      threadId: assistant.openai_thread_id,
      dbId: assistant.id
    }, {
      onSuccess: () => {
        if (hasCustomApiKey) {
          // Reset: Create a new assistant
          setTimeout(() => {
            handleSetupAI('premium');
          }, 1000);
        }
        refetch();
      }
    });
  };

  const basicFeatures = [
    "Form field suggestions",
    "Business writing assistance", 
    "Real-time content help",
    "Session-based conversations"
  ];

  const premiumFeatures = [
    "Persistent AI coach memory",
    "Advanced business strategy insights",
    "Unlimited coaching sessions",
    "Cross-session conversation history",
    "Priority support"
  ];

  if (isLoading) {
    return <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>;
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="setup" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="setup">Setup</TabsTrigger>
          <TabsTrigger value="api-key">Custom API Key</TabsTrigger>
          <TabsTrigger value="chat" disabled={!assistant}>Chat</TabsTrigger>
        </TabsList>

        <TabsContent value="setup" className="space-y-6">
          {!assistant ? (
            <>
              <div className="text-center space-y-2">
                <h3 className="text-xl font-semibold">Choose Your AI Plan</h3>
                <p className="text-gray-600">
                  Get personalized assistance for your business profile and operations
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {/* Basic Plan */}
                <Card className={`cursor-pointer transition-all ${selectedPlan === 'basic' ? 'ring-2 ring-blue-500 shadow-lg' : 'hover:shadow-md'}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-blue-600" />
                        <CardTitle className="text-lg">Standard AI</CardTitle>
                      </div>
                      <Badge variant="secondary">Free</Badge>
                    </div>
                    <CardDescription>
                      Basic AI assistance using our shared system
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      {basicFeatures.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-green-600" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                    <Button 
                      className="w-full" 
                      variant={selectedPlan === 'basic' ? 'default' : 'outline'}
                      onClick={() => handleSetupAI('basic')}
                      disabled={isCreating}
                    >
                      {isCreating && selectedPlan === 'basic' ? 'Setting up...' : 'Choose Standard'}
                    </Button>
                  </CardContent>
                </Card>

                {/* Premium Plan */}
                <Card className={`cursor-pointer transition-all border-2 ${selectedPlan === 'premium' ? 'ring-2 ring-orange-500 shadow-lg border-orange-200' : 'border-orange-200 hover:shadow-md hover:border-orange-300'}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Crown className="h-5 w-5 text-orange-600" />
                        <CardTitle className="text-lg text-orange-900">Premium AI</CardTitle>
                      </div>
                      <Badge className="bg-orange-100 text-orange-800">$19/month</Badge>
                    </div>
                    <CardDescription>
                      Advanced AI with persistent memory and insights
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      {premiumFeatures.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Zap className="h-4 w-4 text-orange-600" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                    <Button 
                      className="w-full bg-orange-600 hover:bg-orange-700" 
                      onClick={() => handleSetupAI('premium')}
                      disabled={isCreating}
                    >
                      {isCreating && selectedPlan === 'premium' ? 'Setting up...' : 'Choose Premium'}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-600" />
                  AI Assistant Active
                </CardTitle>
                <CardDescription>
                  Your {assistant.assistant_type} AI assistant is ready to help
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Assistant Type: {assistant.assistant_type}</p>
                    <p className="text-sm text-gray-600">Created: {new Date(assistant.created_at).toLocaleDateString()}</p>
                    {hasCustomApiKey && (
                      <p className="text-sm text-green-600">Using your custom API key</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={assistant.assistant_type === 'premium' ? 'default' : 'secondary'}>
                      {assistant.assistant_type}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDeleteOrReset}
                      disabled={isDeleting}
                      className={hasCustomApiKey ? "border-orange-200 text-orange-600 hover:bg-orange-50" : "border-red-200 text-red-600 hover:bg-red-50"}
                    >
                      {isDeleting ? (
                        "Processing..."
                      ) : hasCustomApiKey ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-1" />
                          Reset
                        </>
                      ) : (
                        <>
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="api-key" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Bring Your Own OpenAI API Key
              </CardTitle>
              <CardDescription>
                Use your own OpenAI API key to unlock premium features automatically
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="api-key">OpenAI API Key</Label>
                <Input
                  id="api-key"
                  type="password"
                  placeholder="sk-..."
                  value={customApiKey}
                  onChange={(e) => setCustomApiKey(e.target.value)}
                />
                <p className="text-sm text-gray-600">
                  Your API key is stored securely and only used for your requests
                </p>
              </div>
              <Button onClick={handleSaveApiKey} disabled={!customApiKey}>
                Save API Key
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chat" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Business Coach Chat
              </CardTitle>
              <CardDescription>
                Have a conversation with your AI business coach
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => setShowAICoaching(!showAICoaching)}
                className={`w-full ${showAICoaching ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                {showAICoaching ? 'End Chat' : 'Start Chat'}
              </Button>
            </CardContent>
          </Card>

          {/* AI Coaching Panel loads underneath the button when active */}
          {showAICoaching && (
            <AICoachingPanel
              isOpen={showAICoaching}
              onClose={() => setShowAICoaching(false)}
              onSuggestionApply={() => {
                // For general chat, we don't apply suggestions to content
                setShowAICoaching(false);
              }}
              currentContent=""
              fieldType="general"
              businessContext={{}}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
