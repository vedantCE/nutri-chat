import { Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
  image?: string;
}

export const ChatMessage = ({ role, content, isStreaming, image }: ChatMessageProps) => {
  const isUser = role === "user";

  // Parse markdown-style formatting for display
  const formatContent = (text: string) => {
    // Split by double newlines for paragraphs
    const paragraphs = text.split(/\n\n+/);
    
    return paragraphs.map((paragraph, i) => {
      // Handle bullet points with emojis
      if (paragraph.trim().startsWith('•') || paragraph.trim().startsWith('-') || /^[🔍💡🩺🤱🏃♀️👋]/.test(paragraph.trim())) {
        const items = paragraph.split('\n').filter(line => line.trim());
        return (
          <div key={i} className="space-y-2 my-3">
            {items.map((item, j) => {
              // Check if it's a header with emoji
              if (/^[🔍💡🩺🤱🏃♀️👋]/.test(item.trim()) && item.includes('**')) {
                return (
                  <div key={j} className="text-base font-semibold text-primary mb-2">
                    {formatInlineText(item)}
                  </div>
                );
              }
              return (
                <div key={j} className="text-sm leading-relaxed pl-2">
                  {formatInlineText(item.replace(/^[-•]\s*/, ''))}
                </div>
              );
            })}
          </div>
        );
      }
      
      // Handle numbered lists
      if (/^\d+\./.test(paragraph.trim())) {
        const items = paragraph.split('\n').filter(line => line.trim());
        return (
          <ol key={i} className="list-decimal list-inside space-y-1 my-2">
            {items.map((item, j) => (
              <li key={j} className="text-sm leading-relaxed">
                {formatInlineText(item.replace(/^\d+\.\s*/, ''))}
              </li>
            ))}
          </ol>
        );
      }
      
      return (
        <div key={i} className="text-sm leading-relaxed mb-2 last:mb-0">
          {formatInlineText(paragraph)}
        </div>
      );
    });
  };

  const formatInlineText = (text: string) => {
    // Handle bold text with **
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-semibold text-foreground">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <div
      className={cn(
        "flex gap-3 chat-bubble-enter",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
          isUser
            ? "bg-chat-user text-chat-user-foreground"
            : "bg-primary text-primary-foreground"
        )}
      >
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

      {/* Message Bubble */}
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-3",
          isUser
            ? "bg-chat-user text-chat-user-foreground rounded-tr-sm"
            : "bg-card border border-border shadow-soft rounded-tl-sm"
        )}
      >
        {image && (
          <div className="mb-2">
            <img 
              src={image} 
              alt="Uploaded ingredient image" 
              className="max-w-full h-auto rounded-lg border border-border"
            />
          </div>
        )}
        <div className={cn(isUser ? "text-chat-user-foreground" : "text-card-foreground")}>
          {formatContent(content)}
        </div>
        {isStreaming && (
          <span className="inline-block w-2 h-4 bg-current animate-pulse ml-1" />
        )}
      </div>
    </div>
  );
};
