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

export function getDoubling(apiUrl, location_id) {
  store.state.admin.loading = true;
  const parseDate = timeParse("%Y-%m-%d");

  return from(axios.get(`${apiUrl}query?q=location_id:"${location_id}" AND -date:"2020-03-23"&size=1000&fields=id_text,name,admin0,admin1,date,confirmed,recovered,dead`)).pipe(
    pluck("data", "hits"),
    map(results => {
      // ensure results are sorted by date
      results.sort((a, b) => a.date - b.date);

      results.forEach((d) => {
        d["date_string"] = d.date;
        d["date"] = parseDate(d.date);
        d["logConfirmed"] = Math.log(d.confirmed);
      })
      console.log(results)

      const resultsLength = results.length;
      const fitLength = 5;
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
    const fit = linearRegression(sliced, d => +d.date / (24 * 3600 * 1000), d => d.logConfirmed);

    // one day previous to fit
    const firstDate = +sliced[0].date - 8.64e7;
    const lastDate = +maxDate + 8.64e7 * 5; // 5 days past the end
    fit["doublingTime"] = Math.log(2) / fit.slope;
    fit["x1"] = new Date(firstDate);
    // y-axis is a log 10 transform
    fit["y1"] = Math.exp(firstDate / (24 * 3600 * 1000) * fit.slope + fit.intercept);
    fit["x2"] = new Date(lastDate);
    fit["y2"] = Math.exp(lastDate / (24 * 3600 * 1000) * fit.slope + fit.intercept);
    console.log(fit)
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

export function getAllDoubling(apiUrl) {
  store.state.admin.loading = true;
  return getAllDoublingBatch(apiUrl).pipe(
    expand((data, _) => data.next ? getAllDoublingBatch(apiUrl, data.next) : EMPTY),
    pluck("results"),
    reduce((acc, data) => {
      return acc.concat(data);
    }, []),
    map((all_data) => {
      // last iteration returns undefined; filter out
      all_data = all_data.filter(d => d);

      return (all_data);
    }),
    catchError(e => {
      console.log("%c Error in getting case counts!", "color: red");
      console.log(e);
      return from([]);
    }),
    // finalize(() => (store.state.admin.loading = false))
  )
}

export function getAllDoublingBatch(apiUrl, scrollID = null) {
  console.log('batch')
  const parseDate = timeParse("%Y-%m-%d");

  let url = `${apiUrl}query?q=__all__&fields=id_text,name,admin0,admin1,date,confirmed,recovered,dead&fetch_all=true`;
  if (scrollID) {
    url = `${url}&scroll_id=${scrollID}`;
  }

  return from(axios.get(url)).pipe(
    tap(x => console.log(x)),
    pluck("data"),
    map(results => {
      // ensure results are sorted by date
      // results.sort((a, b) => a.date - b.date);

      results["hits"].forEach((d) => {
        d["date_string"] = d.date;
        d["date"] = parseDate(d.date);
        d["logConfirmed"] = Math.log10(d.confirmed);
      })
      return ({
        next: results["_scroll_id"],
        results: results["hits"]
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
