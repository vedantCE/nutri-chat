import { useState, useRef, useEffect, useCallback } from "react";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { TypingIndicator } from "./TypingIndicator";
import { WelcomeMessage } from "./WelcomeMessage";
import { toast } from "@/hooks/use-toast";
import { geminiService, ChatMessage as GeminiChatMessage } from "@/services/geminiService";

interface Message {
  role: "user" | "assistant";
  content: string;
  image?: string;
}

export const ChatContainer = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const streamChat = useCallback(async (userMessage: string, imageData?: string) => {
    const userMsg: Message = { role: "user", content: userMessage, image: imageData };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      // Convert messages to Gemini format
      const conversationHistory: GeminiChatMessage[] = messages.map((msg, index) => ({
        id: index.toString(),
        role: msg.role,
        content: msg.content,
        timestamp: new Date(),
        image: msg.image
      }));

      // Get AI response
      const response = await geminiService.generateResponse(userMessage, conversationHistory, imageData);
      
      // Add assistant response
      setMessages(prev => [...prev, { role: "assistant", content: response }]);
      setIsLoading(false);

    } catch (error) {
      console.error("Chat error:", error);
      setIsLoading(false);
      
      toast({
        title: "Unable to get response",
        description: "Please try again in a moment.",
        variant: "destructive",
      });
    }
  }, [messages]);

  const handleSend = useCallback((message: string, imageData?: string) => {
    if (message.trim() || imageData) {
      streamChat(message, imageData);
    }
  }, [streamChat]);

  const handleSuggestionSelect = useCallback((suggestion: string) => {
    handleSend(suggestion);
  }, [handleSend]);

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto chat-scroll px-4 py-6"
      >
        <div className="container max-w-3xl mx-auto">
          {messages.length === 0 ? (
            <WelcomeMessage onSuggestionSelect={handleSuggestionSelect} />
          ) : (
            <div className="space-y-4">
              {messages.map((message, index) => (
                <ChatMessage
                  key={index}
                  role={message.role}
                  content={message.content}
                  image={message.image}
                  isStreaming={
                    isLoading &&
                    index === messages.length - 1 &&
                    message.role === "assistant"
                  }
                />
              ))}
              {isLoading && messages[messages.length - 1]?.role === "user" && (
                <TypingIndicator />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-border bg-card/50 backdrop-blur-lg">
        <div className="container max-w-3xl mx-auto px-4 py-4">
          <ChatInput onSend={handleSend} disabled={isLoading} />
          <p className="text-xs text-muted-foreground text-center mt-2">
            NutriChat provides educational information only. Always consult a healthcare professional for medical advice.
          </p>
        </div>
      </div>
    </div>
  );
};
