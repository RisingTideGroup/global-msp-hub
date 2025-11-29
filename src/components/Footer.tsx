
import { Building, ExternalLink } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-slate-800 text-white py-12 px-6 mt-20">
      <div className="max-w-6xl mx-auto text-center">
        <div className="flex justify-center items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-rising-blue-600 to-rising-orange-600 rounded-lg flex items-center justify-center">
            <Building className="h-6 w-6 text-white" />
          </div>
          <h4 className="text-2xl font-bold">Global MSP Hub</h4>
        </div>
        <p className="text-slate-400 max-w-2xl mx-auto">
          Your central hub for MSP, MSSP, and TSP resources. 
          Connecting the community with tools, opportunities, and innovation.
        </p>
      </div>
    </footer>
  );
};
