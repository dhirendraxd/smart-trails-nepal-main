import { motion } from "framer-motion";

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Solo Trekker, Vancouver",
    text: "The crowd heatmap showed Annapurna was packed, so I pivoted to Langtang Valley based on SmartYatra's alternative suggestion. Way less crowded and the smart packing list was spot-on for the snow conditions.",
  },
  {
    name: "Marco Rossi",
    role: "Travel Photographer, Milan",
    text: "I check the 7-day forecast on SmartYatra before every shoot. The live weather data for each region is incredibly accurate — it helped me plan around a 3-day rain window in Pokhara.",
  },
  {
    name: "Priya Sharma",
    role: "Family Trip Planner, Delhi",
    text: "The budget estimator with live NPR conversion was a lifesaver. We planned a 10-day family trip across Kathmandu, Chitwan, and Pokhara, and the cost breakdown was within 5% of our actual spend.",
  },
];

const TestimonialsSection = () => {
  return (
    <section className="py-24 md:py-32 bg-background">
      <div className="container max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4 font-medium">
            From Our Users
          </p>
          <h2 className="text-3xl md:text-4xl font-display font-bold leading-tight">
            How travelers use
            <br />
            SmartYatra's tools.
          </h2>
        </motion.div>

        <div className="space-y-0 divide-y divide-border">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              className="py-10 first:pt-0 last:pb-0"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              <p className="text-foreground text-lg md:text-xl leading-relaxed mb-6 font-body">
                "{t.text}"
              </p>
              <p className="text-sm text-muted-foreground">
                <span className="text-foreground font-medium">{t.name}</span>
                {" — "}
                {t.role}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
