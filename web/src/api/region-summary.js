import {
  from,
  forkJoin
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

import {
  getAll
} from "@/api/biothings.js";

import store from "@/store";

export function getStackedRegions(apiUrl) {
  store.state.admin.loading = true;
  const parseDate = timeParse("%Y-%m-%d");

  // trigger no-cache behavior by adding timestamp to request
  const timestamp = new Date().getTime();

  return from(axios.get(`${apiUrl}query?q=admin_level:"-1"&size=1000&fields=location_id, name,date,confirmed,recovered,dead&timestamp=${timestamp}`, {
    headers: {
      'Content-Type': 'application/json'
    }
  })).pipe(
    pluck("data", "hits"),
    map(results => {
      // nest by date
      const regionNest = nest()
        .key(d => d.date)
        .key(d => d.name)
        .rollup(values => {
          return ({
            confirmed: sum(values, d => d.confirmed),
            dead: sum(values, d => d.dead),
            recovered: sum(values, d => d.recovered)
          })
        })
        .entries(results);

      const nested = {};
      nested["confirmed"] = [];
      nested["dead"] = [];
      nested["recovered"] = [];

      regionNest.map(d => {
        const objC = {};
        const objD = {};
        const objR = {};
        objC["date"] = parseDate(d.key);
        objD["date"] = parseDate(d.key);
        objR["date"] = parseDate(d.key);

        d.values.forEach(value => {
          objC[value.key] = value.value.confirmed;
          objD[value.key] = value.value.dead;
          objR[value.key] = value.value.recovered;
        });

        nested["confirmed"].push(objC)
        nested["dead"].push(objD)
        nested["recovered"].push(objR)

      });
      nested["confirmed"].sort((a, b) => a.date - b.date);
      nested["dead"].sort((a, b) => a.date - b.date);
      nested["recovered"].sort((a, b) => a.date - b.date);
      return nested;
    }),
    catchError(e => {
      console.log("%c Error in getting region summaries!", "color: red");
      console.log(e);
      return from([]);
    }),
    finalize(() => (store.state.admin.loading = false))
  )
}
export function getCountryData(apiUrl, region, variable) {
  store.state.admin.loading = true;
  const parseDate = timeParse("%Y-%m-%d");

  // trigger no-cache behavior by adding timestamp to request
  const timestamp = new Date().getTime();

  return forkJoin([
    from(axios.get(`${apiUrl}query?q=admin_level:0 AND date:"2020-03-15" AND region_wb:"${encodeURIComponent(region)}"&size=1000&fields=location_id,name,${variable}_currentCases,${variable}_currentIncrease&timestamp=${timestamp}`)),
    getAll(apiUrl, `admin_level:0 AND region_wb:"${encodeURIComponent(region)}"&size=1000&fields=location_id,date,${variable}&timestamp=${timestamp}`)
  ]).pipe(
    map(([currentData, timeData]) => {
      // sort current data
      currentData["data"]["hits"].sort((a, b) => a[`${variable}_currentCases`] - b[`${variable}_currentCases`]);

      // clean up time data: parse all dates, nest.
      // convert dates to javascript dates
      timeData.forEach(d => {
        d['date'] = parseDate(d.date);
        delete d["_id"];
        delete d["_score"];
      })
      // ensure dates are sorted
      timeData.sort((a, b) => a.date - b.date);

      const sparks = nest()
        .key(d => d.location_id)
        .rollup(values => values)
        .entries(timeData);

        console.log(sparks)

      sparks.forEach(spark => {
        const idx = currentData["data"]["hits"].findIndex(d => d.location_id === spark.key);
        if (idx > -1) {
          currentData["data"]["hits"][idx]["data"] = spark.value;
        }
      })

      console.log(currentData["data"]["hits"])


      return (currentData["data"]["hits"])
    }),
    catchError(e => {
      console.log("%c Error in getting regional country counts!", "color: red");
      console.log(e);
      return from([]);
    }),
    finalize(() => (store.state.admin.loading = false))
  )
}
