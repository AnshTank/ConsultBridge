"use client";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import AppointmentBooking from "../AppointmentBooking";
import Navbar from "../Navbar";
import PageTransition from "../PageTransition";
interface ConsultancyData {
  _id?: string;
  id?: string;
  name: string;
  category: string;
  image: string;
  price: string;
  availability?: {
    days: string[];
    hours: string;
  };
}

const BookAppointment: React.FC = () => {
  const params = useParams();
  const { user } = useUser();
  const consultancyId = params?.id as string;
  const [consultancy, setConsultancy] = useState<ConsultancyData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConsultancy = async () => {
      try {
        const response = await fetch(`/api/consultancies/${consultancyId}`);
        const result = await response.json();
        
        if (result.success) {
          setConsultancy(result.data);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching consultancy:', error);
        setLoading(false);
      }
    };

    if (consultancyId) {
      fetchConsultancy();
    }
  }, [consultancyId]);

  if (loading) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-xl text-gray-600">Loading...</div>
        </div>
      </PageTransition>
    );
  }

  if (!consultancy) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-xl text-gray-600">Consultancy not found</div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-6 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
              <h1 className="text-3xl font-bold mb-4">Book Appointment</h1>
              <div className="flex items-center gap-4 mb-6">
                <img 
                  src={consultancy.image} 
                  alt={consultancy.name}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div>
                  <h2 className="text-xl font-semibold">{consultancy.name}</h2>
                  <p className="text-gray-600">{consultancy.category}</p>
                  <p className="text-blue-600 font-medium">{consultancy.price}</p>
                </div>
              </div>
            </div>
            
            <AppointmentBooking 
              consultancyId={consultancyId}
              price={consultancy.price}
              availability={consultancy.availability || { days: [], hours: '' }}
            />
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default BookAppointment;
