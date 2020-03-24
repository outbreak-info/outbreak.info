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
  expand,
  reduce
} from "rxjs/operators";
import {
  nest,
  timeParse,
  timeFormat,
  format,
  isoParse,
  utcParse,
  max,
  sum
} from "d3";
import {
  linearRegression
} from "datalib";
import store from "@/store";

export function getDateUpdated(apiUrl) {
  const today = new Date();
  const timestamp = today.getTime();
  const url = `${apiUrl}metadata`;
  return from(axios.get(url)).pipe(

    pluck("data", "build_date"),
    map(result => {
      const strictIsoParse = utcParse("%Y-%m-%dT%H:%M:%S.%f");
      const dateUpdated = strictIsoParse(result);
      let lastUpdated = null;
      if (dateUpdated) {
        const updatedDiff = (today - dateUpdated) / (60 * 60 * 1000);

        if (updatedDiff < 1) {
          lastUpdated = `${Math.round(updatedDiff * 60)}m`;
        } else if (updatedDiff <= 24) {
          lastUpdated = `${Math.round(updatedDiff)}h`;
        } else {
          lastUpdated = `${Math.round(updatedDiff/24)}d`
        }
      }
      return lastUpdated;
    }),
    catchError(e => {
      console.log("%c Error in getting case counts!", "color: red");
      console.log(e);
      return from([]);
    })
  )
}

export function getCurrentDate(apiUrl) {
  const formatDate = timeFormat("%e %B %Y");
  const parseDate = timeParse("%Y-%m-%d");
  const timestamp = new Date().getTime();
  const url = `${apiUrl}query?q=__all__&sort=-date&size=1&fields=date&timestamp=${timestamp}`;
  return from(axios.get(url)).pipe(
    pluck("data", "hits"),
    map(result => {
      const dateUpdated = parseDate(result[0].date);
      return formatDate(dateUpdated);
    }),
    catchError(e => {
      console.log("%c Error in getting case counts!", "color: red");
      console.log(e);
      return from([]);
    })
  )
}

export function getAll(apiUrl, queryString) {
  store.state.admin.loading = true;
  return getOne(apiUrl, queryString).pipe(
    expand((data, _) => data.next ? getOne(apiUrl, queryString, data.next) : EMPTY),
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
      console.log("%c Error in fetching all!", "color: red");
      console.log(e);
      return from([]);
    }),
    // finalize(() => (store.state.admin.loading = false))
  )
}


export function getOne(apiUrl, queryString, scrollID = null) {
  // trigger no-cache behavior by adding timestamp to request
  const timestamp = new Date().getTime();

  let url = `${apiUrl}query?q=${queryString}&fetch_all=true&timestamp=${timestamp}`;
  if (scrollID) {
    url = `${url}&scroll_id=${scrollID}`;
  }

  return from(axios.get(url)).pipe(
    pluck("data"),
    map(results => {
      return ({
        next: results["_scroll_id"],
        results: results["hits"]
      })
    }),
    catchError(e => {
      console.log("%c Error in fetching one!", "color: red");
      console.log(e);
      return from([]);
    }),
    // finalize(() => (store.state.admin.loading = false))
  )
}
