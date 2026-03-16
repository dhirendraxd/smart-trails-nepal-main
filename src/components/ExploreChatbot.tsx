import { useEffect, useMemo, useState } from "react";
import {
  Bot,
  Compass,
  Loader2,
  LocateFixed,
  Maximize2,
  MapPinned,
  MessageCircleMore,
  Minimize2,
  RefreshCw,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import { toast } from "sonner";
import type { Destination, DestinationWithDistance } from "@/data/destinations";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  buildTravelChatContext,
  CHAT_REQUEST_LIMIT_PER_MINUTE,
  getExploreChatSuggestions,
  getPrimaryMentionedDestinationId,
  type ChatRequestMessage,
} from "@/lib/exploreChat";

type LivePopularPlace = {
  destinationId: string;
  approxDistanceKm: number;
  place: {
    name: string;
    duration: string;
    note: string;
  };
};

type ExploreChatbotProps = {
  selectedDestination: Destination | null;
  fromDestination: Destination | null;
  nearbyDestinations: DestinationWithDistance[];
  liveNearbyDestinations: DestinationWithDistance[];
  livePopularPlaces: LivePopularPlace[];
  onFocusDestination: (destinationId: string) => void;
};

type ChatMessage = ChatRequestMessage & {
  id: string;
};

const CHAT_API_URL = import.meta.env.VITE_CHAT_API_URL ?? "/api/chat";
const MAX_MESSAGES_TO_SEND = 10;

const createWelcomeMessage = (selectedDestination: Destination | null): ChatMessage => ({
  id: "assistant-welcome",
  role: "assistant",
  content: selectedDestination
    ? `Ask me about ${selectedDestination.name}, nearby places, easy routes, or how to explore it on the map.`
    : "Ask me about Nepal destinations, nearby hikes, or how to use the Explore map.",
});

const formatRetryMessage = (retryAfterSeconds: number) =>
  retryAfterSeconds > 0
    ? `Rate limit reached. Try again in about ${retryAfterSeconds}s.`
    : "Rate limit reached. Please wait a moment and try again.";

