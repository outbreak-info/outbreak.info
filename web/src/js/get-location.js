import { from, Observable, of } from 'rxjs';
import axios from 'axios';
import { catchError, pluck, map, mergeMap } from 'rxjs/operators';

const getLocation = (apiUrl) => {
  return lookupLocation().pipe(
    mergeMap((loc) => processLocation(apiUrl, loc)),
    catchError((e) => {
      console.log("%c User doesn't allow geolocation", 'color: blue');
      console.log(e);
      return from(['none']);
    }),
  );
};

const lookupLocation = () => {
  return Observable.create((observer) => {
    if (window.navigator && window.navigator.geolocation) {
      window.navigator.geolocation.getCurrentPosition(
        (position) => {
          observer.next(position);
          observer.complete();
        },
        (error) => observer.error(error),
      );
    } else {
      observer.error('Unsupported Browser');
    }
  });
};

// export function getLocation(apiUrl) {
//   // if (!navigator.geolocation) {
//   //   console.log("Geolocation not supported")
//   // }
//   // else {
//   //
//   return new Promise((resolve, reject) => {
//     navigator.geolocation.getCurrentPosition(resolve, reject)
//     // navigator.geolocation.getCurrentPosition(loc => processLocation(apiUrl, loc), failedLocation)
//   })
//
//   // }
// }

const processLocation = (apiUrl, location) => {
  const scalar = 0.05;
  const url = `${apiUrl}query?q=mostRecent:true AND lat:[${
    (1 - scalar) * location.coords.latitude
  } TO ${(1 + scalar) * location.coords.latitude}] AND long:[${
    (1 + scalar) * location.coords.longitude
  } TO ${
    (1 - scalar) * location.coords.longitude
  }] &fields=location_id,lat,long&size=25`;
  return from(axios.get(url)).pipe(
    pluck('data', 'hits'),
    map((results) => {
      // Calc Pythagoean distance
      results.forEach((loc) => {
        loc['dist'] =
          Math.pow(location.coords.latitude - loc.lat, 2) +
          Math.pow(location.coords.longitude - loc.long, 2);
      });

      results.sort((a, b) => a.dist - b.dist);

      const nearest = results[0];

      return nearest ? nearest.location_id : 'none';
    }),
    catchError((e) => {
      console.log('%c Error in getting nearest location!', 'color: red');
      console.log(e);
      return from([]);
    }),
  );
};

const failedLocation = (location) => {
  console.log(`failed location: ${location}`);
  return of(null);
};

const worldLocation = {
  admin_level: 0,
  id: 'Worldwide',
  label: 'Worldwide',
  query_id: 'Worldwide',
  who_region: 'World',
};

export { getLocation, worldLocation };
