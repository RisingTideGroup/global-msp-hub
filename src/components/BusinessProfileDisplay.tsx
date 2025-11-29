
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building, MapPin, Users, Globe, Heart, ExternalLink } from "lucide-react";
import { RichTextDisplay } from "./RichTextDisplay";
import { SubscribeButton } from "./SubscribeButton";
import type { PublicBusiness } from "@/hooks/usePublicBusinesses";

interface BusinessProfileDisplayProps {
  business: PublicBusiness;
  variant?: "card" | "modal";
  showWebsiteButton?: boolean;
  onWebsiteClick?: () => void;
}

export const BusinessProfileDisplay = ({ 
  business, 
  variant = "modal",
  showWebsiteButton = true,
  onWebsiteClick
}: BusinessProfileDisplayProps) => {
  const isCard = variant === "card";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        {business.logo_url ? (
          <img 
            src={business.logo_url} 
            alt={`${business.name} logo`}
            className={`${isCard ? 'w-16 h-16' : 'w-20 h-20'} rounded-xl object-cover flex-shrink-0`}
          />
        ) : (
          <div className={`${isCard ? 'w-16 h-16' : 'w-20 h-20'} bg-gradient-to-br from-rising-blue-600 to-rising-orange-600 rounded-xl flex items-center justify-center flex-shrink-0`}>
            <Building className={`${isCard ? 'h-8 w-8' : 'h-10 w-10'} text-white`} />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h1 className={`${isCard ? 'text-xl' : 'text-3xl'} font-bold text-slate-800 mb-2`}>
            {business.name}
          </h1>
          <div className="flex flex-wrap gap-2 mb-3">
            {business.industry && (
              <Badge variant="secondary">{business.industry}</Badge>
            )}
            {business.company_size && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {business.company_size}
              </Badge>
            )}
            {/* Display business classifications */}
            {business.business_classifications?.map((classification, index) => (
              <Badge 
                key={index} 
                variant="outline" 
                className="bg-rising-blue-50 text-rising-blue-700 border-rising-blue-200"
              >
                {classification.classification_value}
              </Badge>
            ))}
          </div>
          {business.location && (
            <div className="flex items-center gap-2 text-slate-600 mb-3">
              <MapPin className="h-4 w-4" />
              <span>{business.location}</span>
            </div>
          )}
          <div className="flex gap-2">
            {showWebsiteButton && business.website && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={onWebsiteClick}
                className="flex items-center gap-2"
              >
                <Globe className="h-4 w-4" />
                Visit Website
                <ExternalLink className="h-3 w-3" />
              </Button>
            )}
            {!isCard && (
              <SubscribeButton 
                businessId={business.id}
                size="sm"
              />
            )}
          </div>
        </div>
      </div>

      {/* Show description in card variant, full content in modal variant */}
      {isCard ? (
        <>
          {/* Brief description for card */}
          {(business.description_rich || business.description) && (
            <div className="text-slate-600 text-sm leading-relaxed line-clamp-3">
              <RichTextDisplay 
                content={business.description_rich || ""} 
                fallback={business.description || ""} 
                className="text-slate-600 leading-relaxed" 
              />
            </div>
          )}
        </>
      ) : (
        <>
          {/* About Section */}
          {(business.description_rich || business.description) && (
            <div>
              <h3 className="text-xl font-semibold text-slate-800 mb-3">About</h3>
              <RichTextDisplay 
                content={business.description_rich || ""} 
                fallback={business.description || ""} 
                className="text-slate-600 leading-relaxed" 
              />
            </div>
          )}

          {/* Mission Section */}
          {(business.mission_rich || business.mission) && (
            <div>
              <h3 className="text-xl font-semibold text-slate-800 mb-3">Mission</h3>
              <RichTextDisplay 
                content={business.mission_rich || ""} 
                fallback={business.mission || ""} 
                className="text-slate-600 leading-relaxed" 
              />
            </div>
          )}

          {/* Culture Section */}
          {(business.culture_rich || business.culture) && (
            <div>
              <h3 className="text-xl font-semibold text-slate-800 mb-3">Culture</h3>
              <RichTextDisplay 
                content={business.culture_rich || ""} 
                fallback={business.culture || ""} 
                className="text-slate-600 leading-relaxed" 
              />
            </div>
          )}

          {/* Values Section */}
          {business.values && business.values.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Heart className="h-5 w-5 text-rising-orange-600" />
                <h3 className="text-xl font-semibold text-slate-800">Values</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {business.values.map((value, index) => (
                  <Badge key={index} variant="outline" className="text-sm py-1 px-3">
                    {value}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Benefits Section */}
          {(business.benefits_rich || business.benefits) && (
            <div>
              <h3 className="text-xl font-semibold text-slate-800 mb-3">Benefits</h3>
              <RichTextDisplay 
                content={business.benefits_rich || ""} 
                fallback={business.benefits || ""} 
                className="text-slate-600 leading-relaxed" 
              />
            </div>
          )}

          {/* Additional Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600 pt-4 border-t">
            {business.website && (
              <div>
                <strong>Website:</strong> 
                <a href={business.website} target="_blank" rel="noopener noreferrer" className="text-rising-blue-600 hover:underline ml-1">
                  {business.website}
                </a>
              </div>
            )}
            {business.careers_page_url && (
              <div>
                <strong>Careers:</strong> 
                <a href={business.careers_page_url} target="_blank" rel="noopener noreferrer" className="text-rising-blue-600 hover:underline ml-1">
                  View Jobs
                </a>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
