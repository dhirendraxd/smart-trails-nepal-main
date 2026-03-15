import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ActivityProvider } from "@/contexts/ActivityContext";
import { TripPlannerProvider } from "@/contexts/TripPlannerContext";
import { BookmarksProvider } from "@/contexts/BookmarksContext";
import { AnimatePresence, motion } from "framer-motion";
import Index from "./pages/Index";
import Login from "./pages/Login";
import UserDashboard from "./pages/UserDashboard";
import MapExplorer from "./pages/MapExplorer";
import AdminDashboard from "./pages/AdminDashboard";
import BudgetEstimator from "./pages/BudgetEstimator";
import TripPlanner from "./pages/TripPlanner";
import SOSPage from "./pages/SOSPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

const pageTransition = {
  duration: 0.3,
  ease: [0.25, 0.1, 0.25, 1] as const,
};

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={pageTransition}
        className="min-h-screen"
      >
        <Routes location={location}>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="/map" element={<MapExplorer />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/budget" element={<BudgetEstimator />} />
          <Route path="/trip" element={<TripPlanner />} />
          <Route path="/sos" element={<SOSPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ActivityProvider>
        <TripPlannerProvider>
          <BookmarksProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AnimatedRoutes />
            </BrowserRouter>
          </TooltipProvider>
          </BookmarksProvider>
        </TripPlannerProvider>
      </ActivityProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
