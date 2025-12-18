export const handleClerkError = (error) => {
  if (error?.message?.includes('Token refresh failed')) {
    // Clear auth cache
    localStorage.removeItem('clerk-db-jwt');
    sessionStorage.clear();
    
    // Reload page to re-authenticate
    window.location.reload();
    return true;
  }
  return false;
};

export const withClerkErrorHandling = (fn) => {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      if (handleClerkError(error)) {
        return null;
      }
      throw error;
    }
  };
};