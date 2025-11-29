import { Button } from "@/components/ui/button";
import { Bell, BellOff } from "lucide-react";
import { useBusinessSubscription } from "@/hooks/useBusinessSubscription";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface SubscribeButtonProps {
  businessId: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  showText?: boolean;
}

export const SubscribeButton = ({ 
  businessId, 
  variant = "outline", 
  size = "default",
  showText = true 
}: SubscribeButtonProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { 
    isSubscribed, 
    isLoading, 
    subscribe, 
    unsubscribe, 
    isSubscribing, 
    isUnsubscribing 
  } = useBusinessSubscription(businessId);

  const handleClick = () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (isSubscribed) {
      unsubscribe();
    } else {
      subscribe();
    }
  };

  const isProcessing = isSubscribing || isUnsubscribing || isLoading;

  if (size === "icon") {
    return (
      <Button
        variant={variant}
        size="icon"
        onClick={handleClick}
        disabled={isProcessing}
        title={isSubscribed ? "Unsubscribe from notifications" : "Subscribe for job alerts"}
      >
        {isSubscribed ? (
          <BellOff className="h-4 w-4" />
        ) : (
          <Bell className="h-4 w-4" />
        )}
      </Button>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      disabled={isProcessing}
    >
      {isSubscribed ? (
        <>
          <BellOff className="h-4 w-4 mr-2" />
          {showText && "Unsubscribe"}
        </>
      ) : (
        <>
          <Bell className="h-4 w-4 mr-2" />
          {showText && "Get Job Alerts"}
        </>
      )}
    </Button>
  );
};