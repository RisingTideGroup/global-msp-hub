
import { cn } from "@/lib/utils";
import DOMPurify from "dompurify";

interface RichTextDisplayProps {
  content: string;
  fallback?: string;
  className?: string;
}

export const RichTextDisplay = ({ content, fallback, className }: RichTextDisplayProps) => {
  const displayContent = content || fallback || "";
  
  // If content has HTML tags, render as HTML, otherwise render as plain text
  const hasHtmlTags = /<[^>]*>/g.test(displayContent);
  
  if (hasHtmlTags) {
    // Sanitize HTML content to prevent XSS attacks
    const sanitizedContent = DOMPurify.sanitize(displayContent, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'a'],
      ALLOWED_ATTR: ['href', 'target', 'rel'],
      ALLOWED_URI_REGEXP: /^https?:\/\//
    });
    
    // Add security attributes to all links after sanitization
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = sanitizedContent;
    const links = tempDiv.querySelectorAll('a');
    links.forEach(link => {
      link.setAttribute('rel', 'noopener noreferrer nofollow');
      link.setAttribute('target', '_blank');
    });
    const finalContent = tempDiv.innerHTML;
    
    return (
      <div 
        className={cn("prose prose-sm max-w-none", className)}
        dangerouslySetInnerHTML={{ __html: finalContent }}
      />
    );
  }
  
  return (
    <div className={cn("whitespace-pre-wrap", className)}>
      {displayContent}
    </div>
  );
};
