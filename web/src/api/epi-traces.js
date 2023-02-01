import { BehaviorSubject, forkJoin, from } from 'rxjs';
import axios from 'axios';
import { catchError, finalize, map, mergeMap, pluck } from 'rxjs/operators';
import { sum } from 'd3-array';
import { nest } from 'd3-collection';
import { format } from 'd3-format';
import { timeParse } from 'd3-time-format';

import { getAll } from '@/api/biothings.js';
import { adminStore } from '@/stores/adminStore';
import { colorsStore } from '@/stores/colorsStore';

const store = adminStore();
const colorStore = colorsStore();
export const epiDataSubject = new BehaviorSubject([]);
export const epiDataState$ = epiDataSubject.asObservable();

export const epiTableSubject = new BehaviorSubject({
  data: [],
  total: 0,
});
export const epiTableState$ = epiTableSubject.asObservable();

export const getEpiData = (
  apiUrl,
  locations,
  adminLevels,
  sort,
  page,
  size,
) => {
  store.$patch({ loading: true });

  return forkJoin([
    getEpiTraces(apiUrl, locations),
    getEpiTable(apiUrl, locations, adminLevels, sort, page, size),
  ]).pipe(
    catchError((e) => {
      console.log('%c Error in getting case counts!', 'color: red');
      console.log(e);
      return from([]);
    }),
    finalize(() => store.$patch({ loading: false })),
  );
};

export const getWorldDailyCases = (
  apiUrl,
  fields = 'wb_region,confirmed_numIncrease, confirmed_rolling, date, dead_numIncrease, dead_rolling',
) => {
  const parseDate = timeParse('%Y-%m-%d');

  const queryString = `admin_level:"-1"&sort=date&fields=${fields}&size=1000`;

  return getAll(apiUrl, queryString).pipe(
    // pluck("data"),
    map((results) => {
      let nested = nest()
        .key((d) => d.date)
        .rollup((values) => {
          return {
            confirmed_numIncrease: sum(values, (d) => d.confirmed_numIncrease),
            dead_numIncrease: sum(values, (d) => d.dead_numIncrease),
            confirmed_rolling: sum(values, (d) => d.confirmed_rolling),
            dead_rolling: sum(values, (d) => d.dead_rolling),
          };
        })
        .entries(results)
        .map((d) => {
          return {
            date: parseDate(d.key),
            confirmed_numIncrease: d.value.confirmed_numIncrease,
            confirmed_rolling: d.value.confirmed_rolling,
            dead_numIncrease: d.value.dead_numIncrease,
            dead_rolling: d.value.dead_rolling,
          };
        });

      results.forEach((d) => {
        d['date'] = parseDate(d.date);
      });

      results.sort((a, b) => a.date - b.date);
      nested.sort((a, b) => a.date - b.date);

      let regions = nest()
        .key((d) => d.wb_region)
        .rollup((values) => values)
        .entries(results);

      const regionalTotal = regions.map((region) => {
        const total = sum(region.value, (d) => d.confirmed_numIncrease);
        return {
          key: region.key,
          total: total,
        };
      });

      const regionOrder = regionalTotal
        .sort((a, b) => b.total - a.total)
        .map((d) => d.key);

      regions.sort(
        (a, b) => regionOrder.indexOf(a.key) - regionOrder.indexOf(b.key),
      );

      return {
        total: nested,
        regional: regions,
      };
    }),
  );
};

export const getEpiTraces = (
  apiUrl,
  locations,
  fields = 'location_id,admin_level,name,country_name,date,confirmed,confirmed,dead,recovered,confirmed_numIncrease, dead_numIncrease,dead_doublingRate,confirmed_doublingRate,mostRecent,_id,confirmed_rolling,dead_rolling,recovered_rolling,confirmed_per_100k,confirmed_numIncrease_per_100k,confirmed_rolling_per_100k,dead_per_100k,dead_numIncrease_per_100k,dead_rolling_per_100k,recovered_per_100k,recovered_numIncrease_per_100k,recovered_rolling_per_100k,sub_parts',
) => {
  store.$patch({ loading: true });
  const parseDate = timeParse('%Y-%m-%d');
  const locationString = `("${locations.join('" OR "')}")`;

  // sort by date so the numbers appear in the right order.
  const queryString = `location_id:${locationString}&sort=date&size=1000&fields=${fields}`;

  return getAll(apiUrl, queryString).pipe(
    map((results) => {
      // convert dates to javascript dates
      results.forEach((d) => {
        d['date'] = parseDate(d.date);
      });

      const nested = nest()
        .key((d) => d.location_id)
        .rollup((values) => values)
        .entries(results);

      nested.forEach((d) => {
        const today = d.value.filter((d) => d.mostRecent);
        // should be the same for all data; pulling out the first one.
        d['currentCases'] = today[0].confirmed;

        // sorting so transition appears correctly
        d.value.sort((a, b) => a.date - b.date);
      });

      // sort colors by the highest confirmed cases
      const order = results
        .filter((d) => d.mostRecent)
        .sort((a, b) => b.confirmed - a.confirmed)
        .map((d) => d.location_id);
      colorStore.setLocations(order);
      epiDataSubject.next(nested);
      return nested;
    }),
    catchError((e) => {
      console.log('%c Error in getting case counts!', 'color: red');
      console.log(e);
      return from([]);
    }),
  );
};

