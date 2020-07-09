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
    // return getAll(apiUrl, queryString)
    .pipe(
      map(([currDate, breaks, results]) => {
        results.forEach(d => {
          d.fill = breaks.scale(d[variable]);
        })
        return ({data: results, maxDate: currDate, colorScale: breaks.scale})
      }),
      catchError(e => {
        console.log("%c Error in getting comparison!", "color: red");
        console.log(e);
        return from([]);
      })
      // finalize(() => (store.state.admin.loading = false))
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
      return(today)
    }),
    catchError(e => {
      console.log("%c Error in getting current date!", "color: red");
      console.log(e);
      return from([]);
    })
  )
}

export function getJenksBreaks(apiUrl, queryString, variable, numColors = 11){
  const qString = `${queryString}&fields=${variable}`
  return from(
    axios.get(
      `${apiUrl}query?q=${qString}&aggs=${variable}&size=0&facet_size=1000`
    ))
    .pipe(
      pluck("data", "facets", variable, "terms"),
      map(results => {
        // console.log(results)
        var domain = jenks(results.map(d => d.term).filter(d => d), numColors);
        // console.log(domain)
        // USA 7/6: [-3924.7142857142862, -2373.714285714286, -836.714285714286, -213.85714285714283, 90, 356.57142857142867, 796.5714285714284, 1551.2857142857144, 2572.571428571429, 4119.571428571428, 5880.428571428572, 7526.428571428572]

        // color range
        var colorRange;
        // DIVERGING
        if (["confirmed_rolling_14days_ago_diff", "dead_rolling_14days_ago_diff"].includes(variable)) {
          // ensure that the diverging scale is centered at 0.
          const midpoint = domain.findIndex((d, i) => (d < 0 && domain[i + 1] > 0) || d === 0);

          var padLength = domain.length - 2 * midpoint - 2;
          padLength = padLength % 2 ? padLength + 1 : padLength; // ensure that the padding is an even number, so the limits all apply

          if (padLength < 0) {
            domain = domain.concat(Array(-1 * padLength).fill(domain.slice(-1)[0]));
          } else if (padLength > 0) {
            domain = Array(padLength).fill(domain[0]).concat(domain);
          }
          numColors = domain.length - 1;

          // calculate colors
          colorRange = range(0, 1.01, 1 / (numColors - 1)).map(d => interpolateRdYlBu(d)).reverse();
        } else {
          // SEQUENTIAL
          colorRange = range(0, 0.51, 0.5 / numColors).map(d => interpolateRdYlBu(d)).reverse();
        }

        const colorScale = scaleQuantile()
          .range(colorRange)
          .domain(domain);

        return ({breaks: domain, scale: colorScale})
      }),
      catchError(e => {
        console.log("%c Error in getting current data!", "color: red");
        console.log(e);
        return from([]);
      })
    )
}

export function getCurrentData(apiUrl, queryString, variable, sort, date) {
  const parseDate = timeParse("%Y-%m-%d");

  const fields = "date,location_id,name,state_name,country_iso3," + variable;

  // const qString = `(${queryString})&sort=${"-date"}&size=${size}&from=${page}&fields=${fields}`;
  const qString = `date:${date} AND (${queryString})&sort=-date,${sort}&fields=${fields}`;

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
