import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Building2, ArrowLeft, Gauge } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: "linear-gradient(150deg, hsl(222 47% 8%) 0%, hsl(220 43% 6%) 50%, hsl(225 50% 7%) 100%)" }}
    >
      {/* Ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-15 pointer-events-none">
        <div
          className="w-full h-full rounded-full"
          style={{ background: "radial-gradient(circle, hsl(158 78% 36%) 0%, transparent 70%)" }}
        />
      </div>

      <div className="relative text-center px-6">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-12">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
            <Building2 className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
            RealElite
          </span>
        </div>

        {/* 404 Number */}
        <div
          className="text-[10rem] font-bold leading-none tracking-tighter bg-gradient-to-b from-white/20 to-white/5 bg-clip-text text-transparent select-none"
          style={{ letterSpacing: "-0.05em" }}
        >
          404
        </div>

        <h1 className="text-2xl font-bold text-white mt-4 mb-2">
          Page not found
        </h1>

        <p className="text-white/50 max-w-md mx-auto mb-10">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="flex items-center justify-center gap-3">
          <Button
            onClick={() => navigate("/dashboard")}
            className="bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/25 gap-2"
            size="lg"
          >
            <Gauge className="h-4 w-4" />
            Go to Dashboard
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="border-white/20 text-white/70 hover:bg-white/5 hover:text-white gap-2"
            size="lg"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
