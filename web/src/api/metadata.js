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
    getLastUpdated(genomicsurl),
    getLastUpdated(resourcesurl),
    getLastUpdated(epiurl)
  ]).pipe(
    map(([genomics, resources, epi]) => {
      return ({
        epi: epi,
        genomics: genomics,
        resources: resources
      })
    })
  )
}

export function getIndivSourcesUpdated(genomicsurl, resourcesurl, epiurl) {
  return forkJoin([
    getDateUpdated(genomicsurl, "Sequences"),
    getResourcesDateUpdated(resourcesurl),
    getDateUpdated(epiurl)
  ]).pipe(
    map(([genomics, resources, epi]) => {
      return ({
        epi: {
          epi: epi
        },
        genomics: {
          genomics: genomics
        },
        resources: resources
      })
    })
  )
}

function getDateUpdated(apiurl, label = "Records") {
  const url = `${apiurl}metadata`;
  return from(
    axios.get(url, {
      headers: {
        "Content-Type": "application/json"
      }
    })
  ).pipe(
    pluck("data"),
    map(result => {
      const dateUpdated = cleanDate(result.build_date, "%Y-%m-%dT%H:%M:%S.%f%Z");
      const count = `${result.stats.total.toLocaleString()} ${label}`;
      return ({
        count: count,
        dateUpdated: dateUpdated
      })
    }),
    catchError(e => {
      console.log("%c Error in getting date updated!", "color: red");
      console.log(e);
      return ( of ([]));
    })
  )
}

function getLastUpdated(apiurl) {
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
      return (dateUpdated)
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
      const sources = Object.keys(result);
      let resultObj = {};

      sources.forEach(d => {
        let count;

        switch (d) {
          case "biorxiv":
            count = result[d]["stats"][d] ? `${result[d]["stats"][d].toLocaleString()} Records<sup>*</sup> (combined)` : null;
            break;
          case "zenodo":
            count = result[d]["stats"][d] ? `${result[d]["stats"][d].toLocaleString()} Records<sup>*</sup> (combined)` : null;
            break;
          case "clinical_trials":
            count = result[d]["stats"]["clinicaltrials"] ? `${result[d]["stats"]["clinicaltrials"].toLocaleString()} Records` : null;
            break;
          case "covid_who_clinical_trials":
            count = result[d]["stats"]["clinicaltrialswho"] ? `${result[d]["stats"]["clinicaltrialswho"].toLocaleString()} Records` : null;
            break;
          default:
            count = result[d]["stats"][d] ? `${result[d]["stats"][d].toLocaleString()} Records` : null;
        }

        resultObj[d] = {
          "count": count,
          "dateUpdated": cleanDate(result[d]["version"])
        };
        return (resultObj)
      })

      return (resultObj)
    }),
    catchError(e => {
      console.log("%c Error in getting resources date updated!", "color: red");
      console.log(e);
      return ( of ([]));
    })
  )
}

function cleanDate(result, dateFormat = "%Y-%m-%d-%H:%M") {
  let dateUpdated = timeParse(dateFormat)(result); // ensure the time is parsed as PDT
  if(!dateUpdated) {
    // check because outbreak/NDE tag dates separately
    dateUpdated = timeParse("%Y-%m-%dT%H:%M:%S%Z")(result);
  }

  const dateUpdatedStr = dateUpdated ? timeFormat("%d %b %Y")(dateUpdated) : null;

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
