import { motion } from "framer-motion";
import destKathmandu from "@/assets/dest-kathmandu.jpg";
import destPokhara from "@/assets/dest-pokhara.jpg";
import destEverest from "@/assets/dest-everest.jpg";
import destAnnapurna from "@/assets/dest-annapurna.jpg";
import aboutImg from "@/assets/about-nepal.jpg";
import destChitwan from "@/assets/dest-chitwan.jpg";

const images = [
  { src: destKathmandu, alt: "Boudhanath Stupa Kathmandu" },
  { src: destPokhara, alt: "Phewa Lake Pokhara" },
  { src: destEverest, alt: "Everest Trek" },
  { src: destAnnapurna, alt: "Annapurna Circuit" },
  { src: aboutImg, alt: "Nepali Temple" },
  { src: destChitwan, alt: "Chitwan Wildlife" },
];

const GallerySection = () => {
  return (
    <section id="gallery" className="py-24 md:py-32 bg-secondary/30">
      <div className="container">
        <motion.div
          className="text-center max-w-2xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4 font-medium">
            Gallery
          </p>
          <h2 className="text-3xl md:text-5xl font-display font-bold">
            Moments from Nepal
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {images.map((img, i) => (
            <motion.div
              key={i}
              className={`overflow-hidden rounded-xl ${
                i === 0 || i === 5 ? "row-span-2 aspect-[3/4]" : "aspect-[4/3]"
              }`}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
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
    </section>
  );
};

export default GallerySection;
