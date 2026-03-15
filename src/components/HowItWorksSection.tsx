import { motion } from "framer-motion";
import { MapPin, BarChart3, Route } from "lucide-react";

const steps = [
  {
    icon: MapPin,
    step: "01",
    title: "Select Destination",
    description: "Browse Nepal's regions and pick your destination of interest.",
  },
  {
    icon: BarChart3,
    step: "02",
    title: "View Insights",
    description: "Get crowd analytics, weather data, and smart predictions.",
  },
  {
    icon: Route,
    step: "03",
    title: "Plan Smarter",
    description: "Use budget tools and alternative suggestions to optimize your trip.",
  },
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-20 md:py-28 bg-secondary/50">
      <div className="container">
        <motion.div
          className="text-center max-w-2xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            How it works
          </h2>
          <p className="text-muted-foreground text-lg">
            Three simple steps to plan your perfect Nepal trip.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {steps.map((step, i) => (
            <motion.div
              key={step.step}
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.15 }}
            >
              <div className="w-16 h-16 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-5">
                <step.icon className="w-7 h-7" />
              </div>
              <div className="text-xs font-semibold text-muted-foreground mb-2 tracking-widest uppercase">
                Step {step.step}
              </div>
              <h3 className="font-display font-semibold text-xl mb-2">{step.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
