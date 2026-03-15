import { motion } from "framer-motion";
import heroImg from "@/assets/hero-nepal.jpg";
import destKathmandu from "@/assets/dest-kathmandu.jpg";
import destPokhara from "@/assets/dest-pokhara.jpg";
import destAnnapurna from "@/assets/dest-annapurna.jpg";
import destLumbini from "@/assets/dest-lumbini.jpg";

const galleryImages = [
  { src: destKathmandu, alt: "Kathmandu Heritage" },
  { src: destPokhara, alt: "Pokhara Lakes" },
  { src: destAnnapurna, alt: "Annapurna Trek" },
  { src: destLumbini, alt: "Lumbini Peace" },
];

const FinalCTA = () => {
  return (
    <section id="gallery" className="bg-background">
      <div className="container py-24 md:py-32">
        <div className="grid md:grid-cols-2 gap-3 md:gap-4 lg:gap-6">
          <motion.div
            className="relative overflow-hidden rounded-xl min-h-[400px] sm:min-h-[480px] lg:min-h-[580px]"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <img
              src={heroImg}
              alt="Nepal Himalayas panoramic view"
              className="w-full h-full object-cover absolute inset-0"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 md:p-10">
              <p className="text-white/50 text-xs uppercase tracking-[0.3em] mb-3 font-medium">
                Ready to explore?
              </p>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-white leading-tight mb-3">
                Check Live Conditions,
                <br />
                Pack Smart,
                <br />
                <span className="italic font-normal text-white/70">
                  & Travel with Confidence
                </span>
              </h2>
              <p className="text-white/50 text-sm mb-6 max-w-md">
                Open the dashboard to see real-time crowd levels, weather forecasts, and get a downloadable packing checklist for your destination.
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="/explore-nepal"
                  className="inline-block bg-white text-foreground font-medium text-sm px-8 py-3.5 rounded-full hover:bg-white/90 transition-all"
                >
                  Explore Destinations
                </a>
                <a
                  href="#services"
                  className="inline-block border border-white/20 text-white/70 font-medium text-sm px-8 py-3.5 rounded-full hover:bg-white/10 transition-all"
                >
                  View Features
                </a>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-2 gap-3 md:gap-4">
            {galleryImages.map((img, i) => (
              <motion.div
                key={img.alt}
                className="relative overflow-hidden rounded-xl aspect-square"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
