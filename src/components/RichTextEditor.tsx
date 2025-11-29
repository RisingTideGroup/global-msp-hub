
import { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { AICoachingPanel } from "./AICoachingPanel";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  height?: string;
  readOnly?: boolean;
  aiCoachingType?: 'mission' | 'culture' | 'benefits' | 'general' | 'cover_letter';
  businessContext?: any;
}

export const RichTextEditor = ({ 
  value, 
  onChange, 
  placeholder = "Start typing...", 
  className,
  height = "120px",
  readOnly = false,
  aiCoachingType = 'general',
  businessContext
}: RichTextEditorProps) => {
  const [showAICoaching, setShowAICoaching] = useState(false);

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link'],
      ['clean']
    ],
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline',
    'list', 'bullet',
    'link'
  ];

  return (
    <div className={cn("rich-text-editor", className)}>
      <div className="relative">
        <ReactQuill
          theme="snow"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          readOnly={readOnly}
          modules={readOnly ? { toolbar: false } : modules}
          formats={formats}
          style={{
            minHeight: readOnly ? 'auto' : height
          }}
        />
        
        {/* AI Coaching Button */}
        {!readOnly && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowAICoaching(true)}
            className="absolute top-1 right-2 bg-white/90 hover:bg-white border-rising-blue-200 text-rising-blue-600 hover:text-rising-blue-700 z-10"
          >
            <Sparkles className="h-3 w-3 mr-1" />
            AI Coach
          </Button>
        )}
      </div>

      {/* AI Coaching Panel */}
      {showAICoaching && (
        <AICoachingPanel
          isOpen={showAICoaching}
          onClose={() => setShowAICoaching(false)}
          onSuggestionApply={(suggestion) => {
            onChange(suggestion);
            setShowAICoaching(false);
          }}
          currentContent={value}
          fieldType={aiCoachingType}
          businessContext={businessContext}
        />
      )}

      <style>
        {`
          .rich-text-editor .ql-editor {
            min-height: ${readOnly ? 'auto' : height};
          }
          .rich-text-editor .ql-container {
            border-bottom-left-radius: 0.375rem;
            border-bottom-right-radius: 0.375rem;
          }
          .rich-text-editor .ql-toolbar.ql-snow {
            border-top-left-radius: 0.375rem;
            border-top-right-radius: 0.375rem;
            padding: 10px;
          }
          .rich-text-editor .ql-editor.ql-blank::before {
            font-style: normal;
            color: #9ca3af;
          }
        `}
      </style>
    </div>
  );
};
