
import { JobCard } from "@/components/JobCard";
import { PublicJobCard } from "@/components/PublicJobCard";
import { useJobs } from "@/hooks/useJobs";
import { usePublicJobs } from "@/hooks/usePublicJobs";
import { Badge } from "@/components/ui/badge";
import { Building } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SearchFilterBar } from "@/components/SearchFilterBar";
import { EmptyState } from "@/components/EmptyState";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { createGenericFilter, extractUniqueOptions } from "@/utils/filterUtils";
import { useAuth } from "@/contexts/AuthContext";
import { useClassificationFilters } from "@/hooks/useClassificationFilters";

const Index = () => {
  const { user } = useAuth();
  
  // Use different hooks based on authentication status
  const { data: publicJobs = [], isLoading: isLoadingPublic } = usePublicJobs();
  const { data: fullJobs = [], isLoading: isLoadingFull } = useJobs();
  
  const jobs = user ? fullJobs : publicJobs;
  const isLoading = user ? isLoadingFull : isLoadingPublic;
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");
  const [workArrangementFilter, setWorkArrangementFilter] = useState("all");

  // Get classification filters
  const classificationFilterData = useClassificationFilters('job', jobs);
  
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

  const filteredJobs = createGenericFilter(
    jobs,
    searchTerm,
    ['title', 'description'],
    [
      { value: locationFilter, field: 'location' },
      { 
        value: workArrangementFilter, 
        field: 'work_arrangement',
        matchFn: (itemValue, filterValue) => itemValue === filterValue
      }
    ],
    classificationFilters
  );

  const locationOptions = extractUniqueOptions(jobs, 'location', 'All Locations');
  const workArrangementOptions = extractUniqueOptions(jobs, 'work_arrangement', 'All Types');

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-secondary to-blue-50">
      <Header />

      {/* Hero Section */}
      <section className="py-8 sm:py-12 md:py-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-brand-primary mb-4 sm:mb-6 leading-tight">
            Find Jobs That Match Your 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-heading-highlight"> Values</span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-dark-text mb-6 sm:mb-8 max-w-3xl mx-auto px-2">
            Connect with companies that prioritize culture, growth, and meaningful work. 
            Discover opportunities where you'll thrive, not just survive.
          </p>
          
          <SearchFilterBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Search jobs, companies, or keywords..."
            primaryFilter={{
              value: locationFilter,
              onChange: setLocationFilter,
              placeholder: "Location",
              options: locationOptions
            }}
            secondaryFilter={{
              value: workArrangementFilter,
              onChange: setWorkArrangementFilter,
              placeholder: "Work Type",
              options: workArrangementOptions,
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

      {/* Jobs Section */}
      <section className="py-8 sm:py-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6 sm:mb-8">
            <h3 className="text-2xl sm:text-3xl font-bold text-brand-primary">
              Latest Opportunities
            </h3>
            <Badge variant="secondary" className="text-dark-text bg-brand-secondary text-sm">
              {filteredJobs.length} {filteredJobs.length === 1 ? 'job' : 'jobs'} found
            </Badge>
          </div>

          {isLoading ? (
            <LoadingSpinner message="Loading amazing opportunities..." />
          ) : filteredJobs.length === 0 ? (
            <EmptyState
              icon={<Building className="h-12 w-12" />}
              title="No jobs found"
              description="Try adjusting your search criteria"
            />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {filteredJobs.map((job) => (
                user ? (
                  <JobCard key={job.id} job={job as any} />
                ) : (
                  <PublicJobCard key={job.id} job={job as any} />
                )
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
