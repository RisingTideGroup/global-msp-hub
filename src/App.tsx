
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import BusinessSignup from "./pages/BusinessSignup";
import BusinessDashboard from "./pages/BusinessDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AdminSettings from "./pages/AdminSettings";
import UserSettings from "./pages/UserSettings";
import JobDetails from "./pages/JobDetails";
import Profile from "./pages/Profile";
import Businesses from "./pages/Businesses";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1 * 60 * 1000, // 1 minute - shorter for fresher data
      refetchOnMount: true, // Always refetch when component mounts
      refetchOnWindowFocus: true, // Refetch when window regains focus
      retry: (failureCount, error) => {
        // Don't retry on auth errors or 404s
        if (error && typeof error === 'object' && 'status' in error) {
          const status = (error as any).status;
          if (status === 401 || status === 403 || status === 404) {
            return false;
          }
        }
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<ErrorBoundary><Index /></ErrorBoundary>} />
              <Route path="/auth" element={<ErrorBoundary><Auth /></ErrorBoundary>} />
              <Route path="/business/signup" element={<ErrorBoundary><BusinessSignup /></ErrorBoundary>} />
              <Route path="/business/dashboard" element={<ErrorBoundary><BusinessDashboard /></ErrorBoundary>} />
              <Route path="/admin" element={<ErrorBoundary><AdminDashboard /></ErrorBoundary>} />
              <Route path="/admin/settings" element={<ErrorBoundary><AdminSettings /></ErrorBoundary>} />
              <Route path="/settings" element={<ErrorBoundary><UserSettings /></ErrorBoundary>} />
              <Route path="/businesses" element={<ErrorBoundary><Businesses /></ErrorBoundary>} />
              <Route path="/job/:id" element={<ErrorBoundary><JobDetails /></ErrorBoundary>} />
              <Route path="/profile" element={<ErrorBoundary><Profile /></ErrorBoundary>} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
