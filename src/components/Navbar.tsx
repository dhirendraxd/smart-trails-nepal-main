import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Mountain, Menu, X, Map, Briefcase, Image } from "lucide-react";
import { motion, useMotionValueEvent, useScroll, AnimatePresence } from "framer-motion";

export interface NavbarProps {
  variant?: "hero" | "solid";
  extraLinks?: { label: string; href: string; icon?: typeof Map }[];
  rightSlot?: ReactNode;
}

const baseLinks = [
  { label: "Destinations", href: "#destinations", icon: Map },
  { label: "Services", href: "#services", icon: Briefcase },
  { label: "Gallery", href: "#gallery", icon: Image },
];

const scrollToHash = (href: string) => {
  const id = href.replace("#", "");
  if (!id) {
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
};

const Navbar = ({ variant = "hero", extraLinks, rightSlot }: NavbarProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pastHero, setPastHero] = useState(false);
  const { scrollY } = useScroll();

  const isHero = variant === "hero";
  const links = [...baseLinks, ...(extraLinks || [])];

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (isHero) setPastHero(latest > window.innerHeight * 0.8);
  });

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("#")) {
      e.preventDefault();
      scrollToHash(href);
    }
    setMobileOpen(false);
  };

  if (isHero) {
    return (
      <>
        <motion.nav
          className="absolute top-0 left-0 right-0 z-50 h-16 sm:h-20"
          animate={{ opacity: pastHero ? 0 : 1 }}
          transition={{ duration: 0.3 }}
          style={{ pointerEvents: pastHero ? "none" : "auto" }}
        >
          <div className="container flex items-center justify-between h-full">
            <Link to="/" className="flex items-center gap-2">
              <Mountain
                className="w-5 h-5 sm:w-6 sm:h-6 text-white/90"
                style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.4))" }}
              />
              <span
                className="font-display font-bold text-lg sm:text-xl text-white/90 tracking-tight"
                style={{ textShadow: "0 1px 3px rgba(0,0,0,0.3)", letterSpacing: "0.04em" }}
              >
                SmartYatra
              </span>
            </Link>

            <div className="hidden lg:flex items-center gap-1">
              {links.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => handleLinkClick(e, link.href)}
                  className="text-[13px] font-medium tracking-[0.15em] uppercase px-4 py-2 text-white/50 hover:text-white/90 transition-colors duration-300 rounded-full"
                  style={{ textShadow: "0 1px 2px rgba(0,0,0,0.25)" }}
                >
                  {link.label}
                </a>
              ))}
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <a
                href="#destinations"
                onClick={(e) => handleLinkClick(e, "#destinations")}
                className="hidden sm:inline-block font-medium text-sm text-white/80 border border-white/15 hover:border-white/30 hover:text-white px-5 sm:px-6 py-2 sm:py-2.5 rounded-full backdrop-blur-[2px] transition-all duration-300"
                style={{ textShadow: "0 1px 1px rgba(0,0,0,0.2)" }}
              >
                Explore Destinations
              </a>
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-2 -mr-2 text-white/70 hover:text-white transition-colors"
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </motion.nav>

        <AnimatePresence>
          {mobileOpen && !pastHero && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40 bg-black/40 lg:hidden"
                onClick={() => setMobileOpen(false)}
              />
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="fixed inset-x-0 top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10 pt-16 pb-6 px-6 lg:hidden"
              >
                <button
                  onClick={() => setMobileOpen(false)}
                  className="absolute top-4 right-4 p-2 text-white/60 hover:text-white transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex flex-col gap-1">
                  {links.map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      onClick={(e) => handleLinkClick(e, link.href)}
                      className="flex items-center gap-3 text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 uppercase tracking-wider px-3 py-3 rounded-xl transition-colors"
                    >
                      {link.icon && <link.icon className="w-4 h-4 text-white/40" />}
                      {link.label}
                    </a>
                  ))}

                  <div className="border-t border-white/10 mt-3 pt-3">
                    <a
                      href="#destinations"
                      onClick={(e) => handleLinkClick(e, "#destinations")}
                      className="block text-sm font-medium bg-white/10 text-white border border-white/20 hover:bg-white/15 px-6 py-3 rounded-full text-center transition-colors"
                    >
                      Explore Destinations
                    </a>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </>
    );
  }

  return (
    <>
      <nav className="sticky top-0 z-50 h-14 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="container flex items-center justify-between h-full">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <Mountain className="w-4 h-4 text-foreground" />
            <span className="font-display font-bold text-sm text-foreground tracking-tight">SmartYatra</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link.href)}
                className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent px-3 py-1.5 rounded-full transition-all duration-200"
              >
                {link.icon && <link.icon className="w-3.5 h-3.5" />}
                {link.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {rightSlot}
            <a
              href="#destinations"
              onClick={(e) => handleLinkClick(e, "#destinations")}
              className="hidden sm:block text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Explore Destinations
            </a>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 -mr-2 text-foreground hover:bg-accent rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-x-0 z-50 bg-card border-b border-border shadow-lg md:hidden"
              style={{ top: 56 }}
            >
              <div className="container py-3 flex flex-col gap-1">
                {links.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={(e) => handleLinkClick(e, link.href)}
                    className="flex items-center gap-3 text-sm font-medium text-foreground hover:bg-accent px-3 py-3 rounded-xl transition-colors"
                  >
                    {link.icon && <link.icon className="w-4 h-4 text-muted-foreground" />}
                    {link.label}
                  </a>
                ))}

                <div className="border-t border-border mt-1 pt-2">
                  <a
                    href="#destinations"
                    onClick={(e) => handleLinkClick(e, "#destinations")}
                    className="block text-sm font-medium text-center text-foreground bg-accent hover:bg-accent/80 px-3 py-3 rounded-xl transition-colors"
                  >
                    Explore Destinations
                  </a>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
