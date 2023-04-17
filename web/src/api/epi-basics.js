import { forkJoin, from, of } from 'rxjs';
import axios from 'axios';
import { catchError, finalize, map, pluck, tap } from 'rxjs/operators';
import { sum } from 'd3-array';
import { nest } from 'd3-collection';

import { getAll } from '@/api/biothings.js';
import { adminStore } from '@/stores/adminStore';
import { geoStore } from '@/stores/geoStore';

const storeAdmin = adminStore();
const storeGeo = geoStore();

export const lookupEpiLocations = (apiUrl, locationArr) => {
  if (locationArr.length) {
    return from(
      axios.get(
        `${apiUrl}query?q=mostRecent:true AND location_id:(${locationArr.join(
          ' OR ',
        )})&size=1000&fields=name,location_id,country_name,state_name`,
      ),
    ).pipe(
      pluck('data', 'hits'),
      map((results) => {
        results.forEach((d) => {
          d['label'] = d.state_name
            ? `${d.name}, ${d.state_name}`
            : d.country_name && d.country_name !== d.name
            ? `${d.name}, ${d.country_name}`
            : d.name;
        });

        // ensure the sort order is same as what was given
        results.sort(
          (a, b) =>
            locationArr.indexOf(a.location_id) -
            locationArr.indexOf(b.location_id),
        );

        return results;
      }),
      catchError((e) => {
        console.log('%c Error in epi locations!', 'color: red');
        console.log(e);
        return from([]);
      }),
    );
  } else {
    return of([]);
  }
};

export const findEpiLocation = (apiUrl, query, num2Return = 5) => {
  return from(
    axios.get(
      `${apiUrl}query?q=mostRecent:true AND name.lower:*${query}*&size=${num2Return}&fields=name,location_id,admin1,admin2,admin_level,country_name`,
    ),
  ).pipe(
    pluck('data', 'hits'),
    map((results) => {
      results.forEach((d) => {
        let location_label = d.name;
        if (d.admin_level === 2 && d.admin2 && d.admin2 !== 'None') {
          location_label =
            d.name === 'Kansas City' || d.name === 'New York'
              ? `${d.name}, ${d.country_name}`
              : `${d.admin2} County, ${d.admin1}`;
        } else if (d.admin_level === 1 && d.admin1 && d.admin1 !== 'None') {
          location_label = `${d.name}, ${d.country_name}`;
        } else if (d.admin_level === 1.5) {
          location_label = `${d.name} Metro, ${d.admin1}, ${d.country_name}`;
        }
        d['label'] = location_label;
      });
      return results;
    }),
    catchError((e) => {
      console.log('%c Error in epi locations!', 'color: red');
      console.log(e);
      return from([]);
    }),
  );
};

export const getLocations = (apiUrl) => {
  storeAdmin.$patch({ loading: true });

  if (storeGeo.allPlaces.length === 0) {
    return getAll(
      apiUrl,
      `mostRecent:true&fields=location_id,name,country_name,admin1,wb_region,admin_level`,
    ).pipe(
      map((results) => {
        let places = results.map((d) => {
          return {
            label: getLabel(d),
            id: d.location_id,
            admin_level: d.admin_level,
          };
        });

        // Add in groups of Admin 1's, Admin 0's
        const regions = nest()
          .key((d) => d.wb_region)
          .rollup((values) => values.map((d) => d.location_id).join(';'))
          .entries(results.filter((d) => d.admin_level === 0));

        regions.forEach((d) => {
          d['label'] = `${d.key} (all countries)`;
          d['id'] = d.value;
          d['admin_level'] = -0.5;
          delete d.key;
          delete d.value;
        });
        const countries = nest()
          .key((d) => d.country_name)
          .rollup((values) => values.map((d) => d.location_id).join(';'))
          .entries(results.filter((d) => d.admin_level === 1));

        countries.forEach((d) => {
          d['label'] = `${d.key} (all states/provinces)`;
          d['id'] = d.value;
          d['admin_level'] = 0.5;
          delete d.key;
          delete d.value;
        });

        places = places.concat(regions).concat(countries);
        places.sort((a, b) => (a.admin_level < b.admin_level ? -1 : 1));
        storeGeo.$patch({ allPlaces: places });
        return places;
      }),
      catchError((e) => {
        console.log('%c Error in getting locations!', 'color: red');
        console.log(e);
        return from([]);
      }),
      finalize(() => storeAdmin.$patch({ loading: false })),
    );
  } else {
    storeAdmin.$patch({ loading: false });
    return from(storeGeo.allPlaces);
  }
};

