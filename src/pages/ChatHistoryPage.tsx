import { useState, useEffect } from "react";
import {
  History,
  Trash2,
  Search,
  Calendar,
  MessageSquare,
  Bot,
  User,
  Download,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  Copy,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { chatApi } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { useToast } from "@/hooks/use-toast";
import type { ChatHistoryEntry } from "@/types";

export const ChatHistoryPage = () => {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [history, setHistory] = useState<ChatHistoryEntry[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<ChatHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedChats, setExpandedChats] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    // Filter history based on search query
    if (searchQuery.trim() === "") {
      setFilteredHistory(history);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = history.filter(
        (chat) =>
          chat.user_message.toLowerCase().includes(query) ||
          chat.ai_response.toLowerCase().includes(query)
      );
      setFilteredHistory(filtered);
    }
  }, [searchQuery, history]);

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      const response = await chatApi.getMyHistory();
      const chats = response.data.chats || [];
      setHistory(chats);
      setFilteredHistory(chats);
      console.log(`✅ Loaded ${chats.length} chat entries`);
    } catch (error: any) {
      console.error("Failed to load chat history:", error);
      toast({
        title: "Error",
        description: "Failed to load chat history. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAll = async () => {
    try {
      await chatApi.deleteMyHistory();
      setHistory([]);
      setFilteredHistory([]);
      toast({
        title: "Success",
        description: "All chat history deleted successfully",
      });
    } catch (error) {
      console.error("Failed to delete chat history:", error);
      toast({
        title: "Error",
        description: "Failed to delete chat history. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleExportHistory = () => {
    try {
      const dataStr = JSON.stringify(history, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `chat-history-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Chat history exported successfully",
      });
    } catch (error) {
      console.error("Failed to export chat history:", error);
      toast({
        title: "Error",
        description: "Failed to export chat history",
        variant: "destructive",
      });
    }
  };

  const toggleChat = (chatId: string) => {
    const newExpanded = new Set(expandedChats);
    if (newExpanded.has(chatId)) {
      newExpanded.delete(chatId);
    } else {
      newExpanded.add(chatId);
    }
    setExpandedChats(newExpanded);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast({
      title: "Copied",
      description: "Text copied to clipboard",
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      return `Today at ${date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    } else if (diffInDays === 1) {
      return `Yesterday at ${date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else {
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    }
  };

  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const groupChatsByDate = (chats: ChatHistoryEntry[]) => {
    const groups: { [key: string]: ChatHistoryEntry[] } = {};

    chats.forEach((chat) => {
      const date = new Date(chat.timestamp);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      let groupKey;
      if (date.toDateString() === today.toDateString()) {
        groupKey = "Today";
      } else if (date.toDateString() === yesterday.toDateString()) {
        groupKey = "Yesterday";
      } else if (date > new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)) {
        groupKey = "This Week";
      } else if (date > new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)) {
        groupKey = "This Month";
      } else {
        groupKey = date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
        });
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(chat);
    });

    return groups;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading chat history...</p>
        </div>
      </div>
    );
  }

  const groupedChats = groupChatsByDate(filteredHistory);
  const groupOrder = ["Today", "Yesterday", "This Week", "This Month"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Chat History</h1>
          <p className="text-muted-foreground">
            View and manage your conversation history with the AI assistant
          </p>
        </div>
        <Badge variant="secondary" className="text-lg px-4 py-2">
          <MessageSquare className="mr-2 h-4 w-4" />
          {history.length} {history.length === 1 ? "Chat" : "Chats"}
        </Badge>
      </div>

      {/* Actions Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleExportHistory}
                disabled={history.length === 0}
              >
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    disabled={history.length === 0}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete All
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete all your chat history. This action
                      cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAll}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete All
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          {searchQuery && (
            <p className="text-sm text-muted-foreground mt-4">
              Found {filteredHistory.length} {filteredHistory.length === 1 ? "result" : "results"} for "{searchQuery}"
            </p>
          )}
        </CardContent>
      </Card>

      {/* Chat History List */}
      {filteredHistory.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-muted p-6 mb-4">
              <History className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              {searchQuery ? "No matching conversations" : "No chat history yet"}
            </h3>
            <p className="text-muted-foreground text-center max-w-md mb-4">
              {searchQuery
                ? "Try adjusting your search query"
                : "Start chatting with the AI assistant to build your conversation history"}
            </p>
            {!searchQuery && (
              <Button onClick={() => window.location.href = "/chat"}>
                <MessageSquare className="mr-2 h-4 w-4" />
                Start Chatting
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedChats)
            .sort((a, b) => {
              const indexA = groupOrder.indexOf(a[0]);
              const indexB = groupOrder.indexOf(b[0]);
              if (indexA !== -1 && indexB !== -1) return indexA - indexB;
              if (indexA !== -1) return -1;
              if (indexB !== -1) return 1;
              return b[0].localeCompare(a[0]);
            })
            .map(([dateGroup, chats]) => (
              <div key={dateGroup} className="space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase">
                    {dateGroup}
                  </h3>
                  <Separator className="flex-1" />
                </div>

                <div className="space-y-3">
                  {chats.map((chat) => {
                    const isExpanded = expandedChats.has(chat.id);

                    return (
                      <Card key={chat.id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarFallback className="bg-primary text-white text-xs">
                                    <User className="h-3 w-3" />
                                  </AvatarFallback>
                                </Avatar>
                                <CardTitle className="text-sm font-medium">
                                  {isExpanded
                                    ? chat.user_message
                                    : truncateText(chat.user_message, 80)}
                                </CardTitle>
                              </div>
                              <CardDescription className="flex items-center gap-2 text-xs">
                                <span>{formatDate(chat.timestamp)}</span>
                              </CardDescription>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleChat(chat.id)}
                            >
                              {isExpanded ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </CardHeader>

                        {isExpanded && (
                          <CardContent className="space-y-4">
                            {/* User Message */}
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-6 w-6">
                                    <AvatarFallback className="bg-primary text-white text-xs">
                                      <User className="h-3 w-3" />
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-sm font-semibold">You</span>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    copyToClipboard(chat.user_message, `user-${chat.id}`)
                                  }
                                >
                                  {copiedId === `user-${chat.id}` ? (
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <Copy className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                              <div className="rounded-lg bg-primary/10 p-4">
                                <p className="text-sm whitespace-pre-wrap">
                                  {chat.user_message}
                                </p>
                              </div>
                            </div>

                            <Separator />

                            {/* AI Response */}
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-6 w-6">
                                    <AvatarFallback className="bg-gradient-primary text-white text-xs">
                                      <Bot className="h-3 w-3" />
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-sm font-semibold">AI Assistant</span>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    copyToClipboard(chat.ai_response, `ai-${chat.id}`)
                                  }
                                >
                                  {copiedId === `ai-${chat.id}` ? (
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <Copy className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                              <div className="rounded-lg bg-muted p-4">
                                <p className="text-sm whitespace-pre-wrap">
                                  {chat.ai_response}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        )}
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Info Alert */}
      {history.length > 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>About Chat History</AlertTitle>
          <AlertDescription>
            Your chat history is stored securely and only visible to you. The system
            automatically keeps your last 10 conversations. Older conversations are
            automatically removed.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

