import axios from 'axios';
import { from, of } from 'rxjs';
import { catchError, map, pluck } from 'rxjs/operators';

import CURATED from '@/assets/genomics/curated_lineages.json';

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

// get all lineage names
export const getAllLineageNames = (apiUrl) => {
  const url = `${apiUrl}lineage?name=*`;

  const vocs = CURATED.filter((d) => d.who_name).map((d) => ({
    name: d.who_name,
    alias: true,
  }));

  return from(
    axios.get(url, {
      headers: {
        'Content-Type': 'application/json',
      },
    }),
  ).pipe(
    pluck('data', 'results'),
    map((results) => {
      results.forEach((d) => {
        d.name = d.name.toUpperCase();
      });

      const filteredVocs = vocs.filter((d) =>
        d.name.toLowerCase(),
      );
      results = results.concat(filteredVocs);

      const namesArray = results.map(element => element.name);
      
      return namesArray;
    }),
    catchError((e) => {
      console.log('%c Error in getting lineage names!', 'color: red');
      console.log(e);
      return of([]);
    }),
  );
};

// get all location names
export const getAllLocationNames = (apiurl) => {
  const url = `${apiurl}location?name=*`;

  return from(
    axios.get(url, {
      headers: {
        'Content-Type': 'application/json',
      },
    }),
  ).pipe(
    pluck('data', 'results'),
    map((results) => {
      return results;
    }),
    catchError((e) => {
      console.log('%c Error in getting location names!', 'color: red');
      console.log(e);
      return of([]);
    }),
  );
};
