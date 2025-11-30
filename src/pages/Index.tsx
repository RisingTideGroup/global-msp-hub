import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WebsiteLogo } from "@/components/WebsiteLogo";
import { ExternalLink } from "lucide-react";
import { useLinks } from "@/hooks/useLinks";

const Index = () => {
  const { categories, getLinksByCategory, loading } = useLinks();

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-secondary to-blue-50">
      <Header />

      {/* Hero Section */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6">
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

      {/* Dynamic Category Sections */}
      {loading ? (
        <div className="py-16 text-center">
          <p className="text-dark-text">Loading...</p>
        </div>
      ) : (
        categories.map((category, index) => {
          const categoryLinks = getLinksByCategory(category.name);
          if (categoryLinks.length === 0) return null;

          const isEven = index % 2 === 0;
          const bgClass = isEven 
            ? "bg-gradient-to-br from-brand-secondary/30 to-blue-50/30" 
            : "bg-white/60";

          return (
            <section key={category.id} className={`py-16 px-4 sm:px-6 ${bgClass}`}>
              <div className="max-w-6xl mx-auto">
                <h3 className="text-3xl sm:text-4xl font-bold text-brand-primary mb-4 text-center">
                  {category.display_name}
                </h3>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
                  {categoryLinks.map((link) => (
                    <a 
                      key={link.id}
                      href={link.url} 
                      target="_blank" 
                      rel="noopener"
                      className="group block bg-white rounded-lg shadow-md p-6 border-2 border-brand-secondary/50 hover:border-accent transition-all duration-300 hover:shadow-lg"
                    >
                      <div className="flex items-center gap-4 mb-3">
                        <WebsiteLogo 
                          url={link.logo_url || link.url} 
                          alt={link.title} 
                          fallbackText={link.title.substring(0, 2)} 
                        />
                        <h4 className="text-xl font-bold text-brand-primary group-hover:text-accent transition-colors">
                          {link.title}
                        </h4>
                      </div>
                      {link.description && (
                        <p className="text-dark-text text-sm mb-3">
                          {link.description}
                        </p>
                      )}
                      <div className="flex items-center text-accent font-semibold text-sm group-hover:translate-x-2 transition-transform">
                        Visit <ExternalLink className="ml-2 h-4 w-4" />
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </section>
          );
        })
      )}

      <Footer />
    </div>
  );
};

export default Index;
