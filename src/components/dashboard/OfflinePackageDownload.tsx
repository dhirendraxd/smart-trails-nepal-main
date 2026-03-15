import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download,
  MapPin,
  Landmark,
  Leaf,
  Phone,
  Compass,
  CheckCircle2,
  Loader2,
  FileText,
  Wifi,
  WifiOff,
  BookOpen,
  Mountain,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { nepalRegions } from "@/data/regions";
import { regionTravelData } from "@/data/regionTravelData";
import { useToast } from "@/hooks/use-toast";

interface PackageItem {
  id: string;
  label: string;
  icon: typeof MapPin;
  description: string;
  sizeKB: number;
  included: boolean;
}

const getPackageItems = (regionId: string): PackageItem[] => {
  const travelData = regionTravelData[regionId];
  return [
    {
      id: "map",
      label: "Offline Map",
      icon: Compass,
      description: "Detailed topographic map with trails, landmarks, and points of interest.",
      sizeKB: 2400,
      included: true,
    },
    {
      id: "culture",
      label: "Culture & Festivals",
      icon: Landmark,
      description: "Local customs, religious sites, festival calendar, and etiquette guidelines.",
      sizeKB: 850,
      included: true,
    },
    {
      id: "guidelines",
      label: "Travel Guidelines",
      icon: BookOpen,
      description: travelData
        ? `Permits: ${travelData.permits.join(", ")}. Best season: ${travelData.bestSeason}. Difficulty: ${travelData.difficulty}.`
        : "General travel and safety guidelines for this region.",
      sizeKB: 320,
      included: true,
    },
    {
      id: "biodiversity",
      label: "Biodiversity Guide",
      icon: Leaf,
      description: "Native flora and fauna, conservation areas, and wildlife spotting tips.",
      sizeKB: 1200,
      included: true,
    },
    {
      id: "emergency",
      label: "Emergency Support",
      icon: Phone,
      description: "Local emergency numbers, hospital locations, embassy info, and first-aid guidance.",
      sizeKB: 180,
      included: true,
    },
    {
      id: "itinerary",
      label: "Sample Itinerary",
      icon: FileText,
      description: travelData
        ? `${travelData.itinerary.length}-day suggested itinerary with daily plans.`
        : "Suggested day-by-day travel plan for this destination.",
      sizeKB: 150,
      included: true,
    },
  ];
};

