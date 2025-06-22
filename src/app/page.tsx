"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, MessageSquare, Mic } from "lucide-react";
import SettingsTab from "@/components/settings-tab";
import ChatTab from "@/components/chat-tab";
import VoiceTab from "@/components/voice-tab";
import { Toaster } from "@/components/ui/toaster";

export default function Home() {
  const [context, setContext] = useState<string>("");
  const [contextSummary, setContextSummary] = useState<string>("");
  const [isContextLoading, setIsContextLoading] = useState<boolean>(false);
  const [apiKey, setApiKey] = useState<string>("");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 md:p-8 bg-background font-body">
      <div className="w-full max-w-3xl">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-headline font-bold" style={{ color: 'hsl(var(--primary))' }}>
            Gemini ContactFlow
          </h1>
          <p className="text-muted-foreground mt-2 text-base sm:text-lg">
            Your AI-powered communication hub.
          </p>
        </header>
        <Tabs defaultValue="settings" className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-12">
            <TabsTrigger value="settings" className="text-sm sm:text-base">
              <Settings className="mr-2 h-5 w-5" /> Settings
            </TabsTrigger>
            <TabsTrigger value="chat" className="text-sm sm:text-base">
              <MessageSquare className="mr-2 h-5 w-5" /> Chat
            </TabsTrigger>
            <TabsTrigger value="voice" className="text-sm sm:text-base">
              <Mic className="mr-2 h-5 w-5" /> Voice
            </TabsTrigger>
          </TabsList>
          <TabsContent value="settings" className="mt-6">
            <SettingsTab
              apiKey={apiKey}
              setApiKey={setApiKey}
              context={""}
              setContext={setContext}
              contextSummary={contextSummary}
              setContextSummary={setContextSummary}
              isContextLoading={isContextLoading}
              setIsContextLoading={setIsContextLoading}
            />
          </TabsContent>
          <TabsContent value="chat" className="mt-6">
            <ChatTab context={context || contextSummary} apiKey={apiKey} />
          </TabsContent>
          <TabsContent value="voice" className="mt-6">
            <VoiceTab context={context || contextSummary} apiKey={apiKey} />
          </TabsContent>
        </Tabs>
      </div>
      <Toaster />
    </main>
  );
}
