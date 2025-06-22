"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { summarizeContext } from "@/ai/flows/summarize-context";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type SettingsTabProps = {
    apiKey: string;
    setApiKey: (key: string) => void;
    setContext: (context: string) => void;
    contextSummary: string;
    setContextSummary: (summary: string) => void;
    isContextLoading: boolean;
    setIsContextLoading: (loading: boolean) => void;
};

export default function SettingsTab({ apiKey, setApiKey, setContext, contextSummary, setContextSummary, isContextLoading, setIsContextLoading }: SettingsTabProps) {
    const [textContext, setTextContext] = useState("");
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [fileKey, setFileKey] = useState(Date.now());
    const { toast } = useToast();

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const dataUrl = reader.result as string;
                setTextContext(""); 
                setImagePreview(dataUrl);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSetContext = async () => {
        setIsContextLoading(true);
        setContextSummary("");
        const currentContext = imagePreview || textContext;
        setContext(currentContext);

        if (currentContext) {
            try {
                const result = await summarizeContext({ context: currentContext, apiKey });
                setContextSummary(result.summary);
            } catch (error) {
                console.error("Error summarizing context:", error);
                setContextSummary("Failed to summarize context.");
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Could not summarize the provided context.",
                });
            }
        } else {
            setContextSummary("Context is empty. Ready for your questions!");
        }
        setIsContextLoading(false);
    };

    return (
        <Card className="overflow-hidden">
            <CardHeader>
                <CardTitle>Set Context</CardTitle>
                <CardDescription>Provide an API key, and text or an image as context for your conversations. You can also leave context empty.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid gap-2">
                    <Label htmlFor="api-key">Google AI API Key (Optional)</Label>
                    <Input
                        id="api-key"
                        type="password"
                        placeholder="Enter your API key to override default"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                    />
                     <p className="text-xs text-muted-foreground">
                        Your key is stored in memory and only used for this session.
                    </p>
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="text-context">Text Context</Label>
                    <Textarea
                        id="text-context"
                        placeholder="Enter any text context here..."
                        value={textContext}
                        onChange={(e) => {
                            setTextContext(e.target.value);
                            setImagePreview(null);
                            setFileKey(Date.now());
                        }}
                        rows={5}
                    />
                </div>
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">
                        Or
                        </span>
                    </div>
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="image-context">Image Context</Label>
                    <Input id="image-context" type="file" accept="image/*" onChange={handleImageUpload} key={fileKey}/>
                    {imagePreview && (
                        <div className="mt-2 rounded-md border p-2 flex justify-center bg-muted/50">
                            <img src={imagePreview} alt="Image context preview" className="rounded-md max-h-48 w-auto" />
                        </div>
                    )}
                </div>
                <Button onClick={handleSetContext} disabled={isContextLoading} className="w-full">
                    {isContextLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Set Context
                </Button>
                {contextSummary && (
                    <div className="mt-4 p-4 bg-muted rounded-md text-sm animate-in fade-in-0 duration-500">
                        <h4 className="font-semibold mb-2 text-card-foreground">Context Summary:</h4>
                        <p className="text-muted-foreground break-words">{contextSummary}</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
