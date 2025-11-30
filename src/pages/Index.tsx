import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WebsiteLogo } from "@/components/WebsiteLogo";
import { ExternalLink } from "lucide-react";
import { useLinks } from "@/hooks/useLinks";

const Index = () => {
  const { getLinksByCategory, loading } = useLinks();

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

      {/* MSP Communities Section */}
      <section className="py-16 px-4 sm:px-6 bg-gradient-to-br from-brand-secondary/30 to-blue-50/30">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl sm:text-4xl font-bold text-brand-primary mb-4 text-center">
            MSP Communities
          </h3>
          <p className="text-lg text-dark-text mb-12 text-center max-w-2xl mx-auto">
            Connect with fellow MSP professionals in these vibrant communities
          </p>
          
          {loading ? (
            <p className="text-center text-dark-text">Loading...</p>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {getLinksByCategory("community").map((link) => (
                <a 
                  key={link.id}
                  href={link.url} 
                  target="_blank" 
                  rel="noopener"
                  className="group block bg-white rounded-lg shadow-md p-6 border-2 border-brand-secondary/50 hover:border-accent transition-all duration-300 hover:shadow-lg"
                >
                  <div className="flex items-center gap-4 mb-3">
                    <WebsiteLogo url={link.logo_url || link.url} alt={link.title} fallbackText={link.title.substring(0, 3)} />
                    <h4 className="text-xl font-bold text-brand-primary group-hover:text-accent transition-colors">
                      {link.title}
                    </h4>
                  </div>
                  <div className="flex items-center text-accent font-semibold text-sm group-hover:translate-x-2 transition-transform">
                    Visit Community <ExternalLink className="ml-2 h-4 w-4" />
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Discord Communities Section */}
      <section className="py-16 px-4 sm:px-6 bg-white/60">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl sm:text-4xl font-bold text-brand-primary mb-4 text-center">
            Discord Communities
          </h3>
          <p className="text-lg text-dark-text mb-12 text-center max-w-2xl mx-auto">
            Join these community-run Discord servers to chat in real-time
          </p>
          
          {loading ? (
            <p className="text-center text-dark-text">Loading...</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getLinksByCategory("discord").map((link) => (
                <a 
                  key={link.id}
                  href={link.url} 
                  target="_blank" 
                  rel="noopener"
                  className="group block bg-white rounded-lg shadow-md p-6 border-2 border-brand-secondary/50 hover:border-accent transition-all duration-300 hover:shadow-lg"
                >
                  <div className="flex items-center gap-4 mb-3">
                    <WebsiteLogo url={link.logo_url || link.url} alt={link.title} fallbackText={link.title.substring(0, 2)} />
                    <h4 className="text-xl font-bold text-brand-primary group-hover:text-accent transition-colors">
                      {link.title}
                    </h4>
                  </div>
                  <div className="flex items-center text-accent font-semibold text-sm group-hover:translate-x-2 transition-transform">
                    Join Discord <ExternalLink className="ml-2 h-4 w-4" />
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* YouTube MSP Content Section */}
      <section className="py-16 px-4 sm:px-6 bg-gradient-to-br from-brand-secondary/30 to-blue-50/30">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl sm:text-4xl font-bold text-brand-primary mb-4 text-center">
            YouTube MSP Content
          </h3>
          <p className="text-lg text-dark-text mb-12 text-center max-w-2xl mx-auto">
            Learn from the best MSP content creators on YouTube
          </p>
          
          {loading ? (
            <p className="text-center text-dark-text">Loading...</p>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {getLinksByCategory("youtube").map((link) => (
                <a 
                  key={link.id}
                  href={link.url} 
                  target="_blank" 
                  rel="noopener"
                  className="group block bg-white rounded-lg shadow-md p-6 border-2 border-brand-secondary/50 hover:border-accent transition-all duration-300 hover:shadow-lg"
                >
                  <div className="flex items-center gap-4 mb-3">
                    <WebsiteLogo url={link.logo_url || link.url} alt={link.title} fallbackText={link.title.substring(0, 2)} />
                    <h4 className="text-xl font-bold text-brand-primary group-hover:text-accent transition-colors">
                      {link.title}
                    </h4>
                  </div>
                  <div className="flex items-center text-accent font-semibold text-sm group-hover:translate-x-2 transition-transform">
                    Watch Channel <ExternalLink className="ml-2 h-4 w-4" />
                  </div>
                </a>
              ))}
            </div>
          )}
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
          
          {loading ? (
            <p className="text-center text-dark-text">Loading...</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {getLinksByCategory("project").map((link) => (
                <a 
                  key={link.id}
                  href={link.url} 
                  target="_blank" 
                  rel="noopener"
                  className="group block"
                >
                  <div className="bg-white rounded-lg shadow-lg p-8 border-2 border-brand-secondary hover:border-accent transition-all duration-300 hover:shadow-xl h-full">
                    <div className="flex items-center gap-4 mb-6">
                      <WebsiteLogo 
                        url={link.logo_url || link.url} 
                        alt={link.title} 
                        fallbackText={link.title.substring(0, 2)}
                        className="w-16 h-16"
                      />
                    </div>
                    <h4 className="text-2xl font-bold text-brand-primary mb-3 group-hover:text-accent transition-colors">
                      {link.title}
                    </h4>
                    {link.description && (
                      <p className="text-dark-text mb-4">
                        {link.description}
                      </p>
                    )}
                    <div className="flex items-center text-accent font-semibold group-hover:translate-x-2 transition-transform">
                      Explore <ExternalLink className="ml-2 h-5 w-5" />
                    </div>
                  </div>
                </a>
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
