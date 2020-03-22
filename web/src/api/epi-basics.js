import {
  from, forkJoin
} from "rxjs";
import axios from "axios";
import {
  tap,
  finalize,
  catchError,
  mergeMap,
  pluck,
  map,
} from "rxjs/operators";
import {
  nest,
  timeParse,
  timeFormat,
  sum
} from "d3";

import { getSparklineTraces } from "@/api/epi-traces.js";

import store from "@/store";

export function getLocations(apiUrl) {
  store.state.admin.loading = true;
  const timestamp = new Date().getTime();

  return from(axios.get(`${apiUrl}query?q=date:"2020-02-01"&fields=location_id,name,country_name,region_wb,admin_level&size=1000&timestamp=${timestamp}`)).pipe(
    pluck("data", "hits"),
    tap(results => {
      let places = results.map(d => {
        return ({
          label: d.admin_level == 1 ? `${d.name}, ${d.country_name}` : d.name,
          id: d.location_id,
          admin_level: d.admin_level
        })
      });

      // Add in groups of Admin 1's, Admin 0's
      const regions = nest()
        .key(d => d.region_wb)
        .rollup(values => values.map(d => d.location_id).join(";"))
        .entries(results.filter(d => d.admin_level === 0));

      regions.forEach(d => {
        d["label"] = `${d.key} (all countries)`;
        d["id"] = d.value;
        d["admin_level"] = -0.5;
        delete d.key;
        delete d.value;
      })
      const countries = nest()
        .key(d => d.country_name)
        .rollup(values => values.map(d => d.location_id).join(";"))
        .entries(results.filter(d => d.admin_level === 1));

      countries.forEach(d => {
        d["label"] = `${d.key} (all states/provinces)`;
        d["id"] = d.value;
        d["admin_level"] = 0.5;
        delete d.key;
        delete d.value;
      })

      places = places.concat(regions).concat(countries);
      places.sort((a, b) => a.admin_level < b.admin_level ? -1 : 1);
      store.state.epidata.allPlaces = places;
      return (places)
    }),
    catchError(e => {
      console.log("%c Error in getting locations!", "color: red");
      console.log(e);
      return from([]);
    }),
    finalize(() => (store.state.admin.loading = false))
  )
}

export function getMostCases(apiUrl, num2Return = 5) {
  store.state.admin.loading = true;
  const timestamp = new Date().getTime();

  return from(axios.get(`${apiUrl}query?q=date:"2020-02-01" AND admin_level:0&fields=location_id,name&sort=-confirmed_currentCases&size=${num2Return}&timestamp=${timestamp}`)).pipe(
    pluck("data", "hits"),
    tap(results => {
      store.state.epidata.mostCases = results;
      return (results)
    }),
    catchError(e => {
      console.log("%c Error in getting highest case counts!", "color: red");
      console.log(e);
      return from([]);
    }),
    finalize(() => (store.state.admin.loading = false))
  )
}

export function getSummary(apiUrl, caseThreshold) {
  store.state.admin.loading = true;
  return forkJoin([getTotals(apiUrl), countCountries(apiUrl), getFirstCases(apiUrl), getCasesAboveThresh(apiUrl, caseThreshold)]).pipe(
    map(([totals, numCountries, firstCases, highCases]) => {
      totals['numCountries'] = numCountries;
      totals['firstCases'] = firstCases;
      totals['aboveThreshold'] = highCases;
      return (totals)
    }),
    catchError(e => {
      console.log("%c Error in getting summary!", "color: red");
      console.log(e);
      return from([]);
    }),
    finalize(() => (store.state.admin.loading = false))
  )
}

export function getTotals(apiUrl) {
  const timestamp = new Date().getTime();

  return from(axios.get(`${apiUrl}query?q=date:"2020-02-01" AND admin_level:"-1"&fields=confirmed_currentCases,dead_currentCases&sort=-confirmed_currentCases&size=100&timestamp=${timestamp}`)).pipe(
    pluck("data", "hits"),
    map(results => {
      const totals = {confirmed: sum(results, d => d.confirmed_currentCases).toLocaleString(), dead: sum(results, d => d.dead_currentCases).toLocaleString()};
      return (totals)
    }),
    catchError(e => {
      console.log("%c Error in getting totals!", "color: red");
      console.log(e);
      return from([]);
    })
  )
}

