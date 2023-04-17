import { from } from 'rxjs';
import { finalize, catchError, mergeMap, map } from 'rxjs/operators';
import { extent, max } from 'd3-array';
import { nest } from 'd3-collection';
import { timeParse } from 'd3-time-format';

import { getAll } from '@/api/biothings.js';
import { adminStore } from '@/stores/adminStore';

const store = adminStore();
export const findSimilar = (
  apiUrl,
  locationID,
  variable,
  similarityMetric,
  adminLevels,
  num2Return = 5,
) => {
  store.$patch({ dataloading: true });
  // Choosing one specific date, since all dates contain the current info.
  // First get the location's data for the most recent date.
  // Use that value to get the most recent value of `similarityMetric` and find locations with similar values
  // Then get ALL the data for all those locations.
  return getLocation(apiUrl, locationID, variable, similarityMetric, true).pipe(
    mergeMap((locationData) =>
      getSimilarData(
        apiUrl,
        locationData,
        similarityMetric,
        adminLevels,
        num2Return,
      ).pipe(
        mergeMap((similar) => {
          const locationString = `("${similar
            .map((d) => d.location_id)

            .join('" OR "')}")`;
          return getLocation(
            apiUrl,
            locationString,
            variable,
            similarityMetric,
          ).pipe(
            map((results) => {
              const nested = nest()
                .key((d) => d.location_id)
                .entries(results);

              nested.forEach((d) => {
                const mostRecent = d.values.slice(-1)[0];
                d['name'] = mostRecent.name;
                d['nameFormatted'] = mostRecent.admin1
                  ? `${mostRecent.name}, ${mostRecent.admin1}`
                  : mostRecent.country_name &&
                    mostRecent.country_name !== mostRecent.name
                  ? `${mostRecent.name}, ${mostRecent.country_name}`
                  : mostRecent.name;
                d['partOfUSA'] =
                  mostRecent.country_name === 'United States of America';
                d['lat'] = mostRecent.lat;
                d['lon'] = mostRecent.long;
                d['similarValue'] = mostRecent[similarityMetric];
              });

              const location = nested.filter((d) => d.key === locationID)[0];
              const locationValue = location.similarValue;

              nested.forEach((d) => {
                d['valueDiff'] = Math.abs(d.similarValue - locationValue);
              });

              nested.sort((a, b) => a.valueDiff - b.valueDiff);
              const xDomain = extent(results.map((d) => d.date));
              const yMaxC = max(
                results.map((d) => d.confirmed_rolling_per_100k),
              );
              const yMaxD = max(results.map((d) => d.dead_rolling_per_100k));

              return {
                similar: nested.filter((d) => d.key !== locationID),
                location: location,
                xDomain: xDomain,
                yMaxC: yMaxC,
                yMaxD: yMaxD,
              };
            }),
          );
        }),
      ),
    ),
    catchError((e) => {
      console.log('%c Error in getting similarity data!', 'color: red');

      console.log(e);
      return from([]);
    }),
    finalize(() => store.$patch({ dataloading: false })),
  );
};

export const getLocation = (
  apiUrl,
  locationID,
  variable,
  similarityMetric,
  mostRecent = false,
) => {
  const parseDate = timeParse('%Y-%m-%d');

  const query = mostRecent
    ? `location_id:${locationID} AND mostRecent:true`
    : `location_id:${locationID}`;

  return getAll(
    apiUrl,
    `${query}&fields=${similarityMetric},name,lat,long,date,location_id,confirmed_rolling_per_100k,dead_rolling_per_100k,admin1,country_name,population`,
  ).pipe(
    map((results) => {
      results.forEach((d) => {
        d['date'] = parseDate(d['date']);
      });

      results.sort((a, b) => a.date - b.date);

      return results;
    }),
    catchError((e) => {
      console.log(
        '%c Error in getting data for a particular location!',
        'color: red',
      );
      console.log(e);
      return from([]);
    }),
  );
};

export const getSimilarData = (
  apiUrl,
  locationData,
  similarityMetric,
  adminLevels,
  num2Return,
  logged = true,
) => {
  const threshold = 0.05;
  const mostRecent = locationData[0];
  const locationValue = mostRecent[similarityMetric];
  const value = logged ? Math.log10(locationValue) : locationValue;

  const thresholdString = logged
    ? `${Math.pow(10, (1 - threshold) * value)} TO ${Math.pow(
        10,
        (1 + threshold) * value,
      )}`
    : `${(1 - threshold) * value} TO ${(1 + threshold) * value}`;

  let query = `mostRecent:true AND ${similarityMetric}:[${thresholdString}]&fields=location_id,${similarityMetric}`;
  if (adminLevels.length) {
    const locationQuery = [];
    if (adminLevels.includes('countries')) {
      locationQuery.push('admin_level:0');
    }
    if (adminLevels.includes('non-U.S. States/Provinces')) {
      locationQuery.push('(admin_level:1 AND -iso3:USA)');
    }
    if (adminLevels.includes('U.S. States')) {
      locationQuery.push('(admin_level:1 AND iso3:USA)');
    }
    if (adminLevels.includes('U.S. Metro Areas')) {
      locationQuery.push('(admin_level:"1.5" AND iso3:USA)');
    }
    if (adminLevels.includes('U.S. Counties')) {
      locationQuery.push('(admin_level:2 AND iso3:USA)');
    }
    query = `(${locationQuery.join(' OR ')}) AND ${query}`;
  }
  // threshold for numbers 2147483647

  return getAll(apiUrl, query).pipe(
    map((similar) => {
      similar.forEach((d) => {
        d['valueDiff'] = Math.abs(d[similarityMetric] - locationValue);
      });

      similar.sort((a, b) => a.valueDiff - b.valueDiff);

      const filteredValue = similar.slice(0, num2Return + 1).slice(-1)[0];

      const filtered = similar.filter(
        (d) => d.valueDiff <= filteredValue.valueDiff,
      );
      filtered.push(mostRecent);
      return filtered;
    }),
    catchError((e) => {
      console.log('%c Error in getting similar locations!', 'color: red');
      console.log(e);
      return from([]);
    }),
  );
};
