import {
  from,
  of ,
  forkJoin
} from "rxjs";
import axios from "axios";
import {
  tap,
  finalize,
  catchError,
  mergeMap,
  pluck,
  map
} from "rxjs/operators";
import {
  timeParse,
  timeFormat
} from "d3";

axios.interceptors.request.use(function(config) {
  // Pass GISAID param to API via headers
  // * BEFORE COMPLIATION, YOU NEED to run `export VUE_APP_API_ACCESS={key}`*
  config.headers.Authorization = `Bearer ${process.env.VUE_APP_API_ACCESS}`;
  return config;
}, function(error) {
  return Promise.reject(error);
});

const formatDateTime = timeFormat("%e %B %Y %I:%M %p");


export function getSourcesUpdated(genomicsurl, resourcesurl, epiurl) {
  return forkJoin([
    getDateUpdated(genomicsurl),
    getDateUpdated(resourcesurl),
    getDateUpdated(epiurl)
  ]).pipe(
    map(([genomics, resources, epi]) => {
      return({epi: epi, genomics: genomics, resources: resources})
    })
  )
}

function getDateUpdated(apiurl) {
  const url = `${apiurl}metadata`;
  return from(
    axios.get(url, {
      headers: {
        "Content-Type": "application/json"
      }
    })
  ).pipe(
    pluck("data", "build_date"),
    map(result => {
      const dateUpdated = cleanDateElapsed(result);
      return(dateUpdated)
    }),
    catchError(e => {
      console.log("%c Error in getting date updated!", "color: red");
      console.log(e);
      return ( of ([]));
    })
  )
}

function getResourcesDateUpdated(apiurl) {
  const url = `${apiurl}metadata`;
  return from(
    axios.get(url, {
      headers: {
        "Content-Type": "application/json"
      }
    })
  ).pipe(
    pluck("data", "src"),
    map(result => {
      console.log(result)
      const sources = Object.keys(result);
      let resultObj = {};

      sources.forEach(d => {
        const count = result[d]["stats"][d] ? result[d]["stats"][d].toLocaleString() : "unknown";

        resultObj[d] = {
          "count": count,
          "dateUpdated": cleanDate(result[d]["version"])
        };
        return(resultObj)
      })

      return(resultObj)
    }),
    catchError(e => {
      console.log("%c Error in getting resources date updated!", "color: red");
      console.log(e);
      return ( of ([]));
    })
  )
}

function cleanDate(result) {
  const today = new Date();
  let lastUpdated;
  const strictIsoParse = timeParse("%Y-%m-%d-%H:%M");
  const dateUpdated = strictIsoParse(result); // ensure the time is parsed as PDT

  const dateUpdatedStr = dateUpdated ? timeFormat("%d %B %Y")(dateUpdated): "unknown";

  return (dateUpdatedStr)
}

function cleanDateElapsed(result) {
  const today = new Date();
  let lastUpdated;
  const strictIsoParse = timeParse("%Y-%m-%dT%H:%M:%S.%f%Z");
  const dateUpdated = strictIsoParse(result); // ensure the time is parsed as PDT
  if (dateUpdated) {
    const updatedDiff = (today - dateUpdated) / (60 * 60 * 1000);

    if (updatedDiff < 1) {
      lastUpdated = `${Math.round(updatedDiff * 60)}m`;
    } else if (updatedDiff <= 24) {
      lastUpdated = `${Math.round(updatedDiff)}h`;
    } else {
      lastUpdated = `${Math.round(updatedDiff / 24)}d`;
    }
  }

  return (lastUpdated)
}
