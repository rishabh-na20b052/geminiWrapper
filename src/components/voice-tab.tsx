"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { voiceChatCompletion } from "@/ai/flows/voice-chat-completion";
import { Loader2, Volume2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type VoiceTabProps = {
    context: string;
    apiKey: string;
};

export default function VoiceTab({ context, apiKey }: VoiceTabProps) {
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement>(null);
    const { toast } = useToast();

    useEffect(() => {
        if (audioUrl && audioRef.current) {
            audioRef.current.play().catch(e => {
                console.error("Audio playback failed:", e);
                toast({
                    variant: "destructive",
                    title: "Audio Error",
                    description: "Could not play the audio response.",
                });
            });
        }
    }, [audioUrl, toast]);

    const handleSpeak = async () => {
        if (!input.trim()) return;
        setIsLoading(true);
        setAudioUrl(null);

        try {
            const result = await voiceChatCompletion({ context: context, query: input, apiKey });
            setAudioUrl(result.media);
        } catch (error) {
            console.error("Error with voice chat:", error);
            toast({
                variant: "destructive",
                title: "Voice Generation Error",
                description: "Failed to generate a voice response.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="overflow-hidden">
            <CardHeader>
                <CardTitle>Voice Chat</CardTitle>
                <CardDescription>Type your message and receive a voice response from the AI.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex gap-2">
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSpeak()}
                        placeholder="What should the AI say?"
                        disabled={isLoading}
                        className="text-base"
                    />
                    <Button onClick={handleSpeak} disabled={isLoading} className="shrink-0">
                        {isLoading ? <Loader2 className="mr-0 sm:mr-2 h-4 w-4 animate-spin" /> : <Volume2 className="mr-0 sm:mr-2 h-4 w-4" />}
                        <span className="hidden sm:inline">Speak</span>
                    </Button>
                </div>
                
                {isLoading && (
                    <div className="flex items-center justify-center p-8 rounded-md bg-muted animate-in fade-in-0 duration-500">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="ml-4 text-muted-foreground">Generating audio...</p>
                    </div>
                )}
                
                {audioUrl && !isLoading && (
                    <div className="mt-4 p-4 rounded-md bg-muted animate-in fade-in-0 duration-500">
                        <h4 className="font-semibold mb-3 text-card-foreground">AI Response</h4>
                        <audio ref={audioRef} src={audioUrl} controls className="w-full">
                            Your browser does not support the audio element.
                        </audio>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
