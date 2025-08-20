"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Building, 
  Mail, 
  Phone, 
  MapPin, 
  Tag, 
  DollarSign, 
  FileText, 
  Globe, 
  Clock, 
  Save,
  ArrowLeft,
  Camera
} from "lucide-react";


const ConsultancyEditPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const consultancyId = searchParams?.get('id');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
    location: "",
    price: "",
    whyChooseUs: "",
    image: "",
    phone: "",
    email: "",
    website: "",
    expertise: "",
    availableDays: [] as string[],
    availableHours: "",
  });

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const categories = [
    "Business Strategy", 
    "Financial Services", 
    "Legal Advisory", 
    "Technology", 
    "Health & Wellness",
    "Real Estate & Housing",
    "Career Consultation",
    "Lifestyle & Personal Growth",
    "Travel & Hospitality",
    "Miscellaneous"
  ];

  useEffect(() => {
    // Remove loading overlay if it exists
    const overlay = document.querySelector('.page-loading-overlay');
    if (overlay) {
      setTimeout(() => {
        overlay.classList.add('fade-out');
        setTimeout(() => overlay.remove(), 300);
      }, 800);
    }
    
    const fetchProfile = async () => {
      if (!consultancyId) {
        router.push('/consultancy-admin');
        return;
      }


      try {
        setLoading(true);
        const response = await fetch(`/api/consultancies/${consultancyId}`);
        const result = await response.json();

        if (result.success) {
          const profile = result.data;
          setFormData({
            name: profile.name || "",
            category: profile.category || "",
            description: profile.description || "",
            location: profile.location || "",
            price: profile.price || "",
            whyChooseUs: Array.isArray(profile.whyChooseUs) ? profile.whyChooseUs.join(', ') : (profile.whyChooseUs || ""),
            image: profile.image || "",
            phone: profile.contact?.phone || "",
            email: profile.contact?.email || "",
            website: profile.contact?.website || "",
            expertise: profile.expertise?.join(', ') || "",
            availableDays: profile.availability?.days || [],
            availableHours: profile.availability?.hours || "",
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [consultancyId, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (day: string) => {
    setFormData(prev => {
      const updatedDays = prev.availableDays.includes(day)
        ? prev.availableDays.filter(d => d !== day)
        : [...prev.availableDays, day];
      
      return { ...prev, availableDays: updatedDays };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const consultancyData = {
        name: formData.name,
        image: formData.image,
        category: formData.category,
        description: formData.description,
        location: formData.location,
        expertise: formData.expertise.split(',').map(item => item.trim()),
        price: formData.price,
        whyChooseUs: formData.whyChooseUs.split(',').map(item => item.trim()),
        availability: {
          days: formData.availableDays,
          hours: formData.availableHours
        },
        contact: {
          phone: formData.phone,
          email: formData.email,
          website: formData.website,
          password: "defaultPassword123" // Keep existing password
        }
      };
      
      const response = await fetch(`/api/consultancies/${consultancyId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(consultancyData),
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert("Profile updated successfully!");
        router.push("/consultancy-admin");
      } else {
        alert(result.error || "Update failed. Please try again.");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("There was an error updating your profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };



  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">✏️</div>
          <div className="text-xl font-medium text-gray-700 mb-2">Loading Edit Profile</div>
          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Simple Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 bg-white px-6 py-3 rounded-full shadow-lg border border-indigo-100">
              <button
                onClick={() => {
                  // Create loading overlay
                  const overlay = document.createElement('div');
                  overlay.className = 'page-loading-overlay';
                  overlay.innerHTML = `
                    <div class="text-center">
                      <div class="text-4xl mb-4">📋</div>
                      <div class="text-xl font-medium text-gray-700 mb-2">Loading Admin Panel</div>
                      <div class="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
                    </div>
                  `;
                  document.body.appendChild(overlay);
                  
                  setTimeout(() => {
                    router.push('/consultancy-admin');
                  }, 300);
                }}
                className="p-2 hover:bg-indigo-50 rounded-full transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-indigo-600" />
              </button>
              <div className="text-2xl">✏️</div>
              <h1 className="text-xl font-bold text-gray-800">Edit Profile</h1>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-8">

            <form onSubmit={handleSubmit}>
              {/* Image Section */}
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-4 border-b pb-2">Profile Image</h2>
                <div className="flex items-center gap-4">
                  <img 
                    src={formData.image || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=60"} 
                    alt="Profile" 
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Image URL
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Camera className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="url"
                        name="image"
                        value={formData.image}
                        onChange={handleChange}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Basic Information */}
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-4 border-b pb-2">Basic Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Consultancy Name*
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Building className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Your consultancy name"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category*
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Tag className="h-5 w-5 text-gray-400" />
                      </div>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        required
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="">Select a category</option>
                        {categories.map((category) => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Location*
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MapPin className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        required
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="City, State"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price (per session)*
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <DollarSign className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        required
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="$250/hour"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description*
                  </label>
                  <div className="relative">
                    <div className="absolute top-3 left-3 flex items-center pointer-events-none">
                      <FileText className="h-5 w-5 text-gray-400" />
                    </div>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      required
                      rows={5}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Tell potential clients about your consultancy services..."
                    ></textarea>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Why Choose Us (comma separated)
                  </label>
                  <input
                    type="text"
                    name="whyChooseUs"
                    value={formData.whyChooseUs}
                    onChange={handleChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Expert guidance, Proven results, 24/7 support"
                  />
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expertise (comma separated)*
                  </label>
                  <input
                    type="text"
                    name="expertise"
                    value={formData.expertise}
                    onChange={handleChange}
                    required
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Business Strategy, Market Analysis, Financial Planning"
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-4 border-b pb-2">Contact Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address*
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="contact@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number*
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Website
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Globe className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="url"
                        name="website"
                        value={formData.website}
                        onChange={handleChange}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="https://example.com"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Availability */}
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-4 border-b pb-2">Availability</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Available Days*
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {daysOfWeek.map((day) => (
                      <div key={day} className="flex items-center">
                        <input
                          type="checkbox"
                          id={day}
                          checked={formData.availableDays.includes(day)}
                          onChange={() => handleCheckboxChange(day)}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <label htmlFor={day} className="ml-2 block text-sm text-gray-700">
                          {day}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Available Hours*
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Clock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="availableHours"
                      value={formData.availableHours}
                      onChange={handleChange}
                      required
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="9:00 AM - 5:00 PM"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => {
                    // Create loading overlay
                    const overlay = document.createElement('div');
                    overlay.className = 'page-loading-overlay';
                    overlay.innerHTML = `
                      <div class="text-center">
                        <div class="text-4xl mb-4">📋</div>
                        <div class="text-xl font-medium text-gray-700 mb-2">Loading Admin Panel</div>
                        <div class="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
                      </div>
                    `;
                    document.body.appendChild(overlay);
                    
                    setTimeout(() => {
                      router.push('/consultancy-admin');
                    }, 300);
                  }}
                  className="flex-1 bg-gray-500 text-white py-3 px-4 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    "Updating..."
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Update Profile
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsultancyEditPage;