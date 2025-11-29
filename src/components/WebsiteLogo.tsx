import { useState } from "react";

interface WebsiteLogoProps {
  url: string;
  alt: string;
  fallbackText: string;
  className?: string;
}

export const WebsiteLogo = ({ url, alt, fallbackText, className = "w-12 h-12" }: WebsiteLogoProps) => {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  // Extract domain from URL for logo.dev API
  const getDomain = (urlString: string) => {
    try {
      const urlObj = new URL(urlString.startsWith('http') ? urlString : `https://${urlString}`);
      return urlObj.hostname.replace('www.', '');
    } catch {
      return urlString;
    }
  };

  const domain = getDomain(url);
  const logoUrl = `https://img.logo.dev/${domain}?token=pk_X-r7p09qT92AkPUPjkL9-Q`;

  if (error) {
    return (
      <div className={`${className} bg-gradient-to-br from-accent to-primary-gradient rounded-lg flex items-center justify-center`}>
        <span className="text-white font-bold text-sm">{fallbackText}</span>
      </div>
    );
  }

  return (
    <img
      src={logoUrl}
      alt={alt}
      className={`${className} rounded-lg object-cover`}
      onLoad={() => setLoading(false)}
      onError={() => setError(true)}
    />
  );
};