const OfflinePackageDownload = () => {
  const { toast } = useToast();
  const [selectedRegion, setSelectedRegion] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState<Set<string>>(
    () => new Set(JSON.parse(localStorage.getItem("smartyatra_offline_packages") ?? "[]"))
  );
  const [packageItems, setPackageItems] = useState<PackageItem[]>([]);

  const handleRegionSelect = (regionId: string) => {
    setSelectedRegion(regionId);
    setPackageItems(getPackageItems(regionId));
  };

  const toggleItem = (itemId: string) => {
    setPackageItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, included: !item.included } : item
      )
    );
  };

  const totalSize = packageItems
    .filter((p) => p.included)
    .reduce((sum, p) => sum + p.sizeKB, 0);

  const handleDownload = async () => {
    if (!selectedRegion) return;
    setDownloading(true);

    // Simulate download with progress
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const newDownloaded = new Set(downloaded);
    newDownloaded.add(selectedRegion);
    setDownloaded(newDownloaded);
    localStorage.setItem(
      "smartyatra_offline_packages",
      JSON.stringify([...newDownloaded])
    );

    setDownloading(false);
    const region = nepalRegions.find((r) => r.id === selectedRegion);
    toast({
      title: "📦 Package Downloaded!",
      description: `${region?.name} offline package (${(totalSize / 1024).toFixed(1)} MB) saved for offline use.`,
    });
  };

  const removePackage = (regionId: string) => {
    const newDownloaded = new Set(downloaded);
    newDownloaded.delete(regionId);
    setDownloaded(newDownloaded);
    localStorage.setItem(
      "smartyatra_offline_packages",
      JSON.stringify([...newDownloaded])
    );
    toast({ title: "Package removed from offline storage." });
  };

  const region = nepalRegions.find((r) => r.id === selectedRegion);
  const isAlreadyDownloaded = downloaded.has(selectedRegion);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-display text-xl font-bold flex items-center gap-2">
          <Download className="w-5 h-5 text-primary" /> Offline Travel Package
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Download destination packages for areas with limited connectivity. Includes maps, culture, biodiversity, and emergency info.
        </p>
      </div>

      {/* Destination Selection */}
      <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <MapPin className="w-4 h-4 text-primary" /> Select Destination
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {nepalRegions.map((r) => (
            <button
              key={r.id}
              onClick={() => handleRegionSelect(r.id)}
              className={`text-left px-3 py-2.5 rounded-xl border text-sm transition-all ${
                selectedRegion === r.id
                  ? "border-primary bg-primary/5 font-medium"
                  : "border-border hover:border-primary/30"
              }`}
            >
              <p className="text-xs font-medium truncate">{r.name}</p>
              {downloaded.has(r.id) && (
                <Badge className="mt-1 text-[9px] px-1 py-0 bg-green-500/10 text-green-600 border-green-500/30" variant="outline">
                  <CheckCircle2 className="w-2.5 h-2.5 mr-0.5" /> Saved
                </Badge>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Package Contents */}
      <AnimatePresence mode="wait">
        {selectedRegion && (
          <motion.div
            key={selectedRegion}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-card border border-border rounded-2xl p-5 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">
                {region?.name} — Package Contents
              </h3>
              <span className="text-xs text-muted-foreground">
                {(totalSize / 1024).toFixed(1)} MB selected
              </span>
            </div>

            <div className="grid sm:grid-cols-2 gap-2">
              {packageItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => toggleItem(item.id)}
                  className={`flex items-start gap-3 p-3 rounded-xl border transition-all text-left ${
                    item.included
                      ? "border-primary/30 bg-primary/5"
                      : "border-border opacity-50"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    item.included ? "bg-primary/10" : "bg-secondary"
                  }`}>
                    <item.icon className={`w-4 h-4 ${item.included ? "text-primary" : "text-muted-foreground"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium">{item.label}</p>
                    <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">{item.description}</p>
                    <span className="text-[10px] text-muted-foreground mt-1 block">
                      {item.sizeKB < 1000 ? `${item.sizeKB} KB` : `${(item.sizeKB / 1024).toFixed(1)} MB`}
                    </span>
                  </div>
                  {item.included && <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 pt-2">
              {isAlreadyDownloaded ? (
                <>
                  <Badge variant="outline" className="text-green-600 border-green-500/30 gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Downloaded
                  </Badge>
                  <Button variant="outline" size="sm" className="rounded-xl text-xs" onClick={() => removePackage(selectedRegion)}>
                    Remove
                  </Button>
                  <Button size="sm" className="rounded-xl text-xs" onClick={handleDownload} disabled={downloading}>
                    {downloading ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Download className="w-3 h-3 mr-1" />}
                    Re-download
                  </Button>
                </>
              ) : (
                <Button className="rounded-xl gap-1.5" onClick={handleDownload} disabled={downloading || totalSize === 0}>
                  {downloading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Downloading...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" /> Download Package ({(totalSize / 1024).toFixed(1)} MB)
                    </>
                  )}
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Downloaded Packages */}
      {downloaded.size > 0 && (
        <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <WifiOff className="w-4 h-4 text-muted-foreground" /> Saved Offline Packages
          </h3>
          <div className="flex flex-wrap gap-2">
            {[...downloaded].map((id) => {
              const r = nepalRegions.find((reg) => reg.id === id);
              return r ? (
                <Badge key={id} variant="outline" className="gap-1.5 text-xs py-1 px-2.5">
                  <Mountain className="w-3 h-3" /> {r.name}
                </Badge>
              ) : null;
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default OfflinePackageDownload;
