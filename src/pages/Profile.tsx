import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect to settings page which now contains all profile functionality
    navigate('/settings', { replace: true });
  }, [navigate]);

  return null;
};

export default Profile;
