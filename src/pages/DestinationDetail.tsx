import { ArrowLeft, CalendarDays, MapPin, Mountain, Route, Users, Wallet } from "lucide-react";
import { Link, Navigate, useParams } from "react-router-dom";
import { KATHMANDU_COORDS, distanceKm, getDestinationById, getNearbyDestinations, type CrowdLevel } from "@/data/destinations";
import DestinationPhotoGallery from "@/components/DestinationPhotoGallery";

const DestinationDetail = () => {
  const { id } = useParams();
  const destination = id ? getDestinationById(id) : null;

  if (!destination) {
    return <Navigate to="/" replace />;
  }

  const distanceFromKathmandu = distanceKm(KATHMANDU_COORDS, destination.coords);
  const nearbyDestinations = getNearbyDestinations(destination.id, 4);

  const crowdLevelClass: Record<CrowdLevel, string> = {
    Quiet: "bg-emerald-100 text-emerald-700",
    Moderate: "bg-amber-100 text-amber-700",
    Busy: "bg-rose-100 text-rose-700",
  };

  const stats = [
    { key: "crowd", label: "Crowd Level", value: destination.crowd, icon: Users },
    { key: "months", label: "Best Months", value: destination.bestSeason, icon: CalendarDays },
    {
      key: "budget",
      label: "Budget / Day",
      value: `${destination.budgetPerDayUsd} · ${destination.budgetPerDayNpr}`,
      icon: Wallet,
    },
    { key: "altitude", label: "Altitude", value: `${destination.altitudeM.toLocaleString()} m`, icon: Mountain },
    { key: "distance", label: "From Kathmandu", value: `${distanceFromKathmandu.toFixed(0)} km`, icon: MapPin },
    { key: "difficulty", label: "Difficulty", value: destination.difficulty, icon: Route },
  ];

  return (
    <div className="min-h-screen bg-background">
      <section className="relative h-[52vh] min-h-[320px] w-full overflow-hidden">
        <img src={destination.img} alt={destination.name} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-black/35" />

        <div className="container absolute inset-0 z-10 flex flex-col justify-between py-6 md:py-8">
          <Link
            to={`/explore-nepal?selected=${destination.id}#destinations`}
            className="inline-flex w-fit items-center gap-2 rounded-full border border-white/40 bg-black/30 px-4 py-2 text-sm text-white hover:bg-black/45 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to map
          </Link>

          <div className="pb-3 md:pb-6 text-white">
            <h1 className="text-3xl md:text-5xl font-display font-bold leading-tight">
              {destination.name} · {destination.area}
            </h1>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-card/80">
        <div className="container">
          <div className="grid grid-cols-2 lg:grid-cols-6 lg:divide-x lg:divide-border">
            {stats.map((stat, index) => {
              const Icon = stat.icon;

              return (
                <div
                  key={stat.key}
                  className={`flex items-start gap-3 px-3 py-4 md:px-4 ${index % 2 === 1 ? "border-l border-border lg:border-l-0" : ""}`}
                >
                  <Icon className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{stat.label}</p>
                    {stat.key === "crowd" ? (
                      <span
                        className={`mt-1.5 inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${crowdLevelClass[destination.crowd]}`}
                      >
                        {stat.value}
                      </span>
                    ) : (
                      <p className="mt-1.5 text-sm font-semibold leading-tight text-foreground/90">{stat.value}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="container py-8 md:py-12">
        <div>
          <h2 className="text-2xl md:text-3xl font-display font-bold">Photo Gallery</h2>
          <p className="text-sm text-muted-foreground mt-1">Click any photo to open the lightbox and browse.</p>

          <DestinationPhotoGallery
            destinationName={destination.name}
            destinationArea={destination.area}
            destinationType={destination.category}
            photos={destination.gallery}
          />
        </div>

        <div className="mt-12 md:mt-16">
          <div className="flex items-end justify-between gap-4 mb-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-display font-bold">Nearby destinations</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Keep exploring nearby places around {destination.name}.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto pb-2">
            <div className="grid grid-flow-col auto-cols-[86%] sm:auto-cols-[48%] lg:auto-cols-[32%] xl:auto-cols-[24%] gap-4">
              {nearbyDestinations.map((nearbyDestination) => (
                <Link
                  key={nearbyDestination.id}
                  to={`/destinations/${nearbyDestination.id}`}
                  className="group overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <div className="aspect-[16/10] overflow-hidden">
                    <img
                      src={nearbyDestination.img}
                      alt={nearbyDestination.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>

                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-base font-semibold leading-tight">{nearbyDestination.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {nearbyDestination.distance.toFixed(0)} km away
                        </p>
                      </div>

                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${crowdLevelClass[nearbyDestination.crowd]}`}
                      >
                        {nearbyDestination.crowd}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DestinationDetail;
