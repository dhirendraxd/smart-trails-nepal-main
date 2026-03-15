import TouristHeatmap from "@/components/TouristHeatmap";

const MapContent = () => {
  return (
    <div className="h-[calc(100vh-10rem)] sm:h-[calc(100vh-8rem)] relative rounded-2xl overflow-hidden border border-border">
      <div className="absolute inset-0">
        <TouristHeatmap minimal />
      </div>
    </div>
  );
};

export default MapContent;
