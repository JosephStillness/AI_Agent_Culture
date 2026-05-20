import { useEffect, useMemo, useRef, useState } from "react";
import {
  BookOpenText,
  Bot,
  CalendarDays,
  Database,
  Loader2,
  MapPin,
  MessageCircle,
  Plus,
  Send,
  Sparkles,
  Trash2,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import MqEvents from "@/components/MqEvents";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

const quickPrompts = [
  "How can I avoid cultural misunderstanding in group work?",
  "I feel isolated at MQ. What can help me connect with people?",
  "How should the culture chatbot avoid stereotypes?",
  "What should I do if direct feedback feels awkward?",
];

const emptyKnowledgeForm = {
  title: "",
  category: "culture",
  content: "",
};

function apiUrl(path) {
  return `${API_BASE_URL}${path}`;
}

function MetricTile({ icon: Icon, label, value }) {
  return (
    <div className="rounded-lg border border-white/15 bg-white/10 p-4">
      <div className="mb-3 flex items-center gap-2 text-primary-foreground/70">
        <Icon className="size-4" aria-hidden="true" />
        <span className="text-xs font-semibold uppercase">{label}</span>
      </div>
      <strong className="text-3xl leading-none">{value}</strong>
    </div>
  );
}

function MessageBubble({ message }) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "max-w-[min(88%,42rem)] rounded-lg border px-4 py-3 shadow-xs",
        isUser
          ? "self-end border-primary bg-primary text-primary-foreground"
          : "self-start border-secondary bg-secondary text-secondary-foreground"
      )}
    >
      <p className="whitespace-pre-line text-sm leading-6">{message.text}</p>
    </div>
  );
}

