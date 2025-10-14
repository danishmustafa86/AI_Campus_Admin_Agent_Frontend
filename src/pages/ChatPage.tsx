import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Copy, Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { chatApi } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import type { ChatMessage, ChatHistoryEntry } from "@/types";

export const ChatPage = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Hello! I'm your AI Campus Administration Assistant. I can help you with student management, analytics insights, administrative tasks, and answer questions about your campus data. How can I assist you today?",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuthStore();
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Load chat history on component mount
  useEffect(() => {
    const loadChatHistory = async () => {
      if (!user) return;
      
      try {
        const response = await chatApi.getMyHistory();
        const history = response.data.chats;
        
        if (history && history.length > 0) {
          // Convert chat history to ChatMessage format
          const historyMessages: ChatMessage[] = [
            // Start with welcome message
            {
              role: "assistant",
              content: "Hello! I'm your AI Campus Administration Assistant. I can help you with student management, analytics insights, administrative tasks, and answer questions about your campus data. How can I assist you today?",
              timestamp: new Date().toISOString(),
            }
          ];
          
          // Add historical conversations (reverse order since backend sends newest first)
          const sortedHistory = [...history].reverse();
          sortedHistory.forEach((entry: ChatHistoryEntry) => {
            // Add user message
            historyMessages.push({
              role: "user",
              content: entry.user_message,
              timestamp: entry.timestamp,
            });
            
            // Add AI response
            historyMessages.push({
              role: "assistant",
              content: entry.ai_response,
              timestamp: entry.timestamp,
            });
          });
          
          setMessages(historyMessages);
          console.log(`✅ Loaded ${history.length} chat entries from history`);
        }
      } catch (error) {
        console.error('Failed to load chat history:', error);
        // Keep the default welcome message if loading fails
      }
    };

    // Only load history once when user is available and history hasn't been loaded yet
    if (user && !historyLoaded) {
      loadChatHistory();
      setHistoryLoaded(true);
    }
  }, [user, historyLoaded]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      // Use streaming for real-time response
      const eventSource = chatApi.stream({ messages: updatedMessages });
      
      let assistantMessage: ChatMessage = {
        role: "assistant",
        content: "",
        timestamp: new Date().toISOString(),
      };

      // Add the initial empty assistant message
      setMessages([...updatedMessages, assistantMessage]);

      eventSource.onmessage = (event) => {
        try {
          // Skip empty data
          if (!event.data || event.data.trim() === '') {
            return;
          }
          
          const data = JSON.parse(event.data);
          if (data.content) {
            assistantMessage.content += data.content;
            // Update messages with the accumulated content
            setMessages(prevMessages => {
              const newMessages = [...prevMessages];
              newMessages[newMessages.length - 1] = { ...assistantMessage };
              return newMessages;
            });
          } else if (data.type === 'complete') {
            // Handle completion
            console.log('Stream completed');
            eventSource.close();
            setIsLoading(false);
          } else if (data.type === 'start') {
            // Handle start event
            console.log('Stream started');
          }
        } catch (err) {
          console.error("Error parsing SSE data:", err, "Raw data:", event.data);
        }
      };

      eventSource.onerror = (error) => {
        console.error("SSE Error:", error);
        eventSource.close();
        setIsLoading(false);
        
        // Only show error if no content was received
        if (assistantMessage.content.trim() === '') {
          toast({
            title: "Error",
            description: "Failed to get AI response. Please try again.",
            variant: "destructive",
          });
          setMessages(updatedMessages); // Remove the empty assistant message
        }
      };

      // Handle when the stream naturally closes
      eventSource.addEventListener('close', () => {
        console.log('Stream closed');
        setIsLoading(false);
      });

    } catch (error) {
      console.error("Chat error:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
      setMessages(updatedMessages); // Remove user message on error
      setIsLoading(false);
    }
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied",
      description: "Message copied to clipboard",
    });
  };

  const startListening = () => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
        toast({
          title: "Error",
          description: "Speech recognition failed. Please try again.",
          variant: "destructive",
        });
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } else {
      toast({
        title: "Not Supported",
        description: "Speech recognition is not supported in this browser.",
        variant: "destructive",
      });
    }
  };

  const speakMessage = (content: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(content);
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex-shrink-0 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">AI Assistant</h1>
            <p className="text-muted-foreground">
              Your intelligent campus administration companion
            </p>
          </div>
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            <Bot className="mr-1 h-3 w-3" />
            AI Powered
          </Badge>
        </div>
      </div>

      {/* Chat Messages */}
      <Card className="flex-1 flex flex-col">
        <CardContent className="flex-1 p-0">
          <ScrollArea className="h-full p-4">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex items-start space-x-3 ${
                    message.role === "user" ? "flex-row-reverse space-x-reverse" : ""
                  }`}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className={message.role === "user" ? "bg-primary text-white" : "bg-secondary"}>
                      {message.role === "user" ? (
                        <User className="h-4 w-4" />
                      ) : (
                        <Bot className="h-4 w-4" />
                      )}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className={`flex-1 max-w-3xl ${message.role === "user" ? "text-right" : ""}`}>
                    <div
                      className={`rounded-lg px-4 py-3 ${
                        message.role === "user"
                          ? "bg-primary text-white ml-12"
                          : "bg-muted mr-12"
                      }`}
                    >
                      <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                      {message.timestamp && (
                        <div className={`text-xs mt-2 ${message.role === "user" ? "text-blue-100" : "text-muted-foreground"}`}>
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </div>
                      )}
                    </div>
                    
                    {message.role === "assistant" && (
                      <div className="flex items-center space-x-1 mt-2 mr-12">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => copyMessage(message.content)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => isSpeaking ? stopSpeaking() : speakMessage(message.content)}
                        >
                          {isSpeaking ? (
                            <VolumeX className="h-3 w-3" />
                          ) : (
                            <Volume2 className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex items-start space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-secondary">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 max-w-3xl">
                    <div className="rounded-lg px-4 py-3 bg-muted mr-12">
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <span className="text-sm text-muted-foreground">AI is thinking...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div ref={messagesEndRef} />
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Input Area */}
      <div className="flex-shrink-0 pt-4">
        <form onSubmit={handleSubmit} className="space-y-2">
          <div className="flex space-x-2">
            <div className="flex-1 relative">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything about campus administration..."
                className="min-h-[60px] resize-none pr-12"
                disabled={isLoading}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute bottom-2 right-2 h-8 w-8"
                onClick={startListening}
                disabled={isLoading || isListening}
              >
                {isListening ? (
                  <MicOff className="h-4 w-4 text-destructive animate-pulse" />
                ) : (
                  <Mic className="h-4 w-4" />
                )}
              </Button>
            </div>
            <Button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="bg-gradient-primary hover:bg-gradient-primary/90 text-white"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center space-x-4">
              <span>Press Enter to send, Shift+Enter for new line</span>
              {isListening && (
                <Badge variant="destructive" className="animate-pulse">
                  <Mic className="mr-1 h-3 w-3" />
                  Listening...
                </Badge>
              )}
            </div>
            <span>{input.length}/2000</span>
          </div>
        </form>
      </div>
    </div>
  );
};