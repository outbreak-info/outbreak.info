import { from } from 'rxjs';
import { finalize, catchError, map } from 'rxjs/operators';
import { timeParse } from 'd3';

import store from '@/store';
import { getAll } from '@/api/biothings.js';

export function getMapData(apiUrl) {
  const parseDate = timeParse('%Y-%m-%d');

  store.state.admin.loading = true;
  // Choosing one specific date, since all dates contain the current info.
  return getAll(
    apiUrl,
    `mostRecent:true AND admin_level:[0 TO 1]&fields=location_id,name,num_subnational,country_name,admin_level,lat,long,confirmed,
  confirmed_numIncrease,
  confirmed_pctIncrease,
  date,
  dead,
  dead_numIncrease,
  dead_pctIncrease,
  recovered,
  recovered_numIncrease,
  recovered_pctIncrease`,
  ).pipe(
    map((results) => {
      results.forEach((d) => {
        d['coord'] = [d.lat, d.long];
        d['date'] = parseDate(d['date']);
      });
      return results;
    }),
    catchError((e) => {
      console.log('%c Error in getting map data!', 'color: red');
      console.log(e);
      return from([]);
    }),
    finalize(() => (store.state.admin.loading = false)),
  );
}
