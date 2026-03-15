import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const PressSection = () => {
  return (
    <section className="py-20 md:py-28 bg-secondary/30">
      <div className="container max-w-3xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-6 font-medium">
            How It Works
          </p>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-display font-bold leading-snug mb-8">
            Pick a destination → check live conditions → download your packing list → go.
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-lg mx-auto mb-10">
            SmartYatra pulls real-time data from Open-Meteo weather APIs and Wikipedia to give you
            accurate, up-to-date information for every region. No guesswork, no outdated guidebooks.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/dashboard"
              className="bg-primary text-primary-foreground font-medium text-sm px-8 py-3.5 rounded-full hover:opacity-90 transition-opacity"
            >
              Try the Live Map
            </Link>
            <Link
              to="/trip"
              className="border border-border font-medium text-sm px-8 py-3.5 rounded-full hover:bg-accent transition-colors"
            >
              Plan a Trip
            </Link>
          </div>
        </motion.div>

        <motion.div
          className="mt-14 md:mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {[
            { value: "Open-Meteo", label: "Weather API" },
            { value: "Wikipedia", label: "Destination Info" },
            { value: "Live Rates", label: "USD/NPR Exchange" },
            { value: "Leaflet", label: "Interactive Maps" },
          ].map((item) => (
            <div key={item.label}>
              <p className="font-display font-bold text-sm text-foreground">{item.value}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{item.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default PressSection;
