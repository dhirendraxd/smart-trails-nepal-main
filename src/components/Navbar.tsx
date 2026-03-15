import { useState, useEffect, type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Mountain, Menu, X, Map, Briefcase, Image, Calculator, Route, User, LogOut, Shield } from "lucide-react";
import { motion, useMotionValueEvent, useScroll, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useTripPlanner } from "@/contexts/TripPlannerContext";
import { useActivity } from "@/contexts/ActivityContext";

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

const appLinks = [
  { label: "Dashboard", href: "/dashboard", icon: User },
  { label: "Map", href: "/map", icon: Map },
  { label: "Budget", href: "/budget", icon: Calculator },
  { label: "Trip", href: "/trip", icon: Route },
  { label: "SOS", href: "/sos", icon: Shield },
];

const Navbar = ({ variant = "hero", extraLinks, rightSlot }: NavbarProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pastHero, setPastHero] = useState(false);
  const { scrollY } = useScroll();
  const location = useLocation();
  const { isLoggedIn, userName, logout } = useAuth();
  const { stops } = useTripPlanner();
  const { unreadCount } = useActivity();

  const isHero = variant === "hero";

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (isHero) setPastHero(latest > window.innerHeight * 0.8);
  });

  const links = isHero ? baseLinks : [...appLinks, ...(extraLinks || [])];

  const isActiveLink = (href: string) => {
    if (href.startsWith("#")) return false;
    return location.pathname === href;
  };

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("#")) {
      e.preventDefault();
      const id = href.replace("#", "");
      if (!id) window.scrollTo({ top: 0, behavior: "smooth" });
      else document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      setMobileOpen(false);
    } else {
      setMobileOpen(false);
    }
  };

  // ─── Hero variant ───
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
              <Link
                to="/login"
                className="hidden sm:inline-block font-medium text-sm text-white/50 hover:text-white/90 transition-colors"
                style={{ textShadow: "0 1px 2px rgba(0,0,0,0.25)" }}
              >
                Sign In
              </Link>
              <Link
                to="/map"
                className="hidden sm:inline-block font-medium text-sm text-white/80 border border-white/15 hover:border-white/30 hover:text-white px-5 sm:px-6 py-2 sm:py-2.5 rounded-full backdrop-blur-[2px] transition-all duration-300"
                style={{ textShadow: "0 1px 1px rgba(0,0,0,0.2)" }}
              >
                Explore Map
              </Link>
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

        {/* Hero mobile menu - full overlay */}
        <AnimatePresence>
          {mobileOpen && !pastHero && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40 bg-black/40 lg:hidden"
                onClick={() => setMobileOpen(false)}
              />
              {/* Panel */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="fixed inset-x-0 top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10 pt-16 pb-6 px-6 lg:hidden"
              >
                {/* Close button */}
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

                  <div className="border-t border-white/10 mt-3 pt-3 flex flex-col gap-2">
                    <Link
                      to="/login"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 text-sm font-medium text-white/60 hover:text-white px-3 py-3 rounded-xl transition-colors"
                    >
                      <User className="w-4 h-4" />
                      Sign In
                    </Link>
                    <Link
                      to="/map"
                      onClick={() => setMobileOpen(false)}
                      className="text-sm font-medium bg-white/10 text-white border border-white/20 hover:bg-white/15 px-6 py-3 rounded-full text-center transition-colors"
                    >
                      Explore Map
                    </Link>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </>
    );
  }

  // ─── Solid variant ───
  return (
    <>
      <nav className="sticky top-0 z-50 h-14 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="container flex items-center justify-between h-full">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <Mountain className="w-4 h-4 text-foreground" />
            <span className="font-display font-bold text-sm text-foreground tracking-tight">
              SmartYatra
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => {
              const active = isActiveLink(link.href);
              return link.href.startsWith("#") ? (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => handleLinkClick(e, link.href)}
                  className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent px-3 py-1.5 rounded-full transition-all duration-200"
                >
                  {link.icon && <link.icon className="w-3.5 h-3.5" />}
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.label}
                  to={link.href}
                  className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-all duration-200 relative ${
                    active
                      ? "text-foreground bg-accent"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
                >
                  {link.icon && <link.icon className="w-3.5 h-3.5" />}
                  {link.label}
                  {link.href === "/trip" && stops.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center">
                      {stops.length}
                    </span>
                  )}
                  {link.href === "/dashboard" && unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold flex items-center justify-center">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2 sm:gap-3">
            {rightSlot}
            {isLoggedIn ? (
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="text-xs font-medium hidden sm:flex items-center gap-1.5 text-muted-foreground">
                  <User className="w-3.5 h-3.5" />
                  {userName}
                </span>
                <button
                  onClick={logout}
                  className="text-muted-foreground hover:text-foreground transition-colors p-1"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden sm:block text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Sign In
              </Link>
            )}
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

      {/* Solid mobile menu - slide down with backdrop */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-x-0 z-50 bg-card border-b border-border shadow-lg md:hidden"
              style={{ top: 56 }}
            >
              <div className="container py-3 flex flex-col gap-1">
                {links.map((link) => {
                  const active = isActiveLink(link.href);
                  return link.href.startsWith("#") ? (
                    <a
                      key={link.label}
                      href={link.href}
                      onClick={(e) => handleLinkClick(e, link.href)}
                      className="flex items-center gap-3 text-sm font-medium text-foreground hover:bg-accent px-3 py-3 rounded-xl transition-colors"
                    >
                      {link.icon && <link.icon className="w-4 h-4 text-muted-foreground" />}
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      key={link.label}
                      to={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 text-sm font-medium px-3 py-3 rounded-xl transition-colors relative ${
                        active
                          ? "text-foreground bg-accent"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent"
                      }`}
                    >
                      {link.icon && <link.icon className="w-4 h-4" />}
                      {link.label}
                      {link.href === "/trip" && stops.length > 0 && (
                        <span className="ml-auto w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                          {stops.length}
                        </span>
                      )}
                      {link.href === "/dashboard" && unreadCount > 0 && (
                        <span className="ml-auto w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
                          {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                      )}
                    </Link>
                  );
                })}

                {/* Auth section */}
                <div className="border-t border-border mt-1 pt-2">
                  {isLoggedIn ? (
                    <div className="flex items-center justify-between px-3 py-3">
                      <span className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="w-4 h-4" />
                        {userName}
                      </span>
                      <button
                        onClick={() => { logout(); setMobileOpen(false); }}
                        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign out
                      </button>
                    </div>
                  ) : (
                    <Link
                      to="/login"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent px-3 py-3 rounded-xl transition-colors"
                    >
                      <User className="w-4 h-4" />
                      Sign In
                    </Link>
                  )}
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
