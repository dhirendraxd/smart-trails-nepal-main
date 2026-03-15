import { motion } from "framer-motion";
import aboutImg from "@/assets/about-nepal.jpg";

const stats = [
  { value: "10", label: "Regions Tracked" },
  { value: "Live", label: "Weather & Crowds" },
  { value: "7-Day", label: "Forecast Engine" },
  { value: "Free", label: "To Use" },
];

const AboutSection = () => {
  return (
    <section id="about" className="py-24 md:py-32 bg-background">
      <div className="container">
        <div className="grid md:grid-cols-2 lg:grid-cols-[1fr_auto_1fr] gap-12 lg:gap-16 items-center">
          <motion.div
            className="grid grid-cols-2 gap-8"
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            {stats.map((stat) => (
              <div key={stat.label} className="text-center md:text-left">
                <p className="text-3xl md:text-4xl font-display font-bold text-foreground">
                  {stat.value}
                </p>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mt-1">
                  {stat.label}
                </p>
              </div>
            ))}
          </motion.div>

          <motion.div
            className="relative justify-center hidden lg:flex"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="relative w-72 h-72 md:w-[360px] md:h-[360px]">
              <div className="absolute inset-0 rounded-full border-2 border-border" />
              <img
                src={aboutImg}
                alt="Nepal landscape"
                className="w-full h-full object-cover rounded-full"
              />
              <div className="absolute -inset-4 rounded-full border border-border/40" />
              <div className="absolute -inset-8 rounded-full border border-border/20" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4 font-medium">
              What is SmartYatra
            </p>
            <h2 className="text-3xl md:text-4xl font-display font-bold leading-tight mb-6">
              Your Nepal Trip,
              <br />
              <span className="text-muted-foreground">Powered by Data</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6 text-sm">
              SmartYatra is an open travel intelligence platform for Nepal. We pull real-time
              weather data from Open-Meteo, destination info from Wikipedia, and combine it with
              crowd analytics to give you a complete picture of every region before you go.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-8 text-sm">
              Plan with our interactive heatmap, get weather-based packing suggestions,
              estimate your budget with live NPR exchange rates, and build multi-stop
              itineraries — all in one place.
            </p>
            <div className="flex flex-wrap items-center gap-4 sm:gap-6">
              <a
                href="/explore-nepal"
                className="bg-primary text-primary-foreground font-medium text-sm px-8 py-3.5 rounded-full hover:opacity-90 transition-opacity"
              >
                Explore Destinations
              </a>
              <a
                href="#services"
                className="text-sm font-medium text-foreground hover:text-muted-foreground transition-colors underline underline-offset-4"
              >
                View Features
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
