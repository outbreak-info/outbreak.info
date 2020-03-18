import {
  from,
  forkJoin,
  BehaviorSubject
} from "rxjs";
import axios from "axios";
import {
  tap,
  finalize,
  catchError,
  pluck,
  map,
} from "rxjs/operators";
import {
  nest,
  timeParse,
  sum
} from "d3";


export const epiDataSubject = new BehaviorSubject([]);
export const epiDataState$ = epiDataSubject.asObservable();

import store from "@/store";

export function getEpiData(apiUrl, locations) {
  store.state.admin.loading = true;

  // sort by date so the numbers appear in the right order.

  return (forkJoin(getEpiTraces(apiUrl, locations))).pipe(
    map(results => {
      console.log(results)

      epiDataSubject.next(results[0])
      return (results[0]);
    }),
    catchError(e => {
      console.log("%c Error in getting case counts!", "color: red");
      console.log(e);
      return from([]);
    }),
    finalize(() => (store.state.admin.loading = false))
  )
}

export function getEpiTraces(apiUrl, locations) {
  store.state.admin.loading = true;
  const parseDate = timeParse("%Y-%m-%d");
  // trigger no-cache behavior by adding timestamp to request
  const timestamp = new Date().getTime();
  const locationString = `("${locations.join('","')}")`;
  console.log(locationString)

  // sort by date so the numbers appear in the right order.

  return from(axios.get(`${apiUrl}query?q=location_id:${locationString}&sort=date&size=1000&fields=location_id,name,country_name,date,confirmed,recovered,dead,confirmed_currentCases,dead_currentCases,recovered_currentCases,_id&timestamp=${timestamp}`, {
    headers: {
      'Content-Type': 'application/json'
    }
  })).pipe(
    pluck("data", "hits"),
    map(results => {
      console.log(results)
      // convert dates to javascript dates
      results.forEach(d => {
        d['date'] = parseDate(d.date);
      })

      const nested = nest()
        .key(d => d.location_id)
        .rollup(values => values)
        .entries(results);

      // should be the same for all data; pulling out the first one.
      nested.forEach(d => {
        d["confirmed_currentCases"] = d.value[0].confirmed_currentCases;
        d["recovered_currentCases"] = d.value[0].recovered_currentCases;
        d["dead_currentCases"] = d.value[0].dead_currentCases;
      })

      store.commit(
        "colors/setLocations",
        nested
        .sort((a, b) => b.confirmed_currentCases - a.confirmed_currentCases)
        .map(d => d.key)
      );

      return (nested);
    }),
    catchError(e => {
      console.log("%c Error in getting case counts!", "color: red");
      console.log(e);
      return from([]);
    }),
    finalize(() => (store.state.admin.loading = false))
  )
}

export function getEpiTable(apiUrl, locations) {
  store.state.admin.loading = true;
  const parseDate = timeParse("%Y-%m-%d");
  // trigger no-cache behavior by adding timestamp to request
  const timestamp = new Date().getTime();
  const locationString = `("${locations.join('","')}")`;
  console.log(locationString)

  return from(axios.get(`${apiUrl}query?q=location_id:${locationString}&sort=-date&size=${locations.length}&fields=location_id,name,country_name,region_wb,date,confirmed_currentCases,confirmed_currentIncrease,confirmed_currentPctIncrease,dead_currentCases,dead_currentIncrease,dead_currentPctIncrease,recovered_currentCases,recovered_currentIncrease,recovered_currentPctIncrease,first_dead-first_confirmed,confirmed_currentToday,&timestamp=${timestamp}`, {
    headers: {
      'Content-Type': 'application/json'
    }
  })).pipe(
    pluck("data", "hits"),
    map(results => {
      // convert dates to javascript dates
      results.forEach(d => {
        d['date'] = parseDate(d.date);
      })
      console.log(results)
      return (results);

    }),
    catchError(e => {
      console.log("%c Error in getting case counts!", "color: red");
      console.log(e);
      return from([]);
    }),
    finalize(() => (store.state.admin.loading = false))
  )
}
