import { useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { Mountain, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import PageLayout from "@/components/PageLayout";
import { motion } from "framer-motion";

const Login = () => {
  const [searchParams] = useSearchParams();
  const isAgency = searchParams.get("role") === "agency";
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const displayName = isSignUp ? name : email.split("@")[0];
    login(displayName || "Tourist");
    navigate(isAgency ? "/admin" : "/dashboard");
  };

  return (
    <PageLayout showFooter={false}>
      <div className="flex-1 flex items-center justify-center p-4">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-card">
            <div className="flex items-center gap-2 font-display font-bold text-xl mb-1">
              <Mountain className="w-5 h-5" />
              SmartYatra
            </div>
            <p className="text-muted-foreground text-sm mb-8">
              {isAgency ? "Agency / Admin Portal" : "Tourist Portal"} — {isSignUp ? "Create your account" : "Sign in to continue"}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} className="rounded-xl" />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required className="rounded-xl" />
              </div>
              <Button type="submit" className="w-full rounded-xl" size="lg">
                <LogIn className="w-4 h-4 mr-2" />
                {isSignUp ? "Create Account" : "Sign In"}
              </Button>
            </form>

            <p className="text-sm text-muted-foreground text-center mt-6">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
              <button onClick={() => setIsSignUp(!isSignUp)} className="text-foreground font-medium underline underline-offset-2">
                {isSignUp ? "Sign In" : "Sign Up"}
              </button>
            </p>
          </div>

          {/* Quick access */}
          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground mb-2">Or explore without signing in</p>
            <div className="flex items-center justify-center gap-3">
              <Button asChild variant="ghost" size="sm" className="rounded-xl text-xs">
                <Link to="/map">View Map</Link>
              </Button>
              <Button asChild variant="ghost" size="sm" className="rounded-xl text-xs">
                <Link to="/budget">Budget Tool</Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </PageLayout>
  );
};

export default Login;
