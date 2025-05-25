import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import ConsultancyProfile from "../components/ConsultancyProfile";
import ConsultancyReviews from "../components/ConsultancyReviews"; // ✅ Importing the review component
import Navbar from "../components/Navbar";

interface Consultancy {
  id: string;
  name: string;
  rating: number;
  reviews: number;
  image: string;
  category: string;
  description: string;
  location: string;
  expertise: string[];
  price: string;
  availability: {
    days: string[];
    hours: string;
  };
  contact: {
    phone: string;
    email: string;
    website: string;
  };
}

function ConsultancyProfilePage() {
  const { id } = useParams();
  const [consultancy, setConsultancy] = useState<Consultancy | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulated API call - replace with actual API call
    const fetchConsultancy = async () => {
      try {
        // Mock data for demonstration
        const mockConsultancy = {
          id: id,
          name: "Global Strategy Partners",
          rating: 4.9,
          reviews: 128,
          image:
            "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=60",
          category: "Business Strategy",
          description:
            "Expert business strategy and growth consulting with over 15 years of experience helping businesses scale and succeed in competitive markets.",
          location: "New York, NY",
          expertise: [
            "Strategic Planning",
            "Market Analysis",
            "Growth Strategy",
            "Business Development",
            "Digital Transformation",
            "Operations Optimization",
          ],
          price: "$200/hr",
          availability: {
            days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
            hours: "9:00 AM - 5:00 PM EST",
          },
          contact: {
            phone: "+1 (555) 123-4567",
            email: "contact@globalstrategypartners.com",
            website: "www.globalstrategypartners.com",
          },
        };

        setConsultancy(mockConsultancy);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching consultancy:", error);
        setLoading(false);
      }
    };

    fetchConsultancy();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!consultancy) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Consultancy not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <Navbar />
      </header>

      {/* Main Content */}
      <ConsultancyProfile {...consultancy} />

      {/* ✅ Added Review Section */}
      <ConsultancyReviews
        consultancyId={consultancy.id}
        reviews={consultancy.reviews}
      />

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h4 className="text-xl font-bold mb-4">ConsultBridge</h4>
              <p className="text-gray-400">
                Connecting you with the right consultancy services
              </p>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Categories</h5>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white">
                    Business
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Finance
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Legal
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Technology
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Company</h5>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Connect</h5>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white">
                    Twitter
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    LinkedIn
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Facebook
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Instagram
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2025 ConsultBridge. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default ConsultancyProfilePage;
