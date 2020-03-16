import {
  from
} from "rxjs";
import axios from "axios";
import {
  tap,
  finalize,
  catchError,
  pluck,
  map
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

export function getDoubling(apiUrl, location) {
  store.state.admin.loading = true;
  const parseDate = timeParse("%Y-%m-%d");

  return from(axios.get("http://pending.biothings.io/covid19/query?q=admin0:%22Spain%22&size=1000&fields=id_text,admin0,admin1,date,confirmed,recovered,deaths")).pipe(
    tap(x => console.log(x)),
    pluck("data", "hits"),
    map(results => {
      // ensure results are sorted by date
      results.sort((a, b) => a.date - b.date);

      results.forEach((d, i) => {
        d["date_string"] = d.date;
        d["date"] = parseDate(d.date);
        d["logConfirmed"] = Math.log10(d.confirmed);
      })
      console.log(results)

      let last5 = results.slice(-5);

      const resultsLength = results.length;
      const fitLength = 5;

      console.log(fitExponential(results, 33,39));
      const fitLast5 = fitExponential(results, resultsLength - fitLength, resultsLength);
      const fitPenultimate5 = fitExponential(results,  resultsLength - fitLength*2, resultsLength - fitLength);

      console.log(linearRegression(last5, d => d.idx, d => d.logConfirmed));
      const vega = linearRegression([{
        x: 43,
        y: 8.63
      }, {
        x: 44,
        y: 8.71
      }, {
        x: 45,
        y: 8.79
      }, {
        x: 46,
        y: 8.86
      }, {
        x: 47,
        y: 8.90
      }], d => d.x, d => d.y)
      console.log(vega)


      const nested = nest()
        .key(d => d.admin0)
        .rollup(values => values)
        .entries(results);



      return ({
        data: results,
        fit: fitLast5
      })
    }),
    catchError(e => {
      console.log("%c Error in getting case counts!", "color: red");
      console.log(e);
      return from([]);
    }),
    finalize(() => (store.state.admin.loading = false))
  )
  // axios.get(apiUrl, { query: {admin0: location  } }).then(d => {console.log(d )})
}

export function fitExponential(data, minIdx, maxIdx) {
  const dx = 5;
  console.log(`${minIdx}:${maxIdx}`)
  data.sort((a, b) => a.date - b.date);

  data.forEach((d,i) => {d["idx"] = i})

  let sliced = data.slice(minIdx, maxIdx);
  console.log(sliced)
  // console.log(sliced.map((d) => {return({date: d.date_string, i:d.idx})})

  const fit = linearRegression(sliced, d => d.idx, d => d.logConfirmed);
  fit["doublingTime"] = Math.log(2) / fit.slope;
  fit["y1"] = Math.pow(10, (minIdx - dx) * fit.slope + fit.intercept);
  fit["y2"] = Math.pow(10, 52 * fit.slope + fit.intercept);
  console.log(fit)
  return (fit)

}
