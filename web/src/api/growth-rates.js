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

// provide lineage growth rates for selected locations
export const getGrowthRatesByLocation = (url, selectedLineageAndLocations) => {
  return axios.get(url, {
    params: {
      'q': selectedLineageAndLocations 
    }
  });
}
