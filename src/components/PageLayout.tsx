import { type ReactNode } from "react";
import { motion } from "framer-motion";
import Navbar, { type NavbarProps } from "@/components/Navbar";
import Footer from "@/components/Footer";

interface PageLayoutProps {
  children: ReactNode;
  navbarProps?: Omit<NavbarProps, "variant">;
  /** Show footer (default: true) */
  showFooter?: boolean;
  /** Max width class (default: none) */
  maxWidth?: string;
}

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
};

const PageLayout = ({ children, navbarProps, showFooter = true, maxWidth }: PageLayoutProps) => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar variant="solid" {...navbarProps} />
      <motion.main
        className={`flex-1 ${maxWidth || ""}`}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.main>
      {showFooter && <Footer />}
    </div>
  );
};

export default PageLayout;
