
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Building, User, Briefcase, Shield, LogOut, Menu, X, Settings, ChevronDown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useIsModerator } from "@/hooks/useUserRole";
import { useBusiness } from "@/hooks/useBusiness";
import { Link, useLocation } from "react-router-dom";
import { BusinessCreateModal } from "./BusinessCreateModal";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

export const Header = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const isModerator = useIsModerator();
  const { data: business } = useBusiness();
  const [showBusinessModal, setShowBusinessModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleBusinessClick = () => {
    if (business) {
      // If business exists, navigate to dashboard
      window.location.href = '/business/dashboard';
    } else {
      // If no business, show modal
      setShowBusinessModal(true);
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const MobileNav = () => (
    <div className="flex flex-col space-y-2 py-4">
      <Link to="/" onClick={() => setMobileMenuOpen(false)}>
        <Button 
          variant={location.pathname === "/" ? "default" : "ghost"} 
          size="lg"
          className={`w-full justify-start ${
            location.pathname === "/" 
              ? "bg-accent hover:bg-accent/90 text-white" 
              : "hover:bg-brand-secondary hover:text-brand-primary"
          }`}
        >
          <Briefcase className="h-5 w-5 mr-3" />
          Jobs
        </Button>
      </Link>
      <Link to="/businesses" onClick={() => setMobileMenuOpen(false)}>
        <Button 
          variant={location.pathname === "/businesses" ? "default" : "ghost"} 
          size="lg"
          className={`w-full justify-start ${
            location.pathname === "/businesses" 
              ? "bg-accent hover:bg-accent/90 text-white" 
              : "hover:bg-brand-secondary hover:text-brand-primary"
          }`}
        >
          <Building className="h-5 w-5 mr-3" />
          Companies
        </Button>
      </Link>
      
      {user ? (
        <>
          {isModerator && (
            <Link to="/admin" onClick={() => setMobileMenuOpen(false)}>
              <Button 
                variant={location.pathname === "/admin" ? "default" : "ghost"} 
                size="lg"
                className={`w-full justify-start ${
                  location.pathname === "/admin" 
                    ? "bg-accent hover:bg-accent/90 text-white" 
                    : "hover:bg-brand-secondary hover:text-brand-primary"
                }`}
              >
                <Shield className="h-5 w-5 mr-3" />
                Admin
              </Button>
            </Link>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="lg" className="w-full justify-start hover:bg-brand-secondary hover:text-brand-primary">
                <User className="h-5 w-5 mr-3" />
                Profile
                <ChevronDown className="h-4 w-4 ml-auto" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuItem onClick={() => {
                handleBusinessClick();
                setMobileMenuOpen(false);
              }}>
                <Building className="h-4 w-4 mr-2" />
                Business
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/settings" onClick={() => setMobileMenuOpen(false)} className="cursor-pointer">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button 
            variant="ghost" 
            size="lg"
            className="w-full justify-start hover:bg-brand-secondary hover:text-brand-primary"
            onClick={() => {
              handleSignOut();
              setMobileMenuOpen(false);
            }}
          >
            <LogOut className="h-5 w-5 mr-3" />
            Sign Out
          </Button>
        </>
      ) : (
        <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
          <Button 
            className="w-full bg-cta hover:bg-[#d85a59] text-white font-medium"
            size="lg"
          >
            Sign In
          </Button>
        </Link>
      )}
    </div>
  );

  return (
    <>
      <header className="bg-white/90 backdrop-blur-sm border-b border-brand-secondary sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-accent to-primary-gradient rounded-lg flex items-center justify-center">
                <Building className="h-6 w-6 text-white" />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2">
                <h1 className="text-lg sm:text-2xl font-bold text-brand-primary">JobMatch</h1>
                <p className="text-xs sm:text-sm text-dark-text hidden lg:block">Jobs for the MSP/MSSP/TSP Industry</p>
              </div>
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-2 lg:space-x-4">
              <Link to="/">
                <Button 
                  variant={location.pathname === "/" ? "default" : "ghost"} 
                  size="sm" 
                  className={`flex items-center ${
                    location.pathname === "/" 
                      ? "bg-accent hover:bg-accent/90 text-white" 
                      : "hover:bg-brand-secondary hover:text-brand-primary"
                  }`}
                >
                  <Briefcase className="h-4 w-4 mr-2" />
                  <span className="hidden lg:inline">Jobs</span>
                </Button>
              </Link>
              <Link to="/businesses">
                <Button 
                  variant={location.pathname === "/businesses" ? "default" : "ghost"} 
                  size="sm" 
                  className={`flex items-center ${
                    location.pathname === "/businesses" 
                      ? "bg-accent hover:bg-accent/90 text-white" 
                      : "hover:bg-brand-secondary hover:text-brand-primary"
                  }`}
                >
                  <Building className="h-4 w-4 mr-2" />
                  <span className="hidden lg:inline">Companies</span>
                </Button>
              </Link>
              {user ? (
                <>
                  {isModerator && (
                    <Link to="/admin">
                      <Button 
                        variant={location.pathname === "/admin" ? "default" : "ghost"} 
                        size="sm" 
                        className={`flex items-center ${
                          location.pathname === "/admin" 
                            ? "bg-accent hover:bg-accent/90 text-white" 
                            : "hover:bg-brand-secondary hover:text-brand-primary"
                        }`}
                      >
                        <Shield className="h-4 w-4 mr-2" />
                        <span className="hidden lg:inline">Admin</span>
                      </Button>
                    </Link>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="flex items-center hover:bg-brand-secondary hover:text-brand-primary">
                        <User className="h-4 w-4 lg:mr-2" />
                        <span className="hidden lg:inline">Profile</span>
                        <ChevronDown className="h-3 w-3 ml-1 hidden lg:inline" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={handleBusinessClick}>
                        <Building className="h-4 w-4 mr-2" />
                        Business
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/settings" className="cursor-pointer">
                          <Settings className="h-4 w-4 mr-2" />
                          Settings
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="flex items-center hover:bg-brand-secondary hover:text-brand-primary"
                    onClick={handleSignOut}
                  >
                    <LogOut className="h-4 w-4 lg:mr-2" />
                    <span className="hidden lg:inline">Sign Out</span>
                  </Button>
                </>
              ) : (
                <Link to="/auth">
                  <Button 
                    className="bg-cta hover:bg-[#d85a59] text-white font-medium"
                    size="sm"
                  >
                    Sign In
                  </Button>
                </Link>
              )}
            </nav>

            {/* Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="sm">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] sm:w-[350px]">
                <MobileNav />
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <BusinessCreateModal 
        open={showBusinessModal} 
        onOpenChange={setShowBusinessModal}
      />
    </>
  );
};
