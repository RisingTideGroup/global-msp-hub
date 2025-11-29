import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";

const Index = () => {

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-secondary to-blue-50">
      <Header />

      {/* Hero Section */}
      <section className="py-16 sm:py-24 md:py-32 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-brand-primary mb-6 sm:mb-8 leading-tight">
            Find Jobs That Match Your 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-heading-highlight"> Values</span>
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl text-dark-text mb-8 sm:mb-12 max-w-3xl mx-auto">
            Connect with companies that prioritize culture, growth, and meaningful work. 
            Discover opportunities where you'll thrive, not just survive.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg">
              Get Started
            </Button>
            <Button size="lg" variant="outline" className="text-lg">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
