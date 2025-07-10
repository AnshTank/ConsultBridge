export interface ConsultancyProfile {
  name: string;
  categories: string[];
  description: string;
  location: string;
  phone: string;
  email: string;

  price: string;
  image: string;
  expertise: string[];
  whyChooseUs: string;
  website?: string;
  availability: {
    days: string[];
    hours: string;
  };
}

export const checkConsultancyProfile = (userId: string): { exists: boolean; isComplete: boolean; profile?: ConsultancyProfile } => {
  try {
    const profileData = localStorage.getItem(`consultancy_${userId}`);
    
    if (!profileData) {
      return { exists: false, isComplete: false };
    }
    
    const profile: ConsultancyProfile = JSON.parse(profileData);
    
    // Check if required fields are filled
    const isComplete = !!(
      profile.name && 
      profile.categories?.length && 
      profile.description && 
      profile.location
    );
    
    return { exists: true, isComplete, profile };
  } catch (error) {
    console.error('Error checking consultancy profile:', error);
    return { exists: false, isComplete: false };
  }
};

export const saveConsultancyProfile = (userId: string, profile: ConsultancyProfile): boolean => {
  try {
    localStorage.setItem(`consultancy_${userId}`, JSON.stringify(profile));
    return true;
  } catch (error) {
    console.error('Error saving consultancy profile:', error);
    return false;
  }
};

export const getConsultancyProfile = (userId: string): ConsultancyProfile | null => {
  try {
    const profileData = localStorage.getItem(`consultancy_${userId}`);
    return profileData ? JSON.parse(profileData) : null;
  } catch (error) {
    console.error('Error getting consultancy profile:', error);
    return null;
  }
};