import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Building } from "lucide-react";

const Index = () => {

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-secondary to-blue-50">
      <Header />

      {/* Hero Section */}
      <section className="py-16 sm:py-24 md:py-32 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-brand-primary mb-6 sm:mb-8 leading-tight">
            Your Central Hub for 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-heading-highlight"> MSP Excellence</span>
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl text-dark-text mb-8 sm:mb-12 max-w-3xl mx-auto">
            Connecting the MSP, MSSP, and TSP community with essential resources, 
            tools, and opportunities to grow your business and career.
          </p>
        </div>
      </section>

      {/* Projects Section */}
      <section className="py-16 px-4 sm:px-6 bg-white/60">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl sm:text-4xl font-bold text-brand-primary mb-4 text-center">
            Our Projects
          </h3>
          <p className="text-lg text-dark-text mb-12 text-center max-w-2xl mx-auto">
            Discover our growing ecosystem of tools and platforms designed for the MSP community
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* JobMatch Card */}
            <a 
              href="https://jobs.globalmsphub.org" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group block"
            >
              <div className="bg-white rounded-lg shadow-lg p-8 border-2 border-brand-secondary hover:border-accent transition-all duration-300 hover:shadow-xl h-full">
                <div className="w-16 h-16 bg-gradient-to-br from-accent to-primary-gradient rounded-lg flex items-center justify-center mb-6">
                  <Building className="h-10 w-10 text-white" />
                </div>
                <h4 className="text-2xl font-bold text-brand-primary mb-3 group-hover:text-accent transition-colors">
                  JobMatch
                </h4>
                <p className="text-dark-text mb-4">
                  Find jobs that match your values. Connect with companies in the MSP/MSSP/TSP industry that prioritize culture, growth, and meaningful work.
                </p>
                <div className="flex items-center text-accent font-semibold group-hover:translate-x-2 transition-transform">
                  Explore Jobs →
                </div>
              </div>
            </a>

            {/* Coming Soon Placeholder Cards */}
            <div className="bg-white/50 rounded-lg shadow-md p-8 border-2 border-dashed border-brand-secondary h-full flex flex-col items-center justify-center text-center">
              <p className="text-lg font-semibold text-dark-text mb-2">More Projects Coming Soon</p>
              <p className="text-sm text-dark-text/70">Stay tuned for additional resources</p>
            </div>
            
            <div className="bg-white/50 rounded-lg shadow-md p-8 border-2 border-dashed border-brand-secondary h-full flex flex-col items-center justify-center text-center">
              <p className="text-lg font-semibold text-dark-text mb-2">More Projects Coming Soon</p>
              <p className="text-sm text-dark-text/70">Stay tuned for additional resources</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