export const getEpiTable = (
  apiUrl,
  locations,
  adminLevels,
  sort,
  size,
  page,
) => {
  store.$patch({ loading: true });
  return getTableData(apiUrl, locations, adminLevels, sort, size, page).pipe(
    mergeMap((tableData) =>
      getSparklineTraces(
        apiUrl,
        tableData['hits'].map((d) => encodeURIComponent(d.location_id)),
      ).pipe(
        map((sparks) => {
          sparks.forEach((spark) => {
            const idx = tableData['hits'].findIndex(
              (d) => d.location_id === spark.key,
            );
            if (idx > -1) {
              tableData['hits'][idx]['longitudinal'] = spark.value;
            }
          });

          epiTableSubject.next({
            data: tableData['hits'],
            total: tableData['total'],
          });

          return tableData;
        }),
      ),
    ),
    // .pipe(
    // map(results => {
    //   console.log(results)
    // })),
    catchError((e) => {
      console.log('%c Error in getting case counts!', 'color: red');
      console.log(e);
      return from([]);
    }),
    finalize(() => store.$patch({ loading: false })),
  );
};

export const getTableData = (
  apiUrl,
  locations,
  adminLevels,
  sort,
  size,
  page,
) => {
  const parseDate = timeParse('%Y-%m-%d');
  let queryString = locations
    ? `location_id:("${locations.join('" OR "')}")  AND mostRecent:true`
    : 'mostRecent:true';

  if (adminLevels && adminLevels.length > 0) {
    queryString =
      queryString + ` AND admin_level:("${adminLevels.join('" OR "')}")`;
  }

  return from(
    axios.get(
      `${apiUrl}query?q=${queryString}&sort=${sort}&size=${size}&from=${page}&fields=location_id,admin_level,name,country_name,admin1,wb_region,date,confirmed,confirmed_numIncrease,confirmed_pctIncrease,dead,dead_numIncrease,dead_pctIncrease,recovered,recovered_numIncrease,recovered_pctIncrease,first_dead-first_confirmed,population`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    ),
  ).pipe(
    pluck('data'),
    map((results) => {
      // convert dates to javascript dates, format things for the table
      results['hits'].forEach((d) => {
        d['date'] = parseDate(d.date);
        d['country_name'] = d.admin_level === 0 ? d.name : d.country_name;
        d['wb_region'] = d.admin_level === -1 ? d.name : d.wb_region;
        d['confirmed_cases'] = d.confirmed
          ? d.confirmed.toLocaleString()
          : null;
        d['confirmed_increase'] = d.confirmed_numIncrease
          ? d.confirmed_numIncrease.toLocaleString()
          : null;
        d['confirmed_pctIncrease'] = formatPercent(d.confirmed_pctIncrease);
        d['confirmed_percapita'] = d.population
          ? d.confirmed
            ? `1 in ${Math.round(d.population / d.confirmed).toLocaleString()}`
            : '0'
          : null;

        d['dead_cases'] = d.dead ? d.dead.toLocaleString() : null;
        d['dead_increase'] = d.dead_numIncrease
          ? d.dead_numIncrease.toLocaleString()
          : null;
        d['dead_pctIncrease'] = formatPercent(d.dead_pctIncrease);
        d['dead_percapita'] = d.population
          ? d.dead
            ? `1 in ${Math.round(d.population / d.dead).toLocaleString()}`
            : '0'
          : null;

        d['recovered_cases'] = d.recovered
          ? d.recovered.toLocaleString()
          : null;
        d['recovered_increase'] = d.recovered_numIncrease
          ? d.recovered_numIncrease.toLocaleString()
          : null;
        d['recovered_pctIncrease'] = formatPercent(d.recovered_pctIncrease);
        d['recovered_percapita'] = d.population
          ? d.recovered
            ? `1 in ${Math.round(d.population / d.recovered).toLocaleString()}`
            : '0'
          : null;
      });
      return results;
    }),
    catchError((e) => {
      console.log('%c Error in getting table data!', 'color: red');
      console.log(e);
      return from([]);
    }),
    // finalize(() => (stores.state.admin.loading = false))
  );
};

export const getSparklineTraces = (
  apiUrl,
  locations,
  variableString = 'confirmed,recovered,dead',
) => {
  if (locations) {
    const parseDate = timeParse('%Y-%m-%d');
    const queryString = `location_id:("${locations.join('" OR "')}")`;

    return getAll(
      apiUrl,
      `${queryString}&sort=date&size=1000&fields=date,location_id,${variableString}`,
    ).pipe(
      map((results) => {
        // convert dates to javascript dates, format things for the table
        results.forEach((d) => {
          d['date'] = parseDate(d.date);
          delete d['_id'];
          delete d['_score'];
        });

        results.sort((a, b) => a.date - b.date);
        return nest()
          .key((d) => d.location_id)
          .rollup((values) => values)

          .entries(results);
      }),
      catchError((e) => {
        console.log('%c Error in getting sparklines!', 'color: red');
        console.log(e);
        return from([]);
      }),
      // finalize(() => (stores.state.admin.loading = false))
    );
  } else {
    return from([]);
  }
};

const formatPercent = (pct) => {
  if (!pct) {
    return 'none';
  }

  if (pct < 0) {
    return 'case count corrected';
  }

  if (pct < 0.005) {
    return '< 1%';
  }

  if (!isFinite(pct)) {
    return '* first reported case *';
  }

  return format('.0%')(pct);
};
