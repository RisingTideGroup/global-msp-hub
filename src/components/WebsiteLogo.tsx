import { useState } from "react";

interface WebsiteLogoProps {
  url: string;
  alt: string;
  fallbackText: string;
  className?: string;
}

const LOGO_DEV_API_KEY = "pk_Ho3VARt2TfSvUb9s1iabQA";

export const WebsiteLogo = ({ url, alt, fallbackText, className = "w-12 h-12" }: WebsiteLogoProps) => {
  const [imageError, setImageError] = useState(false);
  
  // Extract domain from URL
  const getDomain = (urlString: string) => {
    try {
      const urlObj = new URL(urlString);
      return urlObj.hostname;
    } catch {
      return urlString;
    }
  };
  
  const domain = getDomain(url);
  // Use logo.dev API for high-quality logo fetching
  const logoUrl = `https://img.logo.dev/${domain}?token=${LOGO_DEV_API_KEY}&size=200`;

  if (imageError) {
    return (
      <div 
        className={`${className} bg-gradient-to-br from-accent to-primary-gradient rounded-lg flex items-center justify-center text-white font-bold shadow-md`}
        aria-label={alt}
      >
        {fallbackText}
      </div>
    );
  }

  return (
    <img
      src={logoUrl}
      alt={alt}
      className={`${className} rounded-lg shadow-md object-cover bg-white`}
      onError={() => setImageError(true)}
      loading="lazy"
    />
  );
};
