import { useEffect } from "react";
import DestinationsSection from "@/components/DestinationsSection";
import Navbar from "@/components/Navbar";
import { Home, Map } from "lucide-react";

const ExploreNepal = () => {
  useEffect(() => {
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    return () => {
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousBodyOverflow;
    };
  }, []);

  return (
    <div className="h-[100svh] overflow-hidden bg-background">
      <Navbar
        variant="solid"
        fixed
        linksOverride={[
          { label: "Home", href: "/", icon: Home },
          { label: "Explore", href: "#destinations", icon: Map },
        ]}
      />
      <main className="mt-14 h-[calc(100svh-3.5rem)] overflow-hidden">
        <DestinationsSection />
      </main>
    </div>
  );
};

export default ExploreNepal;
