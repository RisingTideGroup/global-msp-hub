import { Building } from "lucide-react";
import { Link } from "react-router-dom";

export const Header = () => {
  return (
    <header className="bg-white/90 backdrop-blur-sm border-b border-brand-secondary sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-accent to-primary-gradient rounded-lg flex items-center justify-center">
              <Building className="h-6 w-6 text-white" />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2">
              <h1 className="text-lg sm:text-2xl font-bold text-brand-primary">Global MSP Hub</h1>
              <p className="text-xs sm:text-sm text-dark-text hidden lg:block">Your Gateway to MSP/MSSP/TSP Resources</p>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
};
