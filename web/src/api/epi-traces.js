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
  sum, format
} from "d3";


export const epiDataSubject = new BehaviorSubject([]);
export const epiDataState$ = epiDataSubject.asObservable();

export const epiTableSubject = new BehaviorSubject({data: [], total: 0});
export const epiTableState$ = epiTableSubject.asObservable();

import store from "@/store";

export function getEpiData(apiUrl, locations, sort, page, size) {
  store.state.admin.loading = true;

  // sort by date so the numbers appear in the right order.

  return (forkJoin([getEpiTraces(apiUrl, locations), getEpiTable(apiUrl, locations, sort, page, size)])).pipe(
    // map(results => {
    //   return (results);
    // }),
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

  // sort by date so the numbers appear in the right order.
  return from(axios.get(`${apiUrl}query?q=location_id:${locationString}&sort=date&size=1000&fields=location_id,name,country_name,date,confirmed,confirmed,dead,confirmed_currentCases,dead_currentCases,recovered_currentCases,_id&timestamp=${timestamp}`, {
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
      epiDataSubject.next(nested)
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

export function getEpiTable(apiUrl, locations, sort, size, page) {
  store.state.admin.loading = true;
  const parseDate = timeParse("%Y-%m-%d");
  // trigger no-cache behavior by adding timestamp to request
  const timestamp = new Date().getTime();
  const locationString = `("${locations.join('","')}")`;

  return from(axios.get(`${apiUrl}query?q=location_id:${locationString} AND date:"2020-02-01"&sort=${sort}&size=${size}&from=${page}&fields=location_id,admin_level,name,country_name,region_wb,date,confirmed_currentCases,confirmed_currentIncrease,confirmed_currentPctIncrease,dead_currentCases,dead_currentIncrease,dead_currentPctIncrease,recovered_currentCases,recovered_currentIncrease,recovered_currentPctIncrease,first_dead-first_confirmed,confirmed_currentToday,population&timestamp=${timestamp}`, {
    headers: {
      'Content-Type': 'application/json'
    }
  })).pipe(
    tap(x => console.log(x)),
    pluck("data"),
    map(results => {
      // convert dates to javascript dates, format things for the table
      results["hits"].forEach(d => {
        d['date'] = parseDate(d.date);
        d['country_name'] = d.admin_level === 0 ? d.name : d.country_name;
        d['region_wb'] = d.admin_level === -1 ? d.name : d.region_wb;
        d["confirmed_cases"] = d.confirmed_currentCases.toLocaleString();
        d["confirmed_increase"] = d.confirmed_currentIncrease.toLocaleString();
        d["confirmed_pctIncrease"] = formatPercent(d.confirmed_currentPctIncrease);
        d["confirmed_percapita"] = d.population ?  (d.confirmed_currentCases ? `1 in ${Math.round(d.population / d.confirmed_currentCases).toLocaleString()}` : "0") : null;

        d["dead_cases"] = d.dead_currentCases.toLocaleString();
        d["dead_increase"] = d.dead_currentIncrease.toLocaleString();
        d["dead_pctIncrease"] = formatPercent(d.dead_currentPctIncrease);
        d["dead_percapita"] = d.population ?  (d.dead_currentCases ? `1 in ${Math.round(d.population / d.dead_currentCases).toLocaleString()}` : "0") : null;


        d["recovered_cases"] = d.recovered_currentCases.toLocaleString();
        d["recovered_increase"] = d.recovered_currentIncrease.toLocaleString();
        d["recovered_pctIncrease"] = formatPercent(d.recovered_currentPctIncrease);
        d["recovered_percapita"] = d.population ?  (d.recovered_currentCases ? `1 in ${Math.round(d.population / d.recovered_currentCases).toLocaleString()}` : "0") : null;
      })
      console.log(results)
      epiTableSubject.next({data: results["hits"], total: results["total"]})
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

const formatPercent = function(pct) {
  if (!pct) {
    return "none";
  }

  if (pct < 0) {
    return "case count corrected";
  }

  if (pct < 0.005) {
    return "< 1%";
  }

  if (!isFinite(pct)) {
    return "* first reported case *";
  }

  return format(".0%")(pct);
}
