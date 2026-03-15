import { Lightbulb, Shield, Mountain, Sun, Utensils, Banknote } from "lucide-react";
import { motion } from "framer-motion";

const tips = [
  {
    icon: Shield,
    title: "Travel Insurance",
    text: "Always get comprehensive travel insurance covering helicopter evacuation, especially for treks above 3,000m.",
  },
  {
    icon: Mountain,
    title: "Altitude Acclimatization",
    text: "Spend at least 2-3 days acclimatizing before ascending above 3,500m. Never ignore headaches or nausea.",
  },
  {
    icon: Sun,
    title: "Best Seasons",
    text: "October-November (autumn) and March-May (spring) offer the best trekking weather and clearest mountain views.",
  },
  {
    icon: Utensils,
    title: "Drink Safely",
    text: "Avoid tap water. Use purification tablets or boiled water. Dal Bhat (lentil rice) is the safest and most filling local meal.",
  },
  {
    icon: Banknote,
    title: "Cash is King",
    text: "ATMs are scarce outside Kathmandu and Pokhara. Carry enough Nepali rupees in small denominations for rural areas.",
  },
  {
    icon: Lightbulb,
    title: "Bargain Respectfully",
    text: "Bargaining is expected in markets and for taxis but keep it friendly. A few extra rupees mean more to locals than to you.",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

const TravelTips = () => {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="w-4 h-4 text-primary" />
        <h2 className="font-display font-semibold text-lg">Nepal Travel Tips</h2>
      </div>
      <motion.div variants={container} initial="hidden" animate="show" className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {tips.map((tip) => (
          <motion.div
            key={tip.title}
            variants={item}
            className="bg-card border border-border rounded-2xl p-4 hover:border-primary/20 transition-colors"
          >
            <tip.icon className="w-5 h-5 text-primary mb-2" />
            <p className="font-medium text-sm mb-1">{tip.title}</p>
            <p className="text-xs text-muted-foreground leading-relaxed">{tip.text}</p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default TravelTips;
