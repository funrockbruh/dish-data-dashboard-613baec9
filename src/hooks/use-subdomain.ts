
export const generateSubdomain = (restaurantName: string): string => {
  if (!restaurantName) return "";
  
  return restaurantName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-') // Replace non-alphanumeric with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with a single one
    .replace(/^-|-$/g, ''); // Remove hyphens at start and end
};
