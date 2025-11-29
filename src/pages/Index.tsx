import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Building, ExternalLink } from "lucide-react";

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

      {/* MSP Communities Section */}
      <section className="py-16 px-4 sm:px-6 bg-gradient-to-br from-brand-secondary/30 to-blue-50/30">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl sm:text-4xl font-bold text-brand-primary mb-4 text-center">
            MSP Communities
          </h3>
          <p className="text-lg text-dark-text mb-12 text-center max-w-2xl mx-auto">
            Connect with fellow MSP professionals in these vibrant communities
          </p>
          
          <div className="grid md:grid-cols-3 gap-6">
            <a 
              href="https://mspgeek.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group block bg-white rounded-lg shadow-md p-6 border-2 border-brand-secondary/50 hover:border-accent transition-all duration-300 hover:shadow-lg"
            >
              <div className="flex items-center gap-4 mb-3">
                <img 
                  src="https://img.logo.dev/mspgeek.com?token=pk_X-WvS9fRR0u5fa0k1RqVGQ" 
                  alt="MSPGeek" 
                  className="w-12 h-12 rounded-lg object-cover"
                  onError={(e) => e.currentTarget.src = 'https://via.placeholder.com/48?text=MSP'}
                />
                <h4 className="text-xl font-bold text-brand-primary group-hover:text-accent transition-colors">
                  MSPGeek
                </h4>
              </div>
              <div className="flex items-center text-accent font-semibold text-sm group-hover:translate-x-2 transition-transform">
                Visit Community <ExternalLink className="ml-2 h-4 w-4" />
              </div>
            </a>

            <a 
              href="https://techdegenerates.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group block bg-white rounded-lg shadow-md p-6 border-2 border-brand-secondary/50 hover:border-accent transition-all duration-300 hover:shadow-lg"
            >
              <div className="flex items-center gap-4 mb-3">
                <img 
                  src="https://img.logo.dev/techdegenerates.com?token=pk_X-WvS9fRR0u5fa0k1RqVGQ" 
                  alt="Tech Degenerates" 
                  className="w-12 h-12 rounded-lg object-cover"
                  onError={(e) => e.currentTarget.src = 'https://via.placeholder.com/48?text=TD'}
                />
                <h4 className="text-xl font-bold text-brand-primary group-hover:text-accent transition-colors">
                  Tech Degenerates
                </h4>
              </div>
              <div className="flex items-center text-accent font-semibold text-sm group-hover:translate-x-2 transition-transform">
                Visit Community <ExternalLink className="ml-2 h-4 w-4" />
              </div>
            </a>

            <a 
              href="https://reddit.com/r/msp" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group block bg-white rounded-lg shadow-md p-6 border-2 border-brand-secondary/50 hover:border-accent transition-all duration-300 hover:shadow-lg"
            >
              <div className="flex items-center gap-4 mb-3">
                <img 
                  src="https://img.logo.dev/reddit.com?token=pk_X-WvS9fRR0u5fa0k1RqVGQ" 
                  alt="Reddit r/msp" 
                  className="w-12 h-12 rounded-lg object-cover"
                  onError={(e) => e.currentTarget.src = 'https://via.placeholder.com/48?text=r/msp'}
                />
                <h4 className="text-xl font-bold text-brand-primary group-hover:text-accent transition-colors">
                  Reddit /r/msp
                </h4>
              </div>
              <div className="flex items-center text-accent font-semibold text-sm group-hover:translate-x-2 transition-transform">
                Visit Community <ExternalLink className="ml-2 h-4 w-4" />
              </div>
            </a>
          </div>
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
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <a 
              href="https://discord.gg/cyberdrain" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group block bg-white rounded-lg shadow-md p-6 border-2 border-brand-secondary/50 hover:border-accent transition-all duration-300 hover:shadow-lg"
            >
              <div className="flex items-center gap-4 mb-3">
                <img 
                  src="https://img.logo.dev/cyberdrain.com?token=pk_X-WvS9fRR0u5fa0k1RqVGQ" 
                  alt="Cyberdrain" 
                  className="w-12 h-12 rounded-lg object-cover"
                  onError={(e) => e.currentTarget.src = 'https://via.placeholder.com/48?text=CD'}
                />
                <h4 className="text-xl font-bold text-brand-primary group-hover:text-accent transition-colors">
                  Cyberdrain
                </h4>
              </div>
              <div className="flex items-center text-accent font-semibold text-sm group-hover:translate-x-2 transition-transform">
                Join Discord <ExternalLink className="ml-2 h-4 w-4" />
              </div>
            </a>

            <a 
              href="https://discord.gg/mspgeek" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group block bg-white rounded-lg shadow-md p-6 border-2 border-brand-secondary/50 hover:border-accent transition-all duration-300 hover:shadow-lg"
            >
              <div className="flex items-center gap-4 mb-3">
                <img 
                  src="https://img.logo.dev/mspgeek.com?token=pk_X-WvS9fRR0u5fa0k1RqVGQ" 
                  alt="MSPGeek" 
                  className="w-12 h-12 rounded-lg object-cover"
                  onError={(e) => e.currentTarget.src = 'https://via.placeholder.com/48?text=MSP'}
                />
                <h4 className="text-xl font-bold text-brand-primary group-hover:text-accent transition-colors">
                  MSPGeek
                </h4>
              </div>
              <div className="flex items-center text-accent font-semibold text-sm group-hover:translate-x-2 transition-transform">
                Join Discord <ExternalLink className="ml-2 h-4 w-4" />
              </div>
            </a>

            <a 
              href="https://discord.gg/techdegenerates" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group block bg-white rounded-lg shadow-md p-6 border-2 border-brand-secondary/50 hover:border-accent transition-all duration-300 hover:shadow-lg"
            >
              <div className="flex items-center gap-4 mb-3">
                <img 
                  src="https://img.logo.dev/techdegenerates.com?token=pk_X-WvS9fRR0u5fa0k1RqVGQ" 
                  alt="Tech Degenerates" 
                  className="w-12 h-12 rounded-lg object-cover"
                  onError={(e) => e.currentTarget.src = 'https://via.placeholder.com/48?text=TD'}
                />
                <h4 className="text-xl font-bold text-brand-primary group-hover:text-accent transition-colors">
                  Tech Degenerates
                </h4>
              </div>
              <div className="flex items-center text-accent font-semibold text-sm group-hover:translate-x-2 transition-transform">
                Join Discord <ExternalLink className="ml-2 h-4 w-4" />
              </div>
            </a>

            <a 
              href="https://discord.gg/halopsa" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group block bg-white rounded-lg shadow-md p-6 border-2 border-brand-secondary/50 hover:border-accent transition-all duration-300 hover:shadow-lg"
            >
              <div className="flex items-center gap-4 mb-3">
                <img 
                  src="https://img.logo.dev/halopsa.com?token=pk_X-WvS9fRR0u5fa0k1RqVGQ" 
                  alt="HaloPSA" 
                  className="w-12 h-12 rounded-lg object-cover"
                  onError={(e) => e.currentTarget.src = 'https://via.placeholder.com/48?text=Halo'}
                />
                <h4 className="text-xl font-bold text-brand-primary group-hover:text-accent transition-colors">
                  HaloPSA Community
                </h4>
              </div>
              <div className="flex items-center text-accent font-semibold text-sm group-hover:translate-x-2 transition-transform">
                Join Discord <ExternalLink className="ml-2 h-4 w-4" />
              </div>
            </a>

            <a 
              href="https://discord.gg/hudu" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group block bg-white rounded-lg shadow-md p-6 border-2 border-brand-secondary/50 hover:border-accent transition-all duration-300 hover:shadow-lg"
            >
              <div className="flex items-center gap-4 mb-3">
                <img 
                  src="https://img.logo.dev/usehudu.com?token=pk_X-WvS9fRR0u5fa0k1RqVGQ" 
                  alt="Hudu" 
                  className="w-12 h-12 rounded-lg object-cover"
                  onError={(e) => e.currentTarget.src = 'https://via.placeholder.com/48?text=Hudu'}
                />
                <h4 className="text-xl font-bold text-brand-primary group-hover:text-accent transition-colors">
                  Hudu Community
                </h4>
              </div>
              <div className="flex items-center text-accent font-semibold text-sm group-hover:translate-x-2 transition-transform">
                Join Discord <ExternalLink className="ml-2 h-4 w-4" />
              </div>
            </a>
          </div>
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
          
          <div className="grid md:grid-cols-3 gap-6">
            <a 
              href="https://youtube.com/@mspgeek" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group block bg-white rounded-lg shadow-md p-6 border-2 border-brand-secondary/50 hover:border-accent transition-all duration-300 hover:shadow-lg"
            >
              <div className="flex items-center gap-4 mb-3">
                <img 
                  src="https://img.logo.dev/mspgeek.com?token=pk_X-WvS9fRR0u5fa0k1RqVGQ" 
                  alt="MSPGeek" 
                  className="w-12 h-12 rounded-lg object-cover"
                  onError={(e) => e.currentTarget.src = 'https://via.placeholder.com/48?text=MSP'}
                />
                <h4 className="text-xl font-bold text-brand-primary group-hover:text-accent transition-colors">
                  MSPGeek
                </h4>
              </div>
              <div className="flex items-center text-accent font-semibold text-sm group-hover:translate-x-2 transition-transform">
                Watch Channel <ExternalLink className="ml-2 h-4 w-4" />
              </div>
            </a>

            <a 
              href="https://youtube.com/@_JohnHammond" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group block bg-white rounded-lg shadow-md p-6 border-2 border-brand-secondary/50 hover:border-accent transition-all duration-300 hover:shadow-lg"
            >
              <div className="flex items-center gap-4 mb-3">
                <img 
                  src="https://img.logo.dev/youtube.com?token=pk_X-WvS9fRR0u5fa0k1RqVGQ" 
                  alt="John Hammond" 
                  className="w-12 h-12 rounded-lg object-cover"
                  onError={(e) => e.currentTarget.src = 'https://via.placeholder.com/48?text=JH'}
                />
                <h4 className="text-xl font-bold text-brand-primary group-hover:text-accent transition-colors">
                  John Hammond
                </h4>
              </div>
              <div className="flex items-center text-accent font-semibold text-sm group-hover:translate-x-2 transition-transform">
                Watch Channel <ExternalLink className="ml-2 h-4 w-4" />
              </div>
            </a>

            <a 
              href="https://youtube.com/@lawrencesystems" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group block bg-white rounded-lg shadow-md p-6 border-2 border-brand-secondary/50 hover:border-accent transition-all duration-300 hover:shadow-lg"
            >
              <div className="flex items-center gap-4 mb-3">
                <img 
                  src="https://img.logo.dev/lawrencesystems.com?token=pk_X-WvS9fRR0u5fa0k1RqVGQ" 
                  alt="Tom Lawrence" 
                  className="w-12 h-12 rounded-lg object-cover"
                  onError={(e) => e.currentTarget.src = 'https://via.placeholder.com/48?text=TL'}
                />
                <h4 className="text-xl font-bold text-brand-primary group-hover:text-accent transition-colors">
                  Tom Lawrence
                </h4>
              </div>
              <div className="flex items-center text-accent font-semibold text-sm group-hover:translate-x-2 transition-transform">
                Watch Channel <ExternalLink className="ml-2 h-4 w-4" />
              </div>
            </a>
          </div>
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
                <div className="flex items-center gap-4 mb-6">
                  <img 
                    src="https://img.logo.dev/jobs.globalmsphub.org?token=pk_X-WvS9fRR0u5fa0k1RqVGQ" 
                    alt="JobMatch" 
                    className="w-16 h-16 rounded-lg object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                  <div className="w-16 h-16 bg-gradient-to-br from-accent to-primary-gradient rounded-lg items-center justify-center hidden">
                    <Building className="h-10 w-10 text-white" />
                  </div>
                </div>
                <h4 className="text-2xl font-bold text-brand-primary mb-3 group-hover:text-accent transition-colors">
                  JobMatch
                </h4>
                <p className="text-dark-text mb-4">
                  Find jobs that match your values. Connect with companies in the MSP/MSSP/TSP industry that prioritize culture, growth, and meaningful work.
                </p>
                <div className="flex items-center text-accent font-semibold group-hover:translate-x-2 transition-transform">
                  Explore Jobs <ExternalLink className="ml-2 h-5 w-5" />
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