const ExploreChatbot = ({
  selectedDestination,
  fromDestination,
  nearbyDestinations,
  liveNearbyDestinations,
  livePopularPlaces,
  onFocusDestination,
}: ExploreChatbotProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>(() => [createWelcomeMessage(selectedDestination)]);
  const [isSending, setIsSending] = useState(false);
  const [requestTimestamps, setRequestTimestamps] = useState<number[]>([]);
  const [clock, setClock] = useState(() => Date.now());

  const chatContext = useMemo(
    () =>
      buildTravelChatContext({
        selectedDestination,
        fromDestination,
        nearbyDestinations,
        liveNearbyDestinations,
        livePopularPlaces,
      }),
    [selectedDestination, fromDestination, nearbyDestinations, liveNearbyDestinations, livePopularPlaces],
  );

  const suggestions = useMemo(
    () => getExploreChatSuggestions(selectedDestination),
    [selectedDestination],
  );

  const activeRequests = useMemo(
    () => requestTimestamps.filter((timestamp) => clock - timestamp < 60_000),
    [requestTimestamps, clock],
  );

  const remainingRequests = Math.max(0, CHAT_REQUEST_LIMIT_PER_MINUTE - activeRequests.length);
  const retryAfterSeconds =
    activeRequests.length >= CHAT_REQUEST_LIMIT_PER_MINUTE
      ? Math.max(1, Math.ceil((60_000 - (clock - activeRequests[0])) / 1000))
      : 0;

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setClock(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    setRequestTimestamps((currentTimestamps) =>
      currentTimestamps.filter((timestamp) => Date.now() - timestamp < 60_000),
    );
  }, [clock]);

  useEffect(() => {
    setMessages((currentMessages) =>
      currentMessages.length > 1 ? currentMessages : [createWelcomeMessage(selectedDestination)],
    );
  }, [selectedDestination]);

  useEffect(() => {
    document.querySelectorAll<HTMLElement>("[data-explore-chat-scroll='true']").forEach((messageContainer) => {
      messageContainer.scrollTo({ top: messageContainer.scrollHeight, behavior: "smooth" });
    });
  }, [messages, isOpen]);

  const resetConversation = () => {
    setMessages([createWelcomeMessage(selectedDestination)]);
    setInput("");
  };

  const pushAssistantMessage = (content: string) => {
    setMessages((currentMessages) => [
      ...currentMessages,
      {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content,
      },
    ]);
  };

  const sendMessage = async (presetMessage?: string) => {
    const trimmedMessage = (presetMessage ?? input).trim();

    if (!trimmedMessage || isSending) {
      return;
    }

    const now = Date.now();
    const currentWindowRequests = requestTimestamps.filter((timestamp) => now - timestamp < 60_000);

    if (currentWindowRequests.length >= CHAT_REQUEST_LIMIT_PER_MINUTE) {
      const rateLimitMessage = formatRetryMessage(
        Math.max(1, Math.ceil((60_000 - (now - currentWindowRequests[0])) / 1000)),
      );

      toast.error(rateLimitMessage);
      pushAssistantMessage(rateLimitMessage);
      return;
    }

    const primaryMentionedDestinationId = getPrimaryMentionedDestinationId(trimmedMessage);

    if (primaryMentionedDestinationId) {
      onFocusDestination(primaryMentionedDestinationId);
      if (!isOpen) {
        setIsOpen(true);
      }
      if (isMinimized) {
        setIsMinimized(false);
      }
    }

    const nextUserMessage: ChatMessage = {
      id: `user-${now}`,
      role: "user",
      content: trimmedMessage,
    };
    const nextMessages = [...messages, nextUserMessage];

    setMessages(nextMessages);
    setInput("");
    setIsSending(true);
    setRequestTimestamps([...currentWindowRequests, now]);

    try {
      const response = await fetch(CHAT_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: nextMessages
            .slice(-MAX_MESSAGES_TO_SEND)
            .map(({ role, content }) => ({ role, content })),
          context: chatContext,
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { reply?: string; error?: string; retryAfterMs?: number }
        | null;

      if (!response.ok) {
        if (response.status === 429) {
          const rateLimitMessage = formatRetryMessage(
            payload?.retryAfterMs ? Math.ceil(payload.retryAfterMs / 1000) : retryAfterSeconds,
          );
          throw new Error(rateLimitMessage);
        }

        throw new Error(payload?.error ?? "I couldn’t reach the travel assistant right now.");
      }

      const assistantReply = payload?.reply?.trim();
      pushAssistantMessage(
        assistantReply && assistantReply.length > 0
          ? assistantReply
          : "I couldn’t generate a useful travel reply just now. Please try again.",
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Something went wrong while sending the message.";
      toast.error(message);
      pushAssistantMessage(`I hit a snag: ${message}`);
    } finally {
      setIsSending(false);
    }
  };

  const handleMinimize = () => {
    setIsOpen(true);
    setIsMinimized(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsMinimized(false);
  };

  const handleLauncherClick = () => {
    if (!isOpen) {
      setIsOpen(true);
      setIsMinimized(false);
      return;
    }

    if (isMinimized) {
      setIsMinimized(false);
      return;
    }

    handleClose();
  };

  return (
    <>
      <div className="fixed bottom-4 right-4 z-[820] flex items-end gap-3">
        {isOpen && !isMinimized && (
          <div className="hidden rounded-2xl border border-border/80 bg-card/95 px-3 py-2 shadow-2xl backdrop-blur md:flex md:w-[26rem] md:max-h-[calc(100svh-6.5rem)] lg:w-[30rem] xl:w-[32rem] xl:max-w-[calc(100vw-3rem)]">
            <div className="flex min-h-[32rem] min-w-0 w-full flex-col overflow-hidden rounded-[1.2rem] border border-border/70 bg-background/95">
              <div className="flex items-start justify-between gap-3 border-b border-border/70 px-4 py-3">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Explore AI Guide</p>
                      <p className="text-xs text-muted-foreground">GPT-5.4 travel help for the map page</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={resetConversation}
                    className="h-8 w-8 rounded-full"
                    aria-label="Reset conversation"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={handleMinimize}
                    className="h-8 w-8 rounded-full"
                    aria-label="Minimize chatbot"
                  >
                    <Minimize2 className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={handleClose}
                    className="h-8 w-8 rounded-full"
                    aria-label="Close chatbot"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 border-b border-border/70 px-4 py-2.5">
                <Badge variant="secondary" className="gap-1 rounded-full bg-emerald-100/80 text-emerald-800 hover:bg-emerald-100">
                  <Compass className="h-3.5 w-3.5" />
                  {remainingRequests}/{CHAT_REQUEST_LIMIT_PER_MINUTE} requests left
                </Badge>
                {selectedDestination && (
                  <Badge variant="outline" className="rounded-full bg-background/80">
                    Focused on {selectedDestination.name}
                  </Badge>
                )}
                {liveNearbyDestinations.length > 0 && (
                  <Badge variant="outline" className="gap-1 rounded-full bg-background/80">
                    <LocateFixed className="h-3.5 w-3.5" />
                    Nearby mode on
                  </Badge>
                )}
              </div>

              <div
                data-explore-chat-scroll="true"
                className="chat-scroll min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4 pr-3"
              >
                {messages.map((message) => {
                  const isAssistant = message.role === "assistant";

                  return (
                    <div
                      key={message.id}
                      className={cn("flex", isAssistant ? "justify-start" : "justify-end")}
                    >
                      <div
                        className={cn(
                          "max-w-[92%] rounded-2xl px-4 py-3.5 text-[14px] leading-relaxed shadow-sm whitespace-pre-wrap break-words",
                          isAssistant
                            ? "rounded-bl-md border border-border/70 bg-secondary/65 text-foreground"
                            : "rounded-br-md bg-primary text-primary-foreground",
                        )}
                      >
                        <div className="mb-1 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.14em] opacity-70">
                          {isAssistant ? <Sparkles className="h-3.5 w-3.5" /> : <MapPinned className="h-3.5 w-3.5" />}
                          {isAssistant ? "Guide" : "You"}
                        </div>
                        <p className="leading-relaxed break-words">{message.content}</p>
                      </div>
                    </div>
                  );
                })}

                {isSending && (
                  <div className="flex justify-start">
                    <div className="inline-flex items-center gap-2 rounded-2xl rounded-bl-md border border-border/70 bg-secondary/65 px-3.5 py-3 text-sm text-muted-foreground shadow-sm">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Thinking about places and map context…
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t border-border/70 px-4 py-3">
                <div className="mb-3 flex flex-wrap gap-2">
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => {
                        void sendMessage(suggestion);
                      }}
                      className="rounded-full border border-border/70 bg-background px-3 py-1.5 text-left text-xs text-foreground/85 transition-colors hover:bg-accent/65"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>

                <div className="rounded-[1.1rem] border border-border/80 bg-background/90 p-2">
                  <Textarea
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        void sendMessage();
                      }
                    }}
                    placeholder={
                      selectedDestination
                        ? `Ask about ${selectedDestination.name}, nearby trails, or route ideas…`
                        : "Ask about a place, nearby options, or map navigation…"
                    }
                    className="min-h-[94px] resize-none border-0 bg-transparent px-2 py-2 shadow-none focus-visible:ring-0"
                    disabled={isSending}
                  />

                  <div className="flex items-center justify-between gap-3 border-t border-border/70 px-2 pt-2">
                    <p className="text-[11px] leading-relaxed text-muted-foreground">
                      Approximate travel guidance only. No raw GPS is sent to the model.
                    </p>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => {
                        void sendMessage();
                      }}
                      disabled={isSending || input.trim().length === 0 || retryAfterSeconds > 0}
                      className="rounded-full px-3.5"
                    >
                      {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      Send
                    </Button>
                  </div>
                </div>

                {retryAfterSeconds > 0 && (
                  <p className="mt-2 text-xs text-amber-700">
                    {formatRetryMessage(retryAfterSeconds)}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {isOpen && isMinimized && (
          <button
            type="button"
            onClick={() => setIsMinimized(false)}
            className="hidden rounded-full border border-border/80 bg-card/95 px-3 py-2 shadow-2xl backdrop-blur transition-colors hover:bg-accent/40 md:flex"
            aria-label="Expand chatbot"
          >
            <span className="inline-flex items-center gap-2 text-sm font-medium text-foreground/90">
              <Bot className="h-4 w-4" />
              Chat minimized
              <Maximize2 className="h-4 w-4" />
            </span>
          </button>
        )}

        <Button
          type="button"
          onClick={handleLauncherClick}
          className="h-14 rounded-full px-4 shadow-2xl"
        >
          <MessageCircleMore className="h-5 w-5" />
          <span className="hidden sm:inline">{isOpen && !isMinimized ? "Hide AI Guide" : "Ask AI Guide"}</span>
        </Button>
      </div>

      {isOpen && isMinimized && (
        <button
          type="button"
          onClick={() => setIsMinimized(false)}
          className="fixed bottom-20 right-4 z-[820] rounded-full border border-border/80 bg-card/95 px-3 py-2 text-xs font-medium text-foreground/90 shadow-2xl backdrop-blur md:hidden"
          aria-label="Expand chatbot"
        >
          <span className="inline-flex items-center gap-1.5">
            <Bot className="h-3.5 w-3.5" />
            Minimized
            <Maximize2 className="h-3.5 w-3.5" />
          </span>
        </button>
      )}

      {isOpen && !isMinimized && (
        <div className="fixed inset-x-4 top-20 bottom-20 z-[820] rounded-2xl border border-border/80 bg-card/95 p-2 shadow-2xl backdrop-blur md:hidden">
          <div className="flex h-full min-h-[26rem] flex-col overflow-hidden rounded-[1.2rem] border border-border/70 bg-background/95">
            <div className="flex items-start justify-between gap-3 border-b border-border/70 px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                  <Bot className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Explore AI Guide</p>
                  <p className="text-xs text-muted-foreground">Travel help for this page</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={resetConversation}
                  className="h-8 w-8 rounded-full"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleMinimize}
                  className="h-8 w-8 rounded-full"
                  aria-label="Minimize chatbot"
                >
                  <Minimize2 className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleClose}
                  className="h-8 w-8 rounded-full"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 border-b border-border/70 px-4 py-2.5">
              <Badge variant="secondary" className="gap-1 rounded-full bg-emerald-100/80 text-emerald-800 hover:bg-emerald-100">
                <Compass className="h-3.5 w-3.5" />
                {remainingRequests}/{CHAT_REQUEST_LIMIT_PER_MINUTE} left
              </Badge>
              {selectedDestination && (
                <Badge variant="outline" className="rounded-full bg-background/80">
                  {selectedDestination.name}
                </Badge>
              )}
            </div>

            <div
              data-explore-chat-scroll="true"
              className="chat-scroll min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4 pr-3"
            >
              {messages.map((message) => {
                const isAssistant = message.role === "assistant";

                return (
                  <div key={message.id} className={cn("flex", isAssistant ? "justify-start" : "justify-end")}>
                    <div
                      className={cn(
                        "max-w-[92%] rounded-2xl px-4 py-3.5 text-[14px] leading-relaxed shadow-sm whitespace-pre-wrap break-words",
                        isAssistant
                          ? "rounded-bl-md border border-border/70 bg-secondary/65 text-foreground"
                          : "rounded-br-md bg-primary text-primary-foreground",
                      )}
                    >
                      <div className="mb-1 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.14em] opacity-70">
                        {isAssistant ? <Sparkles className="h-3.5 w-3.5" /> : <MapPinned className="h-3.5 w-3.5" />}
                        {isAssistant ? "Guide" : "You"}
                      </div>
                      <p className="leading-relaxed break-words">{message.content}</p>
                    </div>
                  </div>
                );
              })}

              {isSending && (
                <div className="flex justify-start">
                  <div className="inline-flex items-center gap-2 rounded-2xl rounded-bl-md border border-border/70 bg-secondary/65 px-3.5 py-3 text-sm text-muted-foreground shadow-sm">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Thinking about places and routes…
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-border/70 px-4 py-3">
              <div className="mb-3 flex flex-wrap gap-2">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => {
                      void sendMessage(suggestion);
                    }}
                    className="rounded-full border border-border/70 bg-background px-3 py-1.5 text-left text-xs text-foreground/85 transition-colors hover:bg-accent/65"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>

              <div className="rounded-[1.1rem] border border-border/80 bg-background/90 p-2">
                <Textarea
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      void sendMessage();
                    }
                  }}
                  placeholder="Ask about a place or route idea…"
                  className="min-h-[86px] resize-none border-0 bg-transparent px-2 py-2 shadow-none focus-visible:ring-0"
                  disabled={isSending}
                />

                <div className="flex items-center justify-between gap-3 border-t border-border/70 px-2 pt-2">
                  <p className="text-[11px] leading-relaxed text-muted-foreground">No raw GPS is sent to AI.</p>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      void sendMessage();
                    }}
                    disabled={isSending || input.trim().length === 0 || retryAfterSeconds > 0}
                    className="rounded-full px-3.5"
                  >
                    {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    Send
                  </Button>
                </div>
              </div>

              {retryAfterSeconds > 0 && (
                <p className="mt-2 text-xs text-amber-700">{formatRetryMessage(retryAfterSeconds)}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ExploreChatbot;
