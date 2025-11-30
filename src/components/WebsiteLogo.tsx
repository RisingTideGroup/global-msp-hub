import { useState } from "react";

interface WebsiteLogoProps {
  url: string;
  alt: string;
  fallbackText: string;
  className?: string;
}

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
  // Use Google's favicon service for reliable logo fetching
  const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;

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
      src={faviconUrl}
      alt={alt}
      className={`${className} rounded-lg shadow-md object-cover bg-white`}
      onError={() => setImageError(true)}
      loading="lazy"
    />
  );
};
