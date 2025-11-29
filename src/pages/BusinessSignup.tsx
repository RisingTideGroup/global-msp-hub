
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useBusiness } from "@/hooks/useBusiness";
import { BusinessWizard } from "@/components/BusinessWizard";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const BusinessSignup = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: business, isLoading } = useBusiness();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  useEffect(() => {
    if (business && business.wizard_completed) {
      navigate("/business/dashboard");
    }
  }, [business, navigate]);

  if (!user) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rising-blue-50 to-rising-orange-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rising-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rising-blue-50 to-rising-orange-50">
      <Header />
      <BusinessWizard business={business} mode={business ? 'edit' : 'create'} />
      <Footer />
    </div>
  );
};

export default BusinessSignup;
