import { Link } from "react-router-dom";
import PageLayout from "@/components/PageLayout";
import { motion } from "framer-motion";
import { Mountain } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  return (
    <PageLayout showFooter={false}>
      <div className="flex-1 flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-6">
            <Mountain className="w-8 h-8 text-muted-foreground" />
          </div>
          <h1 className="mb-2 text-5xl font-display font-bold">404</h1>
          <p className="mb-6 text-lg text-muted-foreground">This trail doesn't exist</p>
          <Button asChild className="rounded-xl">
            <Link to="/">Return Home</Link>
          </Button>
        </motion.div>
      </div>
    </PageLayout>
  );
};

export default NotFound;
