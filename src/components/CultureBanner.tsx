import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import cultureImg from "@/assets/culture-nepal.jpg";

const CultureBanner = () => {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

  return (
    <section ref={ref} className="relative py-0 overflow-hidden">
      <div className="relative h-[420px] sm:h-[500px] md:h-[600px] overflow-hidden">
        <motion.img
          src={cultureImg}
          alt="Traditional Nepali cultural festival and masked dancer"
          className="w-full h-[130%] object-cover absolute inset-0"
          style={{ y: imgY }}
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
        
        <div className="absolute inset-0 flex items-center">
          <div className="container">
            <motion.div
              className="max-w-xl"
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <p className="text-white/50 text-xs uppercase tracking-[0.3em] mb-4 font-medium">
                Region Deep-Dives
              </p>
              <h2 className="text-2xl sm:text-3xl md:text-5xl font-display font-bold text-white leading-tight mb-4">
                Permits, Itineraries
                <br />
                & Local Tips
              </h2>
              <p className="text-white/60 leading-relaxed mb-8 max-w-md text-sm sm:text-base">
                Every region comes with detailed travel data — required permits, essential gear lists,
                day-by-day itinerary suggestions, difficulty ratings, and insider tips from experienced trekkers.
              </p>
              <Link
                to="/dashboard?region=everest"
                className="inline-block bg-white text-foreground font-medium text-sm px-8 py-3.5 rounded-full hover:bg-white/90 transition-all"
              >
                See Everest Region Details
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CultureBanner;
