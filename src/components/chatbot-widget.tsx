
"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, X, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { customerSupportChatbot } from "@/ai/flows/customer-support-chatbot";
import { ScrollArea } from "@/components/ui/scroll-area";

type Message = {
  role: "bot" | "user";
  text: string;
};

export function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { role: "bot", text: "Hello! I'm your Nexa Virtual Assistant. How can I help you today?" }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input;
    setInput("");
    setMessages(prev => [...prev, { role: "user", text: userMsg }]);
    setIsLoading(true);

    try {
      const result = await customerSupportChatbot({ query: userMsg });
      setMessages(prev => [...prev, { role: "bot", text: result.response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: "bot", text: "I'm sorry, I'm having trouble connecting right now. Please try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen && (
        <Button 
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full shadow-2xl bg-accent hover:bg-accent/90"
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      )}

      {isOpen && (
        <Card className="w-[350px] sm:w-[400px] h-[500px] flex flex-col shadow-2xl border-primary/20 animate-in slide-in-from-bottom-4">
          <CardHeader className="bg-primary text-white flex flex-row items-center justify-between p-4 rounded-t-lg">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              <CardTitle className="text-sm font-semibold">Nexa Support</CardTitle>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-white hover:bg-white/10 h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden p-0">
            <ScrollArea className="h-full p-4" ref={scrollRef}>
              <div className="space-y-4">
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl p-3 text-sm ${
                      m.role === 'user' 
                      ? 'bg-primary text-white rounded-br-none' 
                      : 'bg-muted text-foreground rounded-bl-none'
                    }`}>
                      {m.text}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-2xl p-3 text-sm rounded-bl-none animate-pulse">
                      Typing...
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
          <CardFooter className="p-4 border-t">
            <div className="flex w-full gap-2">
              <Input 
                placeholder="Type your message..." 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                className="flex-1"
              />
              <Button size="icon" onClick={handleSend} disabled={isLoading || !input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