function App() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text:
        "Hi, I am Global Guide. Ask me about MQ student culture, cultural misunderstanding, belonging, group work, or responsible culture-chatbot behaviour.",
    },
  ]);
  const [messageInput, setMessageInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatError, setChatError] = useState("");
  const [knowledgeEntries, setKnowledgeEntries] = useState([]);
  const [knowledgeForm, setKnowledgeForm] = useState(emptyKnowledgeForm);
  const [isKnowledgeLoading, setIsKnowledgeLoading] = useState(false);
  const [knowledgeError, setKnowledgeError] = useState("");
  const chatWindowRef = useRef(null);

  const knowledgeCount = knowledgeEntries.length;
  const cultureCount = useMemo(
    () => knowledgeEntries.filter((entry) => entry.category?.toLowerCase() === "culture").length,
    [knowledgeEntries]
  );

  useEffect(() => {
    fetchKnowledge();
  }, []);

  useEffect(() => {
    const chatWindow = chatWindowRef.current;
    if (chatWindow) {
      chatWindow.scrollTop = chatWindow.scrollHeight;
    }
  }, [messages, isChatLoading]);

  async function fetchKnowledge() {
    setKnowledgeError("");
    try {
      const response = await fetch(apiUrl("/api/knowledge"));
      if (!response.ok) {
        throw new Error("Could not load knowledge base.");
      }
      const data = await response.json();
      setKnowledgeEntries(data);
    } catch (error) {
      setKnowledgeError(error.message);
    }
  }

  async function sendMessage(text) {
    const trimmedText = text.trim();
    if (!trimmedText || isChatLoading) {
      return;
    }

    setMessages((current) => [...current, { role: "user", text: trimmedText }]);
    setMessageInput("");
    setChatError("");
    setIsChatLoading(true);

    try {
      const response = await fetch(apiUrl("/api/chat"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: trimmedText }),
      });

      if (!response.ok) {
        throw new Error("AI service unavailable");
      }

      const data = await response.json();
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          text: data.reply || "I don't have information about that yet.",
        },
      ]);
    } catch (error) {
      setChatError(error.message);
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          text: "AI service unavailable. Please check the backend, database, and OpenAI API key.",
        },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  }

  async function addKnowledge(event) {
    event.preventDefault();
    setKnowledgeError("");

    const payload = {
      title: knowledgeForm.title.trim(),
      category: knowledgeForm.category.trim() || "culture",
      content: knowledgeForm.content.trim(),
    };

    if (!payload.title || !payload.content) {
      setKnowledgeError("Title and content are required.");
      return;
    }

    setIsKnowledgeLoading(true);
    try {
      const response = await fetch(apiUrl("/api/knowledge"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Could not add knowledge entry.");
      }

      const createdEntry = await response.json();
      setKnowledgeEntries((current) => [createdEntry, ...current]);
      setKnowledgeForm(emptyKnowledgeForm);
    } catch (error) {
      setKnowledgeError(error.message);
    } finally {
      setIsKnowledgeLoading(false);
    }
  }

  async function deleteKnowledge(id) {
    setKnowledgeError("");
    try {
      const response = await fetch(apiUrl(`/api/knowledge/${id}`), {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Could not delete knowledge entry.");
      }

      setKnowledgeEntries((current) => current.filter((entry) => entry.id !== id));
    } catch (error) {
      setKnowledgeError(error.message);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex min-h-[72px] max-w-[1220px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <a className="flex items-center gap-3" href="#chat" aria-label="Global Guide home">
            <span className="grid size-10 place-items-center rounded-lg bg-primary text-sm font-black text-primary-foreground shadow-sm">
              GG
            </span>
            <span className="grid leading-tight">
              <strong className="text-sm font-extrabold sm:text-base">Global Guide</strong>
              <small className="text-xs text-muted-foreground">MQ culture chatbot</small>
            </span>
          </a>
          <nav className="flex items-center gap-1" aria-label="Page navigation">
            <Button variant="ghost" size="sm" asChild>
              <a href="#chat">
                <MessageCircle aria-hidden="true" />
                Chat
              </a>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <a href="#events">
                <CalendarDays aria-hidden="true" />
                Events
              </a>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <a href="#knowledge">
                <Database aria-hidden="true" />
                Knowledge
              </a>
            </Button>
          </nav>
        </div>
      </header>

      <main>
        <section id="chat" className="relative isolate overflow-hidden border-b bg-primary">
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(8,45,42,0.9),rgba(8,45,42,0.7)_44%,rgba(8,45,42,0.28)),url('/mq-campus-courtyard.jpg')] bg-cover bg-center"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_12%,rgba(255,255,255,0.18),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.22))]"
          />
          <div className="mx-auto grid min-h-[calc(100vh-72px)] max-w-[1220px] gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[0.86fr_1.14fr] lg:px-8">
            <Card className="justify-between border-white/20 bg-primary/80 p-0 text-primary-foreground shadow-2xl shadow-primary/25 backdrop-blur-md">
              <CardHeader className="gap-4 p-6 sm:p-8">
                <div className="flex flex-wrap gap-2">
                  <Badge className="w-fit border-white/15 bg-white/15 text-white" variant="outline">
                    <Sparkles aria-hidden="true" />
                    AI Agent Culture
                  </Badge>
                  <Badge className="w-fit border-white/15 bg-white/15 text-white" variant="outline">
                    <MapPin aria-hidden="true" />
                    Macquarie University
                  </Badge>
                </div>
              <div className="space-y-4">
                <h1 className="max-w-[12ch] text-4xl font-black leading-[1.03] tracking-normal sm:text-5xl">
                  Chat with a culture-only MQ student support bot.
                </h1>
                <CardDescription className="max-w-prose text-base leading-7 text-primary-foreground/78">
                  Answers stay inside your database knowledge base: culture, belonging, student life, group work, and
                  responsible chatbot behaviour.
                </CardDescription>
              </div>
              </CardHeader>
              <CardContent className="grid gap-4 p-6 pt-0 sm:p-8 sm:pt-0">
              <div className="grid grid-cols-2 gap-3">
                <MetricTile icon={BookOpenText} label="Total entries" value={knowledgeCount} />
                <MetricTile icon={Users} label="Culture entries" value={cultureCount} />
              </div>
              <div className="rounded-lg border border-white/15 bg-white/10 p-4">
                <div className="mb-2 flex items-center gap-2 font-semibold">
                  <Bot className="size-4" aria-hidden="true" />
                  Culture scope
                </div>
                <p className="text-sm leading-6 text-primary-foreground/76">
                  Cultural misunderstanding, isolation, making friends, communication norms, respectful group work, and
                  avoiding stereotypes.
                </p>
              </div>
              </CardContent>
            </Card>

            <Card className="flex min-h-[660px] overflow-hidden bg-card/96 p-0 shadow-2xl shadow-foreground/20 backdrop-blur">
            <div className="flex items-center justify-between gap-4 border-b bg-primary px-5 py-4 text-primary-foreground">
              <div className="flex items-center gap-3">
                <span className="size-2.5 rounded-full bg-emerald-300 shadow-[0_0_0_5px_rgba(110,231,183,0.18)]" />
                <strong>Global Guide</strong>
              </div>
              <Badge className="border-white/15 bg-white/15 text-white" variant="outline">
                OpenAI + knowledge base
              </Badge>
            </div>

            <div
              className="flex flex-1 flex-col gap-3 overflow-y-auto bg-muted/50 p-4 sm:max-h-[520px] sm:p-5"
              ref={chatWindowRef}
            >
              {messages.map((message, index) => (
                <MessageBubble message={message} key={`${message.role}-${index}`} />
              ))}
              {isChatLoading && (
                <div className="flex max-w-[min(88%,42rem)] items-center gap-2 self-start rounded-lg border border-secondary bg-secondary px-4 py-3 text-sm text-secondary-foreground shadow-xs">
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Thinking from the MQ culture knowledge base...
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-2 border-t bg-card p-4 sm:grid-cols-2" aria-label="Quick prompts">
              {quickPrompts.map((prompt) => (
                <Button
                  className="h-auto min-h-12 justify-start whitespace-normal px-3 py-3 text-left text-xs sm:text-sm"
                  disabled={isChatLoading}
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
                  type="button"
                  variant="secondary"
                >
                  <Sparkles className="mt-0.5 text-primary" aria-hidden="true" />
                  <span>{prompt}</span>
                </Button>
              ))}
            </div>

            <form
              className="grid gap-2 border-t bg-card p-4 sm:grid-cols-[1fr_auto]"
              onSubmit={(event) => {
                event.preventDefault();
                sendMessage(messageInput);
              }}
            >
              <label className="sr-only" htmlFor="messageInput">
                Ask Global Guide
              </label>
              <Input
                className="h-12"
                id="messageInput"
                onChange={(event) => setMessageInput(event.target.value)}
                placeholder="Ask about MQ culture, belonging, group work..."
                value={messageInput}
              />
              <Button className="h-12" disabled={isChatLoading} size="lg" type="submit" variant="warm">
                {isChatLoading ? <Loader2 className="animate-spin" aria-hidden="true" /> : <Send aria-hidden="true" />}
                Send
              </Button>
            </form>
            {chatError && <p className="px-4 pb-4 text-sm font-semibold text-destructive">{chatError}</p>}
            </Card>
          </div>
          <a
            className="absolute bottom-2 right-3 hidden rounded-md bg-black/35 px-2 py-1 text-[11px] font-medium text-white/80 backdrop-blur-sm transition-colors hover:text-white sm:block"
            href="https://commons.wikimedia.org/wiki/File:Macquarie_University_Central_Courtyard.jpg"
            rel="noreferrer"
            target="_blank"
          >
            Campus photo: Wikimedia Commons
          </a>
        </section>

        <MqEvents apiUrl={apiUrl} />

        <section id="knowledge" className="mx-auto max-w-[1180px] px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-8 max-w-3xl space-y-3">
            <Badge variant="warm">
              <Database aria-hidden="true" />
              Knowledge Base
            </Badge>
            <h2 className="text-3xl font-black leading-tight tracking-normal sm:text-4xl">
              Control what the chatbot knows.
            </h2>
            <p className="text-base leading-7 text-muted-foreground">
              Add concise culture-focused entries. The backend retrieves records and passes that context into OpenAI.
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-[minmax(300px,0.58fr)_minmax(420px,1fr)]">
            <Card className="h-fit p-0">
              <CardHeader className="p-6">
                <CardTitle className="flex items-center gap-2">
                  <Plus className="size-5 text-primary" aria-hidden="true" />
                  Add culture knowledge
                </CardTitle>
                <CardDescription>Keep entries specific, grounded, and culture-only.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <form className="grid gap-4" onSubmit={addKnowledge}>
                  <label className="grid gap-2 text-sm font-semibold text-secondary-foreground">
                    Title
                    <Input
                      onChange={(event) => setKnowledgeForm({ ...knowledgeForm, title: event.target.value })}
                      placeholder="e.g. Respectful group feedback"
                      value={knowledgeForm.title}
                    />
                  </label>
                  <label className="grid gap-2 text-sm font-semibold text-secondary-foreground">
                    Category
                    <Input
                      onChange={(event) => setKnowledgeForm({ ...knowledgeForm, category: event.target.value })}
                      placeholder="culture"
                      value={knowledgeForm.category}
                    />
                  </label>
                  <label className="grid gap-2 text-sm font-semibold text-secondary-foreground">
                    Content
                    <Textarea
                      onChange={(event) => setKnowledgeForm({ ...knowledgeForm, content: event.target.value })}
                      placeholder="Write a culture-only knowledge entry for the chatbot..."
                      rows={7}
                      value={knowledgeForm.content}
                    />
                  </label>
                  <Button disabled={isKnowledgeLoading} size="lg" type="submit" variant="warm">
                    {isKnowledgeLoading ? <Loader2 className="animate-spin" aria-hidden="true" /> : <Plus aria-hidden="true" />}
                    {isKnowledgeLoading ? "Saving..." : "Add knowledge"}
                  </Button>
                  {knowledgeError && <p className="text-sm font-semibold text-destructive">{knowledgeError}</p>}
                </form>
              </CardContent>
            </Card>

            <div className="grid gap-3" aria-label="Knowledge entries">
              {knowledgeEntries.length === 0 ? (
                <Card className="border-dashed p-0">
                  <CardContent className="p-6">
                    <h3 className="mb-2 text-lg font-semibold">No knowledge yet</h3>
                    <p className="text-sm leading-6 text-muted-foreground">
                      Add culture content so Global Guide has something to answer from.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                knowledgeEntries.map((entry) => (
                  <Card className="gap-4 p-0" key={entry.id}>
                    <CardHeader className="p-5 pb-0">
                      <div className="flex items-start justify-between gap-3">
                        <Badge variant="secondary">{entry.category || "culture"}</Badge>
                        <Button
                          aria-label={`Delete ${entry.title}`}
                          onClick={() => deleteKnowledge(entry.id)}
                          size="icon"
                          title={`Delete ${entry.title}`}
                          type="button"
                          variant="ghost"
                        >
                          <Trash2 className="text-destructive" aria-hidden="true" />
                        </Button>
                      </div>
                      <CardTitle className="text-base leading-snug">{entry.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-5 pt-0">
                      <p className="text-sm leading-6 text-muted-foreground">{entry.content}</p>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
