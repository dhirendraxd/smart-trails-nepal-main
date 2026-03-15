import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import destKathmandu from "@/assets/dest-kathmandu.jpg";
import destPokhara from "@/assets/dest-pokhara.jpg";
import destEverest from "@/assets/dest-everest.jpg";
import destChitwan from "@/assets/dest-chitwan.jpg";
import destAnnapurna from "@/assets/dest-annapurna.jpg";
import destLumbini from "@/assets/dest-lumbini.jpg";

const destinations = [
  { name: "Kathmandu Valley", img: destKathmandu, category: "Heritage & Culture", regionId: "kathmandu" },
  { name: "Pokhara", img: destPokhara, category: "Lake & Mountains", regionId: "pokhara" },
  { name: "Everest Region", img: destEverest, category: "Trekking & Adventure", regionId: "everest" },
  { name: "Chitwan", img: destChitwan, category: "Wildlife Safari", regionId: "chitwan" },
  { name: "Annapurna Circuit", img: destAnnapurna, category: "Trekking", regionId: "annapurna" },
  { name: "Lumbini", img: destLumbini, category: "Spiritual Pilgrimage", regionId: "lumbini" },
];

const DestinationsSection = () => {
  return (
    <section id="destinations" className="py-24 md:py-32 bg-secondary/30">
      <div className="container">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-12 md:mb-16 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4 font-medium">
              Explore Nepal
            </p>
            <h2 className="text-3xl md:text-5xl font-display font-bold">
              Where to Visit?
            </h2>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Link
              to="/dashboard"
              className="inline-block text-sm font-medium border border-border px-6 py-3 rounded-full hover:bg-accent transition-colors"
            >
              View All Destinations →
            </Link>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {destinations.map((dest, i) => (
            <Link
              key={dest.name}
              to={`/dashboard?region=${dest.regionId}`}
            >
              <motion.div
                className={`group relative overflow-hidden rounded-xl cursor-pointer ${
                  i === 0 ? "sm:row-span-2 min-h-[260px] sm:min-h-0 h-full" : "min-h-[220px] sm:min-h-[240px]"
                }`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
              >
                <img
                  src={dest.img}
                  alt={dest.name}
                  className="w-full h-full object-cover absolute inset-0 group-hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
                  <p className="text-white/50 text-xs uppercase tracking-widest mb-1">
                    {dest.category}
                  </p>
                  <h3 className="text-white font-display font-semibold text-lg md:text-xl">
                    {dest.name}
                  </h3>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DestinationsSection;
