import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import heroImg from "@/assets/hero-nepal.jpg";

const HeroSection = () => {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);

  return (
    <section ref={ref} className="relative h-[100dvh] flex items-center justify-center overflow-hidden">
      <motion.div className="absolute inset-0" style={{ y: imgY }}>
        <img
          src={heroImg}
          alt="Nepal Himalayas with ancient temple and mountain backdrop"
          className="w-full h-[120%] object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/25 to-black/70" />
      </motion.div>

      <div className="relative z-10 container text-center">
        <motion.p
          className="text-white/50 text-xs uppercase tracking-[0.35em] mb-6 sm:mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Data-Driven Nepal Travel Platform
        </motion.p>

        <motion.h1
          className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-display font-bold text-white leading-[1.08] mb-6 sm:mb-8 max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15 }}
        >
          Travel Nepal
          <br />
          <span className="italic font-normal text-white/80">Smarter, Not Harder</span>
        </motion.h1>

        <motion.p
          className="text-white/50 text-sm md:text-base max-w-lg mx-auto mb-8 sm:mb-10 leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          Live crowd heatmaps, real-time weather forecasts, smart packing lists, and budget tools — everything you need to plan the perfect Nepal trip.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45 }}
        >
          <Link
            to="/dashboard"
            className="w-full sm:w-auto text-center bg-white text-foreground font-medium text-sm px-10 py-4 rounded-full hover:bg-white/90 transition-all"
          >
            Open Live Map
          </Link>
          <Link
            to="/budget"
            className="w-full sm:w-auto text-center border border-white/20 text-white/70 font-medium text-sm px-10 py-4 rounded-full hover:bg-white/10 transition-all"
          >
            Estimate Budget
          </Link>
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-10">
        <div className="container px-6">
          <motion.div
            className="flex items-center justify-between py-5 sm:py-6 border-t border-white/10 text-white/40 text-[11px] sm:text-xs tracking-wide"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            <span>10 Regions Tracked</span>
            <span>Live Weather Data</span>
            <span className="hidden sm:inline">7-Day Forecasts</span>
            <span className="hidden md:inline">Smart Packing Lists</span>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
