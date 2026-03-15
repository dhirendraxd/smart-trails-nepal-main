import { motion } from "framer-motion";
import { Users, BarChart3, Shield } from "lucide-react";

const cards = [
  {
    icon: Users,
    title: "Seamless Team Collaboration",
    description: "Coordinate plans and communicate with your travel group effortlessly.",
    rotation: "-rotate-3",
    translateY: "md:translate-y-6",
  },
  {
    icon: BarChart3,
    title: "All-in-One Travel Planning",
    description: "Multiple planning tools combined into one simple platform.",
    rotation: "",
    translateY: "",
    elevated: true,
  },
  {
    icon: Shield,
    title: "Secure Payments & Billing",
    description: "Accept payments and manage billing safely with built-in security.",
    rotation: "rotate-3",
    translateY: "md:translate-y-6",
  },
];

const FeatureCards = () => {
  return (
    <section id="features" className="py-16 md:py-24 overflow-hidden">
      <div className="container">
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 max-w-5xl mx-auto">
          {cards.map((card, i) => (
            <motion.div
              key={card.title}
              className={`
                w-full md:w-80 bg-card border border-border rounded-2xl p-6 pb-8 shadow-card
                transition-shadow duration-300 hover:shadow-card-hover
                ${card.rotation} ${card.translateY}
                ${card.elevated ? "md:scale-105 md:z-10" : ""}
              `}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
            >
              <h3 className="font-display font-semibold text-lg mb-1.5">{card.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">{card.description}</p>

              {/* Card illustration placeholder */}
              <div className="w-full aspect-[4/3] rounded-xl bg-secondary/70 border border-border flex items-center justify-center">
                <card.icon className="w-10 h-10 text-muted-foreground/40" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureCards;
