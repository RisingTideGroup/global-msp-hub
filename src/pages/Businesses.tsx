
import { BusinessCard } from "@/components/BusinessCard";
import { usePublicBusinesses } from "@/hooks/usePublicBusinesses";
import { Badge } from "@/components/ui/badge";
import { Building, Lock } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SearchFilterBar } from "@/components/SearchFilterBar";
import { EmptyState } from "@/components/EmptyState";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { createGenericFilter, extractUniqueOptions } from "@/utils/filterUtils";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useClassificationFilters } from "@/hooks/useClassificationFilters";

const Businesses = () => {
  const { user } = useAuth();
  const { data: businesses = [], isLoading } = usePublicBusinesses();
  const [searchTerm, setSearchTerm] = useState("");
  const [industryFilter, setIndustryFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");

  // Get classification filters
  const classificationFilterData = useClassificationFilters('business', businesses);
  
  // State for classification filters
  const [classificationFilters, setClassificationFilters] = useState<Record<string, string>>({});

  // Update classification filter states when data changes
  useEffect(() => {
    setClassificationFilters(prev => {
      const updated = { ...prev };
      classificationFilterData.forEach(filter => {
        if (!(filter.type in updated)) {
          updated[filter.type] = "all";
        }
      });
      return updated;
    });
  }, [classificationFilterData]);

  const filteredBusinesses = createGenericFilter(
    businesses,
    searchTerm,
    ['name', 'description', 'mission'],
    [
      { value: industryFilter, field: 'industry' },
      { value: locationFilter, field: 'location' }
    ],
    classificationFilters
  );

  // Dynamically generate filter options based on actual data
  const industryOptions = useMemo(() => {
    const uniqueIndustries = Array.from(new Set(businesses.map(business => business.industry)))
      .filter(industry => industry) // Remove any null/undefined values
      .sort();
    
    return [
      { value: "all", label: "All Industries" },
      ...uniqueIndustries.map(industry => ({
        value: industry,
        label: industry
      }))
    ];
  }, [businesses]);

  const locationOptions = useMemo(() => {
    const uniqueLocations = Array.from(new Set(businesses.map(business => business.location)))
      .filter(location => location) // Remove any null/undefined values
      .sort();
    
    return [
      { value: "all", label: "All Locations" },
      ...uniqueLocations.map(location => ({
        value: location,
        label: location
      }))
    ];
  }, [businesses]);

  // If user is not authenticated, show login prompt
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-secondary to-blue-50">
        <Header />
        
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-8">
              <Lock className="h-16 w-16 text-brand-primary mx-auto mb-4" />
              <h2 className="text-4xl font-bold text-brand-primary mb-6">
                Company Profiles Require Login
              </h2>
              <p className="text-xl text-dark-text mb-8 max-w-2xl mx-auto">
                To protect company information and provide personalized experiences, 
                you need to sign in to view detailed company profiles.
              </p>
              
              <div className="flex justify-center gap-4">
                <Link to="/auth">
                  <Button size="lg" className="bg-brand-primary hover:bg-brand-primary/90">
                    Sign In
                  </Button>
                </Link>
                <Link to="/">
                  <Button variant="outline" size="lg">
                    Browse Jobs
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
        
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-secondary to-blue-50">
      <Header />

      {/* Hero Section */}
      <section className="py-8 sm:py-12 md:py-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-brand-primary mb-4 sm:mb-6 leading-tight">
            Discover Amazing 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-heading-highlight"> Companies</span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-dark-text mb-6 sm:mb-8 max-w-3xl mx-auto px-2">
            Explore companies that prioritize culture, growth, and meaningful work. 
            Find organizations where your values align and your career can flourish.
          </p>
          
          <SearchFilterBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Search companies, industries, or missions..."
            primaryFilter={{
              value: industryFilter,
              onChange: setIndustryFilter,
              placeholder: "Industry",
              options: industryOptions
            }}
            secondaryFilter={{
              value: locationFilter,
              onChange: setLocationFilter,
              placeholder: "Location",
              options: locationOptions,
              showLocationIcon: true
            }}
            classificationFilters={classificationFilterData.map(filter => ({
              type: filter.type,
              value: classificationFilters[filter.type] || "all",
              onChange: (value) => setClassificationFilters(prev => ({ ...prev, [filter.type]: value })),
              placeholder: filter.placeholder,
              options: filter.options
            }))}
          />
        </div>
      </section>

      {/* Businesses Section */}
      <section className="py-8 sm:py-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6 sm:mb-8">
            <h3 className="text-2xl sm:text-3xl font-bold text-brand-primary">
              Featured Companies
            </h3>
            <Badge variant="secondary" className="text-dark-text bg-brand-secondary text-sm">
              {filteredBusinesses.length} {filteredBusinesses.length === 1 ? 'company' : 'companies'} found
            </Badge>
          </div>

          {isLoading ? (
            <LoadingSpinner message="Loading amazing companies..." />
          ) : filteredBusinesses.length === 0 ? (
            <EmptyState
              icon={<Building className="h-12 w-12" />}
              title="No companies found"
              description="Try adjusting your search criteria"
            />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
              {filteredBusinesses.map((business) => (
                <BusinessCard key={business.id} business={business} />
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Businesses;
