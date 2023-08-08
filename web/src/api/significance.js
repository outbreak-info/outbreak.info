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

// provide highest significance lineages for selected locations
export const getHighestSignificanceLineages = async (locations, lineagesPerLocation) => {      
  const baseUrl = "https://api.outbreak.info/significance/";
  let significanceArray = [];
  let locationSigData = [];

  for (let i = 0; i < locations.length; i++) {
    const url =`${baseUrl}query?q=loc:${locations[i]}&sort=-sig&size=${lineagesPerLocation}`;
    significanceArray = significanceArray.concat(
      await axios.get(url)
        .then((response) => {
          locationSigData = response.data.hits;
          return locationSigData;
        })
        .catch((e) => {
          console.log(`%c Error in getting ${locations[i]} significance data!`, 'color: red');
          console.log(e);
        })
    )
  }
  return significanceArray;
};
 