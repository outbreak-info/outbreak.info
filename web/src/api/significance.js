import axios from 'axios';

axios.interceptors.request.use(
  (config) => {
    config.headers.Authorization = `Bearer ${
      import.meta.env.VITE_APP_API_ACCESS
    }`;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// provide highest significance lineages for selected location
export const getHighestSignificanceLineagesByLocation = async (location, lineagesPerLocation) => {     
  const baseUrl = "https://api.outbreak.info/significance/";
  const url =`${baseUrl}query?q=loc:${location}&sort=-sig&size=${lineagesPerLocation}`;
  return await axios.get(url); 
}
