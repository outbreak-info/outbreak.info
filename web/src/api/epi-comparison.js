import {
  from,
  forkJoin,
  BehaviorSubject
} from "rxjs";
import axios from "axios";
import {
  catchError,
  pluck,
  map
} from "rxjs/operators";
import {
  timeParse,
  timeDay,
  offset,
  timeFormat,
  scaleQuantile,
  range
} from "d3";

import {
  // interpolateYlGnBu,
  // interpolateBrBG,
  // interpolatePRGn,
  // interpolatePiYG,
  interpolateRdYlBu
} from "d3-scale-chromatic";

import {
  getAll
} from "@/api/biothings.js";
import store from "@/store";

import {
  jenks
} from "@/js/jenks.js";

export function getComparisonData(apiUrl, location, adminLevel, variable, sort, date) {
  store.state.admin.dataloading = true;

  const queryString = location ? `${location} AND admin_level:("${adminLevel}")` : `admin_level:${adminLevel}`;

  return forkJoin([getCurrentDate(apiUrl), getJenksBreaks(apiUrl, queryString, variable), getCurrentData(apiUrl, queryString, variable, sort, date)])
    .pipe(
      map(([currDate, breaks, results]) => {
        results.forEach(d => {
          d.fill = breaks.scale(d[variable]);
        })
        return ({
          data: results,
          maxDate: currDate,
          colorScale: breaks.scale
        })
      }),
      catchError(e => {
        console.log("%c Error in getting comparison!", "color: red");
        console.log(e);
        return from([]);
      })
    )

}

function getCurrentDate(apiUrl) {
  const parseDate = timeParse("%Y-%m-%d");
  return from(
    axios.get(
      `${apiUrl}query?q=mostRecent:true&size=1&sort=-date&fields="date"`
    )
  ).pipe(
    pluck("data", "hits"),
    map(results => {
      const today = parseDate(results[0].date)
      return (today)
    }),
    catchError(e => {
      console.log("%c Error in getting current date!", "color: red");
      console.log(e);
      return from([]);
    })
  )
}

export function getJenksBreaks(apiUrl, queryString, variable) {
  const qString = `${queryString} AND mostRecent:true&fields=${variable}_breaks`;
  return from(
      axios.get(
        `${apiUrl}query?q=${qString}&size=1`
      ))
    .pipe(
      pluck("data", "hits"),
      map(results => {
        const domain = results[0][`${variable}_breaks`];
        // Breaks calculated in R, and centered around 0.
        const numColors = domain.length - 1;
        // color range
        var colorRange;
        // DIVERGING
        if (variable.includes("diff")) {
          // calculate colors
          colorRange = range(0, 1.01, 1 / (numColors - 1)).map(d => interpolateRdYlBu(d)).reverse();
        } else {
          // SEQUENTIAL
          colorRange = range(0, 0.51, 0.5 / numColors).map(d => interpolateRdYlBu(d)).reverse();
        }

        const colorScale = scaleQuantile()
          .range(colorRange)
          .domain(domain);

        return ({
          breaks: domain,
          scale: colorScale
        })
      }),
      catchError(e => {
        console.log("%c Error in getting current breaks!", "color: red");
        console.log(e);
        return from([]);
      })
    )
}

export function getCurrentData(apiUrl, queryString, variable, sort, date) {
  const parseDate = timeParse("%Y-%m-%d");

  const fields = "date,location_id,name,state_name,country_iso3," + variable;

  // const qString = `(${queryString})&sort=${"-date"}&size=${size}&from=${page}&fields=${fields}`;
  const qString = date ? `date:${date} AND (${queryString})&sort=-date,${sort}&fields=${fields}` : `mostRecent:true AND (${queryString})&sort=-date,${sort}&fields=${fields}`;

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
