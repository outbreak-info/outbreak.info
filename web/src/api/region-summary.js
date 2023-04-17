import { from, forkJoin } from 'rxjs';
import axios from 'axios';
import { finalize, catchError, map } from 'rxjs/operators';
import { sum } from 'd3-array';
import { nest } from 'd3-collection';
import { timeParse } from 'd3-time-format';

import { getAll } from '@/api/biothings.js';
import { adminStore } from '@/stores/adminStore';
import { geoStore } from '@/stores/geoStore';

const store = adminStore();
const storeGeo = geoStore();

export const getStackedRegions = (apiUrl) => {
  store.$patch({ loading: true });
  const parseDate = timeParse('%Y-%m-%d');

  return from(
    getAll(
      apiUrl,
      `admin_level:"-1"&size=1000&fields=location_id, name,date,confirmed,recovered,dead`,
    ),
  ).pipe(
    // tap(d => console.log(d)),
    map((results) => {
      // nest by date
      const regionNest = nest()
        .key((d) => d.date)
        .key((d) => d.name)
        .rollup((values) => {
          return {
            confirmed: sum(values, (d) => d.confirmed),
            dead: sum(values, (d) => d.dead),
            recovered: sum(values, (d) => d.recovered),
          };
        })
        .entries(results);

      const nested = {};
      nested['confirmed'] = [];
      nested['dead'] = [];
      nested['recovered'] = [];

      // loop over each date
      regionNest.map((d) => {
        const objC = {};
        const objD = {};
        const objR = {};
        objC['date'] = parseDate(d.key);
        objD['date'] = parseDate(d.key);
        objR['date'] = parseDate(d.key);

        // loop over each region for those values
        // looping over dict rather than values themselves to make sure I get 0s for everywhere.
        storeGeo.regionDict.forEach((region) => {
          const filtered = d.values.filter((d) => d.key === region.region);
          if (filtered.length === 1) {
            objC[filtered[0].key] = filtered[0].value.confirmed;
            objD[filtered[0].key] = filtered[0].value.dead;
            objR[filtered[0].key] = filtered[0].value.recovered;
          } else {
            objC[region.region] = 0;
            objD[region.region] = 0;
            objR[region.region] = 0;
          }
        });

        nested['confirmed'].push(objC);
        nested['dead'].push(objD);
        nested['recovered'].push(objR);
      });
      nested['confirmed'].sort((a, b) => a.date - b.date);
      nested['dead'].sort((a, b) => a.date - b.date);
      nested['recovered'].sort((a, b) => a.date - b.date);

      return nested;
    }),
    catchError((e) => {
      console.log('%c Error in getting region summaries!', 'color: red');
      console.log(e);
      return from([]);
    }),
    finalize(() => store.$patch({ loading: false })),
  );
};

export const getCountryData = (apiUrl, region, variable) => {
  store.$patch({ loading: true });
  const parseDate = timeParse('%Y-%m-%d');

  return forkJoin([
    from(
      axios.get(
        `${apiUrl}query?q=admin_level:0 AND mostRecent:true AND wb_region:"${encodeURIComponent(
          region,
        )}"&size=1000&fields=location_id,name,${variable},${variable}_numIncrease`,
      ),
    ),
    getAll(
      apiUrl,
      `admin_level:0 AND wb_region:"${encodeURIComponent(
        region,
      )}"&size=1000&fields=location_id,date,${variable}`,
    ),
  ]).pipe(
    map(([currentData, timeData]) => {
      // sort current data
      currentData['data']['hits'].sort((a, b) => a[variable] - b[variable]);

      // clean up time data: parse all dates, nest.
      // convert dates to javascript dates
      timeData.forEach((d) => {
        d['date'] = parseDate(d.date);
        delete d['_id'];
        delete d['_score'];
      });
      // ensure dates are sorted
      timeData.sort((a, b) => a.date - b.date);

      const sparks = nest()
        .key((d) => d.location_id)
        .rollup((values) => values)
        .entries(timeData);

      sparks.forEach((spark) => {
        const idx = currentData['data']['hits'].findIndex(
          (d) => d.location_id === spark.key,
        );
        if (idx > -1) {
          currentData['data']['hits'][idx]['data'] = spark.value;
        }
      });

      return currentData['data']['hits'];
    }),
    catchError((e) => {
      console.log('%c Error in getting regional country counts!', 'color: red');
      console.log(e);
      return from([]);
    }),
    finalize(() => store.$patch({ loading: false })),
  );
};
