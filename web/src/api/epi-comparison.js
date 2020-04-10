import {
  from,
  forkJoin,
  BehaviorSubject
} from "rxjs";
import axios from "axios";
import {
  finalize,
  catchError,
  pluck,
  map,
  mergeMap
} from "rxjs/operators";
import {
  nest,
  timeParse,
  format
} from "d3";

import {
  getAll
} from "@/api/biothings.js";
import store from "@/store";

export function getComparisonData(apiUrl, location, adminLevel, sort, page, size) {
  store.state.admin.loading = true;

  const queryString = location ? `${location} AND admin_level:("${adminLevel}")` : `admin_level:${adminLevel}`;

  console.log(queryString)

  return getCurrentData(apiUrl, queryString, sort, page, size)
  // return getAll(apiUrl, queryString)
    .pipe(
      map(results => {
        console.log(results)
        return(results)
      }),
    catchError(e => {
      console.log("%c Error in getting top place names!", "color: red");
      console.log(e);
      return from([]);
    }),
    finalize(() => (store.state.admin.loading = false))
  )
}

export function getCurrentData(apiUrl, queryString, sort, page, size) {
  const timestamp = Math.round(new Date().getTime() / 1e5);
  const fields = "date,location_id,name,state_name,confirmed,confirmed_numIncrease,confirmed_pctIncrease,confirmed_doublingRate,dead,dead_numIncrease,dead_pctIncrease,dead_doublingRate"

  return from(axios.get(`${apiUrl}query?q=mostRecent:true AND ${queryString}&sort=${sort}&size=${size}&from=${page}&fields=${fields}&timestamp=${timestamp}`))
  // return getAll(apiUrl, queryString)
    .pipe(
      pluck("data", "hits"),
      map(results => {
        console.log(results)
        return(results)
      }),
    catchError(e => {
      console.log("%c Error in getting top place names!", "color: red");
      console.log(e);
      return from([]);
    })
  )
}
