import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/ImageUpload";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (message: string, imageData?: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export const ChatInput = ({ onSend, disabled, placeholder = "Ask about any food product or upload ingredient image..." }: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | undefined>();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((message.trim() || selectedImage) && !disabled) {
      onSend(message.trim() || "Analyze this ingredient image", selectedImage);
      setMessage("");
      setSelectedImage(undefined);
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleImageSelect = (imageData: string) => {
    setSelectedImage(imageData);
  };

  const handleRemoveImage = () => {
    setSelectedImage(undefined);
  };

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
    }
  }, [message]);

  return (
    <form onSubmit={handleSubmit} className="relative space-y-2">
      {selectedImage && (
        <div className="flex justify-center">
          <ImageUpload 
            onImageSelect={handleImageSelect}
            onRemoveImage={handleRemoveImage}
            selectedImage={selectedImage}
          />
        </div>
      )}
      
      <div className="flex items-end gap-2 p-2 bg-card border border-border rounded-2xl shadow-soft focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/50 transition-all">
        <div className="flex flex-col gap-2 flex-1">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className={cn(
              "flex-1 resize-none bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none",
              "max-h-[150px] min-h-[44px]",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          />
          
          {!selectedImage && (
            <div className="px-3 pb-2">
              <ImageUpload 
                onImageSelect={handleImageSelect}
                onRemoveImage={handleRemoveImage}
              />
            </div>
          )}
        </div>
        
        <Button
          type="submit"
          size="icon"
          disabled={disabled || (!message.trim() && !selectedImage)}
          className={cn(
            "h-10 w-10 rounded-xl shrink-0 transition-all",
            (message.trim() || selectedImage)
              ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-md" 
              : "bg-muted text-muted-foreground"
          )}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
};
