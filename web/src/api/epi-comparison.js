import { forkJoin, from } from 'rxjs';
import axios from 'axios';
import { catchError, map, pluck } from 'rxjs/operators';
import { range } from 'd3-array';
import { format } from 'd3-format';
import { scaleQuantile } from 'd3-scale';
import { timeParse } from 'd3-time-format';
import { interpolateRdYlBu } from 'd3-scale-chromatic';

import { getAll } from '@/api/biothings.js';
import { adminStore } from '@/stores/adminStore';

const store = adminStore();

export const getComparisonData = (
  apiUrl,
  location,
  adminLevel,
  variable,
  variableLabel,
  date,
) => {
  store.$patch({ dataloading: true });

  const queryString = location
    ? `${location} AND admin_level:("${adminLevel}")`
    : `admin_level:${adminLevel}`;

  return forkJoin([
    getCurrentDate(apiUrl),
    getJenksBreaks(apiUrl, queryString, variable),
    getContextMaps(apiUrl, location, adminLevel),
    getCurrentData(apiUrl, queryString, variable, date),
  ]).pipe(
    map(([currDate, breaks, contextMaps, results]) => {
      results.forEach((d) => {
        d.fill = breaks.scale(d[variable]);
        d.value = format(',.1f')(d[variable]);
        d.rightAlign = d[variable] < 0;
        d.tooltip = variable.includes('_14days_ago')
          ? d[variable] < 0
            ? `${format(',.1f')(
                -1 * d[variable],
              )} <b>fewer</b> ${variableLabel}`
            : `${d['value']} <b>more</b> ${variableLabel}`
          : `<b>${d['value']}</b> ${variableLabel}`;
      });

      const blankMap = contextMaps[0];
      const overlay = contextMaps[1] ? contextMaps[1].features : [];
      return {
        data: results,
        blankMap: blankMap,
        overlay: overlay,
        maxDate: currDate,
        colorScale: breaks.scale,
      };
    }),
    catchError((e) => {
      console.log('%c Error in getting comparison!', 'color: red');
      console.log(e);
      return from([]);
    }),
  );
};

const getContextMaps = (apiUrl, location, adminLevel) => {
  const queries = [];

  queries.push(getBlankMap(apiUrl, location, adminLevel));
  if (adminLevel !== '0' && adminLevel !== '1') {
    queries.push(getBlankMap(apiUrl, location, '1'));
  }
  return forkJoin(queries);
};

const getBlankMap = (apiUrl, location, adminLevel) => {
  const qString = location
    ? `mostRecent:true AND admin_level:"${adminLevel}" AND ${location}`
    : `mostRecent:true AND admin_level:"${adminLevel}"`;
  return from(
    axios.get(
      `${apiUrl}query?q=${qString}&size=1000&fields=geometry&_sorted=false`,
    ),
  ).pipe(
    pluck('data', 'hits'),
    map((results) => {
      results.forEach((result) => {
        result['type'] = 'Feature'; // needed to make sure D3 knows it's a geojson
        delete result['_score'];
        delete result['_id'];
      });

      return {
        features: results,
        type: 'FeatureCollection',
      };
    }),
    catchError((e) => {
      console.log('%c Error in getting current date!', 'color: red');
      console.log(e);
      return from([]);
    }),
  );
};

const getCurrentDate = (apiUrl) => {
  const parseDate = timeParse('%Y-%m-%d');

  return from(
    axios.get(
      `${apiUrl}query?q=mostRecent:true&size=1&sort=-date&fields="date"`,
    ),
  ).pipe(
    pluck('data', 'hits'),
    map((results) => {
      return parseDate(results[0].date);
    }),
    catchError((e) => {
      console.log('%c Error in getting current date!', 'color: red');
      console.log(e);
      return from([]);
    }),
  );
};

export const getJenksBreaks = (apiUrl, queryString, variable) => {
  const qString = `${queryString} AND mostRecent:true&fields=${variable}_breaks`;
  return from(axios.get(`${apiUrl}query?q=${qString}&size=1`)).pipe(
    pluck('data', 'hits'),
    map((results) => {
      const domain = results[0][`${variable}_breaks`];
      // Breaks calculated in R, and centered around 0.
      const numColors = domain.length - 1;
      // color range
      let colorRange;
      // DIVERGING
      if (variable.includes('diff')) {
        // calculate colors
        colorRange = range(0, 1.01, 1 / (numColors - 1))
          .map((d) => interpolateRdYlBu(d))

          .reverse();
      } else {
        // SEQUENTIAL
        colorRange = range(0, 0.51, 0.5 / numColors)
          .map((d) => interpolateRdYlBu(d))
          .reverse();
      }

      const colorScale = scaleQuantile().range(colorRange).domain(domain);

      return {
        breaks: domain,
        scale: colorScale,
      };
    }),
    catchError((e) => {
      console.log('%c Error in getting current breaks!', 'color: red');
      console.log(e);
      return from([]);
    }),
  );
};

export const getCurrentData = (apiUrl, queryString, variable, date) => {
  const parseDate = timeParse('%Y-%m-%d');

  const fields = 'date,location_id,name,admin1,iso3,geometry,' + variable;

  // const qString = `(${queryString})&sort=${"-date"}&size=${size}&from=${page}&fields=${fields}`;
  const qString = date
    ? `date:${date} AND (${queryString})&sort=-date&fields=${fields}&_sorted=false`
    : `mostRecent:true AND (${queryString})&sort=-date&fields=${fields}&_sorted=0`;

  return getAll(apiUrl, qString).pipe(
    map((results) => {
      results.forEach((result) => {
        result['datetime'] = parseDate(result.date);
        result['type'] = 'Feature';
      });

      results.sort((a, b) => (b.datetime < a.datetime ? -1 : 1));

      return results;
    }),
    catchError((e) => {
      console.log('%c Error in getting current data!', 'color: red');
      console.log(e);
      return from([]);
    }),
  );
};
