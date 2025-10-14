import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuthStore } from "@/stores/authStore";

// Pages
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { SignupPage } from "./pages/SignupPage";
import { DashboardPage } from "./pages/DashboardPage";
import { ChatPage } from "./pages/ChatPage";
import { StudentsPage } from "./pages/StudentsPage";
import { AnalyticsPage } from "./pages/AnalyticsPage";
import { ProfilePage } from "./pages/ProfilePage";
import { ChatHistoryPage } from "./pages/ChatHistoryPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const { initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="campus-admin-theme">
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              
              {/* Protected Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <AppLayout>
                    <DashboardPage />
                  </AppLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/chat" element={
                <ProtectedRoute>
                  <AppLayout>
                    <ChatPage />
                  </AppLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/students" element={
                <ProtectedRoute>
                  <AppLayout>
                    <StudentsPage />
                  </AppLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/analytics" element={
                <ProtectedRoute>
                  <AppLayout>
                    <AnalyticsPage />
                  </AppLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/profile" element={
                <ProtectedRoute>
                  <AppLayout>
                    <ProfilePage />
                  </AppLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/history" element={
                <ProtectedRoute>
                  <AppLayout>
                    <ChatHistoryPage />
                  </AppLayout>
                </ProtectedRoute>
              } />
              
              {/* Admin Routes */}
              <Route path="/admin/users" element={
                <ProtectedRoute requireAdmin>
                  <AppLayout>
                    <div className="text-center py-20">
                      <h1 className="text-2xl font-bold mb-4">User Management</h1>
                      <p className="text-muted-foreground">Coming Soon - Admin user management</p>
                    </div>
                  </AppLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/admin/analytics" element={
                <ProtectedRoute requireAdmin>
                  <AppLayout>
                    <div className="text-center py-20">
                      <h1 className="text-2xl font-bold mb-4">System Analytics</h1>
                      <p className="text-muted-foreground">Coming Soon - Advanced system insights</p>
                    </div>
                  </AppLayout>
                </ProtectedRoute>
              } />

              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
