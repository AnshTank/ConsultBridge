"use client";
import { useState } from "react";
import VerificationModal from './VerificationModal';

interface ConsultancyFormData {
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
  whyChooseUs?: string;
  availability: {
    days: string[];
    hours: string;
  };
  contact: {
    phone: string;
    email: string;
    website: string;
    password: string;
  };
}

interface ConsultancyFormProps {
  onSubmit: (data: ConsultancyFormData) => void;
  initialData?: Partial<ConsultancyFormData>;
  isEditing?: boolean;
}

const categories = [
  "Career Consultation",
  "Legal Advisory", 
  "Business Strategy",
  "Health & Wellness",
  "Technology",
  "Real Estate & Housing",
  "Financial Services",
  "Lifestyle & Personal Growth",
  "Travel & Hospitality",
  "Miscellaneous"
];

const availableDays = [
  "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
];

export default function ConsultancyForm({ onSubmit, initialData, isEditing = false }: ConsultancyFormProps) {
  const [formData, setFormData] = useState<ConsultancyFormData>({
    id: initialData?.id || "",
    name: initialData?.name || "",
    rating: initialData?.rating || 4.0,
    reviews: initialData?.reviews || 0,
    image: initialData?.image || "",
    category: initialData?.category || "",
    description: initialData?.description || "",
    location: initialData?.location || "",
    expertise: initialData?.expertise || [],
    price: initialData?.price || "",
    whyChooseUs: initialData?.whyChooseUs || "",
    availability: {
      days: initialData?.availability?.days || [],
      hours: initialData?.availability?.hours || ""
    },
    contact: {
      phone: initialData?.contact?.phone || "",
      email: initialData?.contact?.email || "",
      website: initialData?.contact?.website || "",
      password: initialData?.contact?.password || ""
    }
  });

  const [expertiseInput, setExpertiseInput] = useState("");
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [consultancyId, setConsultancyId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof ConsultancyFormData] as object),
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: name === 'rating' || name === 'reviews' ? parseFloat(value) : value
      }));
    }
  };

  const handleDayToggle = (day: string) => {
    setFormData(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        days: prev.availability.days.includes(day)
          ? prev.availability.days.filter(d => d !== day)
          : [...prev.availability.days, day]
      }
    }));
  };

  const addExpertise = () => {
    if (expertiseInput.trim() && !formData.expertise.includes(expertiseInput.trim())) {
      setFormData(prev => ({
        ...prev,
        expertise: [...prev.expertise, expertiseInput.trim()]
      }));
      setExpertiseInput("");
    }
  };

  const removeExpertise = (expertise: string) => {
    setFormData(prev => ({
      ...prev,
      expertise: prev.expertise.filter(e => e !== expertise)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Register consultancy
      const response = await fetch('/api/consultancies/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const result = await response.json();
      
      if (result.success) {
        setConsultancyId(result.consultancyId);
        setShowVerificationModal(true);
      } else {
        alert('Error: ' + result.error);
      }
    } catch (error) {
      alert('Registration failed. Please try again.');
    }
    
    setIsSubmitting(false);
  };

  return (
    <>
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">{isEditing ? 'Edit' : 'Add'} Consultancy</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2">Consultancy ID</label>
          <input
            type="text"
            name="id"
            value={formData.id}
            onChange={handleInputChange}
            className="w-full p-3 border rounded-lg"
            required
            disabled={isEditing}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full p-3 border rounded-lg"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Image URL</label>
          <input
            type="url"
            name="image"
            value={formData.image}
            onChange={handleInputChange}
            className="w-full p-3 border rounded-lg"
            placeholder="https://example.com/image.jpg"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            className="w-full p-3 border rounded-lg"
            required
          >
            <option value="">Select Category</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Location</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            className="w-full p-3 border rounded-lg"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Price</label>
          <input
            type="text"
            name="price"
            value={formData.price}
            onChange={handleInputChange}
            className="w-full p-3 border rounded-lg"
            placeholder="$150/session"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Rating</label>
          <input
            type="number"
            name="rating"
            value={formData.rating}
            onChange={handleInputChange}
            className="w-full p-3 border rounded-lg"
            min="0"
            max="5"
            step="0.1"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Reviews Count</label>
          <input
            type="number"
            name="reviews"
            value={formData.reviews}
            onChange={handleInputChange}
            className="w-full p-3 border rounded-lg"
            min="0"
            required
          />
        </div>
      </div>

      <div className="mt-6">
        <label className="block text-sm font-medium mb-2">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          className="w-full p-3 border rounded-lg"
          rows={4}
          required
        />
      </div>

      <div className="mt-6">
        <label className="block text-sm font-medium mb-2">Why Choose Us</label>
        <textarea
          name="whyChooseUs"
          value={formData.whyChooseUs}
          onChange={handleInputChange}
          className="w-full p-3 border rounded-lg"
          rows={3}
        />
      </div>

      <div className="mt-6">
        <label className="block text-sm font-medium mb-2">Expertise</label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={expertiseInput}
            onChange={(e) => setExpertiseInput(e.target.value)}
            className="flex-1 p-3 border rounded-lg"
            placeholder="Add expertise area"
          />
          <button
            type="button"
            onClick={addExpertise}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 min-w-[60px]"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.expertise.map((exp, index) => (
            <span
              key={index}
              className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
            >
              {exp}
              <button
                type="button"
                onClick={() => removeExpertise(exp)}
                className="text-red-500 hover:text-red-700 w-4 h-4 flex items-center justify-center"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <label className="block text-sm font-medium mb-2">Available Days</label>
        <div className="grid grid-cols-4 gap-2">
          {availableDays.map(day => (
            <label key={day} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.availability.days.includes(day)}
                onChange={() => handleDayToggle(day)}
                className="rounded"
              />
              <span className="text-sm">{day}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <label className="block text-sm font-medium mb-2">Available Hours</label>
        <input
          type="text"
          name="availability.hours"
          value={formData.availability.hours}
          onChange={handleInputChange}
          className="w-full p-3 border rounded-lg"
          placeholder="9:00 AM - 5:00 PM"
          required
        />
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2">Phone</label>
          <input
            type="tel"
            name="contact.phone"
            value={formData.contact.phone}
            onChange={handleInputChange}
            className="w-full p-3 border rounded-lg"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Email</label>
          <input
            type="email"
            name="contact.email"
            value={formData.contact.email}
            onChange={handleInputChange}
            className="w-full p-3 border rounded-lg"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Website</label>
          <input
            type="url"
            name="contact.website"
            value={formData.contact.website}
            onChange={handleInputChange}
            className="w-full p-3 border rounded-lg"
            required
          />
        </div>
      </div>

      <div className="mt-6">
        <label className="block text-sm font-medium mb-2">Password</label>
        <input
          type="password"
          name="contact.password"
          value={formData.contact.password}
          onChange={handleInputChange}
          className="w-full p-3 border rounded-lg"
          placeholder="Create a secure password"
          required
        />
      </div>

      <div className="mt-8">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors min-h-[48px] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Registering...' : (isEditing ? 'Update' : 'Register')} Consultancy
        </button>
      </div>
    </form>

    {/* Verification Modal */}
    {showVerificationModal && consultancyId && (
      <VerificationModal
        isOpen={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        consultancyId={consultancyId}
        email={formData.contact.email}
        phone={formData.contact.phone}
      />
    )}
    </>
  );
}