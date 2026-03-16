import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Index from "./pages/Index";
import DestinationDetail from "./pages/DestinationDetail";
import ExploreNepal from "./pages/ExploreNepal";
import SafetySOS from "./pages/SafetySOS";
import TouristFlowForecast from "./pages/TouristFlowForecast";
import SmartTravelInsights from "./pages/SmartTravelInsights";
import BudgetEstimator from "./pages/BudgetEstimator";
import AlternativeDestinations from "./pages/AlternativeDestinations";
import OfflineTravelPackage from "./pages/OfflineTravelPackage";
import MultiStopTripPlanner from "./pages/MultiStopTripPlanner";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/explore-nepal" element={<ExploreNepal />} />
          <Route path="/tourist-flow-forecast" element={<TouristFlowForecast />} />
          <Route path="/smart-travel-insights" element={<SmartTravelInsights />} />
          <Route path="/budget-estimator" element={<BudgetEstimator />} />
          <Route path="/alternative-destinations" element={<AlternativeDestinations />} />
          <Route path="/sos-safety" element={<SafetySOS />} />
          <Route path="/offline-travel-package" element={<OfflineTravelPackage />} />
          <Route path="/multi-stop-planner" element={<MultiStopTripPlanner />} />
          <Route path="/destinations/:id" element={<DestinationDetail />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
