
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Globe } from "lucide-react";
import { BusinessProfileDisplay } from "./BusinessProfileDisplay";
import { SubscribeButton } from "./SubscribeButton";
import type { PublicBusiness } from "@/hooks/usePublicBusinesses";
import { useVisitTracking } from "@/hooks/useVisitTracking";
import { useState } from "react";

interface BusinessCardProps {
  business: PublicBusiness;
}

export const BusinessCard = ({ business }: BusinessCardProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Track visit when dialog opens
  useVisitTracking('business', dialogOpen ? business.id : undefined);
  
  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="flex-1">
        <BusinessProfileDisplay 
          business={business} 
          variant="card"
          showWebsiteButton={false}
        />
      </CardHeader>

      <CardFooter className="gap-2">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex-1 bg-rising-blue-700 hover:bg-rising-blue-800">
              View Profile
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="sr-only">Business Profile</DialogTitle>
            </DialogHeader>
            <BusinessProfileDisplay 
              business={business} 
              variant="modal"
              onWebsiteClick={() => window.open(business.website, '_blank', 'noopener noreferrer')}
            />
          </DialogContent>
        </Dialog>

        <SubscribeButton 
          businessId={business.id} 
          size="icon"
          variant="outline"
        />

        {business.website && (
          <Button 
            variant="outline" 
            size="sm"
            asChild
            className="flex items-center gap-1"
          >
            <a href={business.website} target="_blank" rel="noopener noreferrer">
              <Globe className="h-4 w-4" />
            </a>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