export function countCountries(apiUrl) {
  const timestamp = new Date().getTime();

  return from(axios.get(`${apiUrl}query?q=date:"2020-02-01" AND admin_level:0&size=0&facet_size=300&facets=name&timestamp=${timestamp}`)).pipe(
    pluck("data", "facets", "name", "terms"),
    map(results => {
      return (results.length)
    }),
    catchError(e => {
      console.log("%c Error in getting number of countries!", "color: red");
      console.log(e);
      return from([]);
    })
  )
}

export function getFirstCases(apiUrl) {
  const timestamp = new Date().getTime();

  return from(axios.get(`${apiUrl}query?q=date:"2020-02-01"%20AND%20admin_level:0%20AND%20confirmed_newToday:true&size=300&fields=name,location_id&timestamp=${timestamp}`)).pipe(
    pluck("data", "hits"),
    map(results => {
      const summary = {};
      results.sort((a,b) => a.name < b.name ? -1 : 1);

      summary["count"] = results.length;
      summary["names"] = results.map(d => d.name).join(", ");
      summary["link"] = results.map(d => d.location_id).join(";");
      return (summary)
    }),
    catchError(e => {
      console.log("%c Error in getting cfirst cases!", "color: red");
      console.log(e);
      return from([]);
    })
  )
}

export function getCasesAboveThresh(apiUrl, threshold) {
  const timestamp = new Date().getTime();

  return from(axios.get(`${apiUrl}query?q=date:"2020-02-01"%20AND%20admin_level:0%20AND%20confirmed_currentIncrease:[${threshold} TO *]&size=300&fields=name,location_id&timestamp=${timestamp}`)).pipe(
    pluck("data", "hits"),
    map(results => {
      const summary = {};
      results.sort((a,b) => a.name < b.name ? -1 : 1);

      summary["count"] = results.length;
      summary["names"] = results.map(d => d.name).join(", ");
      summary["link"] = results.map(d => d.location_id).join(";");
      return (summary)
    }),
    catchError(e => {
      console.log("%c Error in getting case counts!", "color: red");
      console.log(e);
      return from([]);
    })
  )
}

export function getDateUpdate(apiUrl) {
  store.state.admin.loading = true;
  const timestamp = new Date().getTime();

  return from(axios.get(`${apiUrl}metadata&timestamp=${timestamp}`)).pipe(
    // pluck("data", "hits"),
    tap(results => {

      return (results)
    }),
    catchError(e => {
      console.log("%c Error in date updated!", "color: red");
      console.log(e);
      return from([]);
    }),
    finalize(() => (store.state.admin.loading = false))
  )
}



export function getGlanceSummary(apiUrl, locations) {
  store.state.admin.loading = true;
  const formatDate = timeFormat("%e %B %Y");
  const parseDate = timeParse("%Y-%m-%d");
  const timestamp = new Date().getTime();
  const location_string = locations && locations.length ? ` AND location_id:("${locations.join('","')}")` : `AND admin_level:[0 TO *]&sort=-confirmed_currentIncrease`;
  const num2Return = locations && locations.length ? locations.length : 3;

  return from(axios.get(`${apiUrl}query?q=date:"2020-02-01"${location_string}&fields=location_id,name,confirmed_currentCases,confirmed_currentIncrease,confirmed_currentPctIncrease,confirmed_currentToday,dead_currentCases,dead_currentIncrease,dead_currentPctIncrease&size=${num2Return}&timestamp=${timestamp}`)).pipe(
    pluck("data", "hits"),
    mergeMap(summaryData => getSparklineTraces(apiUrl, summaryData.map(d => d.location_id), "confirmed,dead,confirmed_numIncrease").pipe(
      map(sparks => {
        sparks.forEach(spark => {
          const idx = summaryData.findIndex(d => d.location_id === spark.key);
          if (idx > -1) {
            summaryData[idx]["longitudinal"] = spark.value;
          }
        })

        summaryData.forEach(d => {
          d["confirmed_currentToday"] = formatDate(parseDate(d["confirmed_currentToday"]));
        })
        return(summaryData)
      })
    )),
    catchError(e => {
      console.log("%c Error in getting highest case counts!", "color: red");
      console.log(e);
      return from([]);
    }),
    finalize(() => (store.state.admin.loading = false))
  )
}
