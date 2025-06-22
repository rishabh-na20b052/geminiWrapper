"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { textChatCompletion } from "@/ai/flows/text-chat-completion";
import { Loader2, Send, User, Bot } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type Message = {
    sender: 'user' | 'ai';
    text: string;
};

type ChatTabProps = {
    context: string;
};

export default function ChatTab({ context }: ChatTabProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const scrollAreaViewportRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();

    useEffect(() => {
        if (scrollAreaViewportRef.current) {
            scrollAreaViewportRef.current.scrollTo({ top: scrollAreaViewportRef.current.scrollHeight, behavior: 'smooth' });
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage: Message = { sender: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        const currentInput = input;
        setInput("");
        setIsLoading(true);

        try {
            const result = await textChatCompletion({ context, message: currentInput });
            const aiMessage: Message = { sender: 'ai', text: result.response };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error("Error with text chat:", error);
            const errorMessage: Message = { sender: 'ai', text: "Sorry, I encountered an error. Please try again." };
            setMessages(prev => [...prev, errorMessage]);
            toast({
                variant: "destructive",
                title: "Chat Error",
                description: "Failed to get a response from the AI.",
            })
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="overflow-hidden">
            <CardHeader>
                <CardTitle>Text Chat</CardTitle>
                <CardDescription>Chat with the AI based on the context you've set. The conversation is not remembered.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col h-[55vh] sm:h-[60vh]">
                    <ScrollArea className="flex-1 pr-4" viewportRef={scrollAreaViewportRef}>
                        <div className="space-y-6">
                            {messages.map((msg, index) => (
                                <div
                                    key={index}
                                    className={cn(
                                        "flex items-start gap-3 animate-in fade-in-0 slide-in-from-bottom-4 duration-500",
                                        msg.sender === 'user' ? 'justify-end' : ''
                                    )}
                                >
                                    {msg.sender === 'ai' && (
                                        <Avatar className="h-8 w-8 border">
                                            <AvatarFallback className="bg-transparent"><Bot className="h-5 w-5 text-accent"/></AvatarFallback>
                                        </Avatar>
                                    )}
                                    <div className={`rounded-lg p-3 max-w-xs sm:max-w-md md:max-w-lg text-sm shadow-sm ${msg.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                        <p className="break-words">{msg.text}</p>
                                    </div>
                                     {msg.sender === 'user' && (
                                        <Avatar className="h-8 w-8 border">
                                            <AvatarFallback className="bg-transparent"><User className="h-5 w-5 text-accent" /></AvatarFallback>
                                        </Avatar>
                                    )}
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex items-start gap-3">
                                    <Avatar className="h-8 w-8 border">
                                        <AvatarFallback className="bg-transparent"><Bot className="h-5 w-5 text-accent"/></AvatarFallback>
                                    </Avatar>
                                    <div className="rounded-lg p-3 bg-muted flex items-center shadow-sm">
                                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                    </div>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                    <div className="mt-4 flex gap-2 pt-4 border-t">
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSend()}
                            placeholder="Type your message..."
                            disabled={isLoading}
                            className="text-base"
                        />
                        <Button onClick={handleSend} disabled={isLoading} size="icon" className="shrink-0">
                            <Send className="h-5 w-5" />
                            <span className="sr-only">Send</span>
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
