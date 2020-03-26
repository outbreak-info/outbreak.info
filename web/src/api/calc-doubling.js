import {
  from,
  EMPTY
} from "rxjs";
import axios from "axios";
import {
  tap,
  finalize,
  catchError,
  pluck,
  map,
  expand,reduce
} from "rxjs/operators";
import {
  nest,
  timeParse,
  max,
  sum
} from "d3";
import {
  linearRegression
} from "datalib";
import store from "@/store";

import { getAll } from "@/api/biothings.js";

export function getDoubling(apiUrl, location_id, variable="confirmed", fitLength = 5) {
  store.state.admin.loading = true;
  const parseDate = timeParse("%Y-%m-%d");
  const timestamp = new Date().getTime()

  return from(axios.get(`${apiUrl}query?q=location_id:"${location_id}"&size=1000&fields=location_id,name,admin0,admin1,date,${variable}&timestamp=${timestamp}`)).pipe(
    pluck("data", "hits"),
    map(results => {
      // ensure results are sorted by date
      results.sort((a, b) => a.date - b.date);

      results.forEach((d) => {
        d["date_string"] = d.date;
        d["date"] = parseDate(d.date);
        d["logCases"] = Math.log(d[variable]);
      })

      const resultsLength = results.length;
      const maxDate = results.sort((a, b) => a.date - b.date).slice(-1)[0].date;

      const fitLast5 = fitExponential(results, resultsLength - fitLength, resultsLength, maxDate);
      const fitPenultimate5 = fitExponential(results, resultsLength - fitLength * 2, resultsLength - fitLength, maxDate);

      return ({
        data: results,
        fit1: fitPenultimate5,
        fit2: fitLast5
      })
    }),
    catchError(e => {
      console.log("%c Error in getting case counts!", "color: red");
      console.log(e);
      return from([]);
    }),
    // finalize(() => (store.state.admin.loading = false))
  )
  // axios.get(apiUrl, { query: {admin0: location  } }).then(d => {console.log(d )})
}

export function fitExponential(data, minIdx, maxIdx, maxDate) {
  data.sort((a, b) => a.date - b.date);

  data.forEach((d, i) => {
    d["idx"] = i
  })

  let sliced = data.slice(minIdx, maxIdx);
  // console.log(sliced.map((d) => {return({date: d.date_string, i:d.idx})})
  if (sliced.length > 0) {
    const fit = linearRegression(sliced, d => +d.date / (24 * 3600 * 1000), d => d.logCases);

    // one day previous to fit
    const firstDate = +sliced[0].date - 8.64e7;
    const lastDate = +maxDate + 8.64e7 * 5; // 5 days past the end
    fit["doublingTime"] = Math.log(2) / fit.slope;
    fit["x1"] = new Date(firstDate);
    // y-axis is a log 10 transform
    fit["y1"] = Math.exp(firstDate / (24 * 3600 * 1000) * fit.slope + fit.intercept);
    fit["x2"] = new Date(lastDate);
    fit["y2"] = Math.exp(lastDate / (24 * 3600 * 1000) * fit.slope + fit.intercept);
    fit["xstart"] = sliced[0].date;
    fit["xend"] = sliced.slice(-1)[0].date;
    fit["minIdx"] = minIdx;
    fit["maxIdx"] = maxIdx;
    // console.log(fit)
    return (fit)
  } else {
    return ({
      doublingTime: null,
      slope: null,
      R: null,
      x1: null,
      x2: null,
      y1: null,
      y2: null
    })
  }

}

export function getAllDoubling(apiUrl, variable, fitLength=5) {
  store.state.admin.loading = true;
  const timestamp = new Date().getTime();
  const parseDate = timeParse("%Y-%m-%d");
  const url = `${apiUrl}query?q=-date:"2020-03-23"&size=1000&fields=location_id,name,admin0,admin1,date,${variable}&timestamp=${timestamp}`;

  return getAll(url).pipe(
    map((results) => {
      results.sort((a, b) => a.date - b.date);

      results.forEach((d) => {
        d["date_string"] = d.date;
        d["date"] = parseDate(d.date);
        d["logCases"] = Math.log(d[variable]);
      })

      const nested = nest()
      .key(d => d.location_id)
      .rollup(values => {
        const resultsLength = values.length;
        const maxDate = values.sort((a, b) => a.date - b.date).slice(-1)[0].date;

        return({
          data: values,
          fit1: fitExponential(values, resultsLength - fitLength, resultsLength, maxDate),
          fit2: fitExponential(values, resultsLength - fitLength * 2, resultsLength - fitLength, maxDate)
        })
      })
      .entries(results)

      console.log(nested)

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
