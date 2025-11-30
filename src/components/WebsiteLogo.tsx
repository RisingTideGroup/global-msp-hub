interface WebsiteLogoProps {
  url: string;
  alt: string;
  fallbackText: string;
  className?: string;
}

export const WebsiteLogo = ({ fallbackText, alt, className = "w-12 h-12" }: WebsiteLogoProps) => {
  return (
    <div 
      className={`${className} bg-gradient-to-br from-accent to-primary-gradient rounded-lg flex items-center justify-center text-white font-bold shadow-md`}
      aria-label={alt}
    >
      {fallbackText}
    </div>
  );
};
