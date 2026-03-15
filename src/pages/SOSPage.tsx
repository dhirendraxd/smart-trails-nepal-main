import Navbar from "@/components/Navbar";
import PageLayout from "@/components/PageLayout";
import SOSSafetySystem from "@/components/dashboard/SOSSafetySystem";

const SOSPage = () => (
  <div className="min-h-screen bg-background">
    <Navbar variant="solid" />
    <div className="container py-8 sm:py-12">
      <SOSSafetySystem />
    </div>
  </div>
);

export default SOSPage;
