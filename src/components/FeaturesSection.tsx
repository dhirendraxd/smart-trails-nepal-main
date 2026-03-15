import { motion } from "framer-motion";
import {
  BarChart3,
  BrainCircuit,
  MapPin,
  Wallet,
  Shield,
  TrendingUp,
  Download,
  Compass,
} from "lucide-react";

const features = [
  {
    icon: MapPin,
    title: "Interactive Tourism Heatmap",
    description: "Visualize crowd density across Nepal's destinations on an interactive map.",
  },
  {
    icon: BrainCircuit,
    title: "Tourist Flow Forecast",
    description: "AI-powered tourist flow predictions with confidence indicators.",
  },
  {
    icon: BarChart3,
    title: "Smart Travel Insights",
    description: "Crowd conditions, weather, and recommendations for every destination.",
  },
  {
    icon: Wallet,
    title: "Budget Estimator",
    description: "Plan your trip costs with smart breakdowns and live currency rates.",
  },
  {
    icon: TrendingUp,
    title: "Alternative Suggestions",
    description: "Discover less crowded destinations with similar experiences.",
  },
  {
    icon: Shield,
    title: "Smart SOS Safety",
    description: "Emergency contacts, travel timers, and altitude sickness warnings.",
  },
  {
    icon: Download,
    title: "Offline Travel Package",
    description: "Download maps, culture guides, and emergency info for remote areas.",
  },
  {
    icon: Compass,
    title: "Multi-Stop Trip Planner",
    description: "Build custom itineraries with permits, gear, and cost estimates.",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-20 md:py-28">
      <div className="container">
        <motion.div
          className="text-center max-w-2xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything you need for smarter travel
          </h2>
          <p className="text-muted-foreground text-lg">
            Powerful tools designed for tourists and agencies alike.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
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
              <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
