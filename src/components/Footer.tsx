import { Link } from "react-router-dom";
import { Mountain } from "lucide-react";

const smoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
  if (!href.startsWith("#")) return;
  e.preventDefault();
  const id = href.slice(1);
  if (!id) {
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
};

const footerLinks = {
  Tools: [
    { label: "Live Heatmap", href: "#services" },
    { label: "Budget Estimator", href: "#services" },
    { label: "Trip Planner", href: "#services" },
    { label: "Packing Lists", href: "#services" },
  ],
  Destinations: [
    { label: "Kathmandu", href: "/explore-nepal?selected=kathmandu" },
    { label: "Pokhara", href: "/explore-nepal?selected=pokhara" },
    { label: "Everest Region", href: "/explore-nepal?selected=everest" },
    { label: "Annapurna", href: "/explore-nepal?selected=annapurna" },
  ],
  About: [
    { label: "How It Works", href: "#about" },
    { label: "Features", href: "#services" },
    { label: "Gallery", href: "#gallery" },
  ],
};

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground pt-16 pb-8">
      <div className="container">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-8 md:gap-10 mb-14">
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-3">
              <Mountain className="w-5 h-5" />
              <span className="font-display font-bold text-lg">SmartYatra</span>
            </Link>
            <p className="text-primary-foreground/40 text-sm leading-relaxed max-w-xs">
              A data-driven travel platform for Nepal. Live weather, crowd analytics,
              smart packing lists, and budget tools — all free to use.
            </p>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-display font-semibold text-xs mb-4 uppercase tracking-[0.2em] text-primary-foreground/50">
                {title}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      onClick={(e) => smoothScroll(e, link.href)}
                      className="text-primary-foreground/35 text-sm hover:text-primary-foreground/80 transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-primary-foreground/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-primary-foreground/25 text-xs">
            © 2026 SmartYatra — Open travel intelligence for Nepal
          </p>
          <p className="text-primary-foreground/20 text-xs">
            Weather data by Open-Meteo · Maps by Leaflet
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
