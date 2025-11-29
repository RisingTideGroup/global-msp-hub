
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, Zap, Crown } from "lucide-react";
import { useCreateAIAssistant } from "@/hooks/useAIAssistant";

interface AISetupStepProps {
  businessData: {
    name: string;
    industry: string;
    company_size: string;
    location: string;
    description: string;
  };
  businessId?: string;
  onNext: () => void;
  onSkip: () => void;
}

export const AISetupStep = ({ businessData, businessId, onNext, onSkip }: AISetupStepProps) => {
  const [selectedPlan, setSelectedPlan] = useState<'basic' | 'premium' | null>(null);
  const { mutate: createAssistant, isPending } = useCreateAIAssistant();

  const handleSetupAI = (assistantType: 'basic' | 'premium') => {
    if (!businessId) {
      onSkip();
      return;
    }

    setSelectedPlan(assistantType);
    createAssistant({
      businessId,
      assistantType,
      businessContext: businessData
    }, {
      onSuccess: () => {
        onNext();
      }
    });
  };

  const basicFeatures = [
    "Contextual help for each form field",
    "Business-specific suggestions",
    "Real-time guidance",
    "Session-based conversations"
  ];

  const premiumFeatures = [
    "Persistent AI coach that remembers everything",
    "Continuous learning about your business",
    "Cross-session conversation history",
    "Advanced business strategy insights",
    "Unlimited coaching sessions",
    "Priority support"
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Choose Your AI Business Coach</h2>
        <p className="text-lg text-gray-600">
          Get personalized guidance tailored to {businessData.name}'s unique needs
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Basic Plan */}
        <Card className={`cursor-pointer transition-all ${selectedPlan === 'basic' ? 'ring-2 ring-rising-blue-500 shadow-lg' : 'hover:shadow-md'}`}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-rising-blue-600" />
                <CardTitle>Basic AI Coach</CardTitle>
              </div>
              <Badge variant="secondary">Free</Badge>
            </div>
            <CardDescription>
              Smart assistance for filling out your business profile
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
              className="w-full bg-rising-blue-600 hover:bg-rising-blue-700" 
              variant={selectedPlan === 'basic' ? 'default' : 'outline'}
              onClick={() => handleSetupAI('basic')}
              disabled={isPending}
            >
              {isPending && selectedPlan === 'basic' ? 'Setting up...' : 'Choose Basic'}
            </Button>
          </CardContent>
        </Card>

        {/* Premium Plan */}
        <Card className={`cursor-pointer transition-all border-2 ${selectedPlan === 'premium' ? 'ring-2 ring-rising-orange-500 shadow-lg border-rising-orange-200' : 'border-rising-orange-200 hover:shadow-md hover:border-rising-orange-300'}`}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Crown className="h-6 w-6 text-rising-orange-600" />
                <CardTitle className="text-rising-orange-900">Premium AI Coach</CardTitle>
              </div>
              <Badge className="bg-rising-orange-100 text-rising-orange-800">Coming Soon</Badge>
            </div>
            <CardDescription>
              Your persistent AI business coach that grows with your company
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {premiumFeatures.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-rising-orange-600" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
            <Button 
              className="w-full bg-rising-orange-600 hover:bg-rising-orange-700" 
              onClick={() => handleSetupAI('premium')}
              disabled={isPending}
            >
              {isPending && selectedPlan === 'premium' ? 'Setting up...' : 'Choose Premium - $19/month'}
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="text-center">
        <Button variant="ghost" onClick={onSkip} disabled={isPending}>
          Skip AI Setup for Now
        </Button>
      </div>
    </div>
  );
};
