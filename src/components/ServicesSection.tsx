import { motion } from "framer-motion";
import { Map, CloudSun, Backpack, Wallet, Route, Compass, Shield, Download } from "lucide-react";

const features = [
  {
    icon: Map,
    title: "Interactive Tourism Heatmap",
    description: "See real-time tourist density across Nepal's destinations on an interactive map. Identify crowded and less crowded places instantly.",
    link: "/explore-nepal",
    linkLabel: "Open Map",
  },
  {
    icon: CloudSun,
    title: "Tourist Flow Forecast",
    description: "Analyze tourism trends and predict short-term tourist activity. Know if a location will get busier or quieter in the coming weeks.",
    link: "/explore-nepal",
    linkLabel: "See Forecast",
  },
  {
    icon: Backpack,
    title: "Smart Travel Insights",
    description: "Get crowd conditions, weather data, packing suggestions, and recommendations for every destination — all in one place.",
    link: "#services",
    linkLabel: "Try It",
  },
  {
    icon: Wallet,
    title: "Budget Estimator",
    description: "Estimate trip costs based on duration and accommodation. Toggle between USD and NPR with live exchange rates.",
    link: "#services",
    linkLabel: "Estimate Budget",
  },
  {
    icon: Compass,
    title: "Alternative Destination Suggestions",
    description: "When a destination is crowded, discover similar but less crowded locations for a better experience without the congestion.",
    link: "/explore-nepal",
    linkLabel: "Explore",
  },
  {
    icon: Shield,
    title: "Smart SOS Safety System",
    description: "Set travel timers, add emergency contacts, and get altitude sickness warnings. SOS triggers automatically if you go offline too long.",
    link: "#services",
    linkLabel: "Setup Safety",
  },
  {
    icon: Download,
    title: "Offline Travel Package",
    description: "Download offline maps, cultural guides, biodiversity info, and emergency tools for remote areas with limited connectivity.",
    link: "#services",
    linkLabel: "Download",
  },
  {
    icon: Route,
    title: "Multi-Stop Trip Planner",
    description: "Build a custom itinerary by adding destinations, reordering stops, and getting permit and gear requirements for each region.",
    link: "#services",
    linkLabel: "Plan Trip",
  },
];

const ServicesSection = () => {
  return (
    <section id="services" className="py-24 md:py-32 bg-background">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4 font-medium">
              Platform Features
            </p>
            <h2 className="text-3xl md:text-4xl font-display font-bold leading-tight">
              Everything you need to
              <br />
              plan your Nepal trip.
            </h2>
          </motion.div>
          <motion.p
            className="text-muted-foreground text-sm leading-relaxed self-end max-w-md"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Eight powerful tools powered by live data — from crowd analytics, safety systems,
            and offline packages to budget planning and smart packing.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              className="group relative p-6 rounded-2xl bg-card border border-border shadow-card hover:shadow-card-hover transition-shadow duration-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
            >
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                <feature.icon className="w-5 h-5" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">{feature.description}</p>
              <a
                href={feature.link}
                className="text-xs font-medium text-primary hover:underline underline-offset-4"
              >
                {feature.linkLabel} →
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
