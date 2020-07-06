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
  timeDay,
  offset,
  timeFormat
} from "d3";

import {
  getAll
} from "@/api/biothings.js";
import store from "@/store";

export function getComparisonData(apiUrl, location, adminLevel, sort, page, size) {
  store.state.admin.dataloading = true;

  const queryString = location ? `${location} AND admin_level:("${adminLevel}")` : `admin_level:${adminLevel}`;

  return getCurrentData(apiUrl, queryString, sort, page, size)
    // return getAll(apiUrl, queryString)
    .pipe(
      map(results => {
        return (results)
      }),
      catchError(e => {
        console.log("%c Error in getting comparison!", "color: red");
        console.log(e);
        return from([]);
      })
      // finalize(() => (store.state.admin.loading = false))
    )
}

export function getCurrentData(apiUrl, queryString, variable, sort) {
  const parseDate = timeParse("%Y-%m-%d");

  const fields = "date,location_id,name,state_name,country_iso3," + variable;

  // const qString = `(${queryString})&sort=${"-date"}&size=${size}&from=${page}&fields=${fields}`;
  const qString = `mostRecent:true AND (${queryString})&sort=-date,${sort}&fields=${fields}`;

  return getAll(apiUrl, qString)
    .pipe(
      map(results => {
        results.forEach(result => {
          result["datetime"] = parseDate(result.date);
        })

        results.sort((a, b) => b.datetime < a.datetime ? -1 : 1);

        return (results)
      }),
      catchError(e => {
        console.log("%c Error in getting current data!", "color: red");
        console.log(e);
        return from([]);
      })
    )
}