const getLabel = (entry) => {
  if (entry.admin_level === 0) {
    return entry.name;
  } else if (entry.admin_level === 1) {
    return entry.country_name === 'United States of America'
      ? `${entry.name} State, USA`
      : `${entry.name} Province, ${entry.country_name}`;
  } else if (String(entry.admin_level) === '1.7') {
    return `${entry.name}`;
  } else if (String(entry.admin_level) === '1.5') {
    return `${entry.name} Metropolitan Area`;
  } else if (String(entry.admin_level) === '2') {
    return `${entry.name} County, ${entry.admin1}`;
  }
  return entry.name;
};

export const getSummary = (apiUrl, caseThreshold) => {
  storeAdmin.$patch({ loading: true });
  return forkJoin([
    getTotals(apiUrl),
    countCountries(apiUrl),
    getFirstCases(apiUrl),
    getCasesAboveThresh(apiUrl, caseThreshold),
  ]).pipe(
    map(([totals, numCountries, firstCases, highCases]) => {
      totals['numCountries'] = numCountries;
      totals['firstCases'] = firstCases;
      totals['aboveThreshold'] = highCases;
      return totals;
    }),
    catchError((e) => {
      console.log('%c Error in getting summary!', 'color: red');
      console.log(e);
      return from([]);
    }),
    finalize(() => storeAdmin.$patch({ loading: false })),
  );
};

export const getTotals = (apiUrl) => {
  return from(
    axios.get(
      `${apiUrl}query?q=mostRecent:true AND admin_level:"-1"&fields=confirmed,dead&sort=-confirmed&size=100`,
    ),
  ).pipe(
    pluck('data', 'hits'),
    map((results) => {
      return {
        confirmed: sum(results, (d) => d.confirmed).toLocaleString(),
        dead: sum(results, (d) => d.dead).toLocaleString(),
      };
    }),
    catchError((e) => {
      console.log('%c Error in getting totals!', 'color: red');
      console.log(e);
      return from([]);
    }),
  );
};

export const countCountries = (apiUrl) => {
  return from(
    axios.get(
      `${apiUrl}query?q=mostRecent:true AND admin_level:0&size=0&facet_size=300&facets=name`,
    ),
  ).pipe(
    pluck('data', 'facets', 'name', 'terms'),
    map((results) => {
      return results.length;
    }),
    catchError((e) => {
      console.log('%c Error in getting number of countries!', 'color: red');
      console.log(e);
      return from([]);
    }),
  );
};

export const getFirstCases = (apiUrl) => {
  return from(
    axios.get(
      `${apiUrl}query?q=mostRecent:true%20AND%20admin_level:0%20AND%20confirmed_newToday:true&size=300&fields=name,location_id`,
    ),
  ).pipe(
    pluck('data', 'hits'),
    map((results) => {
      const summary = {};
      results.sort((a, b) => (a.name < b.name ? -1 : 1));

      summary['count'] = results.length;
      summary['names'] = results.map((d) => d.name).join(', ');
      summary['link'] = results.map((d) => d.location_id).join(';');
      return summary;
    }),
    catchError((e) => {
      console.log('%c Error in getting cfirst cases!', 'color: red');
      console.log(e);
      return from([]);
    }),
  );
};

export const getCasesAboveThresh = (apiUrl, threshold) => {
  return from(
    axios.get(
      `${apiUrl}query?q=mostRecent:true%20AND%20admin_level:0%20AND%20confirmed_numIncrease:[${threshold} TO *]&size=300&fields=name,location_id`,
    ),
  ).pipe(
    pluck('data', 'hits'),
    map((results) => {
      const summary = {};
      results.sort((a, b) => (a.name < b.name ? -1 : 1));

      summary['count'] = results.length;
      summary['names'] = results.map((d) => d.name).join(', ');
      summary['link'] = results.map((d) => d.location_id).join(';');
      return summary;
    }),
    catchError((e) => {
      console.log('%c Error in getting case counts!', 'color: red');
      console.log(e);
      return from([]);
    }),
  );
};
