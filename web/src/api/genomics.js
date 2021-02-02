import axios from "axios";
import { from, forkJoin, BehaviorSubject } from "rxjs";
import { finalize, catchError, pluck, map, mergeMap } from "rxjs/operators";
import {
  timeParse,
  timeFormat, format
} from "d3";
import { rollingAverage, calcPrevalence } from "@/js/stats.js";
const parseDate = timeParse("%Y-%m-%d");
const formatPercent = format(".0%");

import store from "@/store";

// reminder: must be the raw verison of the file
const curatedFile = "https://raw.githubusercontent.com/andersen-lab/hCoV19-sitrep/master/curated_mutations.json";


export function getReportData(apiurl, locations, mutationVar, mutationString, locationType = "country") {
  store.state.admin.reportloading = true;

  return forkJoin([
    getTemporalPrevalence(apiurl, "Worldwide", mutationString, mutationVar, null),
    getCountryPrevalence(apiurl, mutationString, mutationVar),
    getCuratedMetadata(mutationString)
  ]).pipe(
    map(([longitudinal, byCountry, md]) => {
      return({ longitudinal: longitudinal, byCountry: byCountry, md: md })
    }),
    catchError(e => {
      console.log("%c Error in getting initial report data!", "color: red");
      console.log(e);
      return from([]);
    }),
    finalize(() => store.state.admin.reportloading = false)
  )
}

export function updateLocationData() {

}

export function getCountryPrevalence(apiurl, mutationString, mutationVar) {
  const url = `${apiurl}lineage-by-country-most-recent?${mutationVar}=${mutationString}`;
  return from(axios.get(url, {
    headers: {
      "Content-Type": "application/json"
    }
  })).pipe(
    pluck("data", "results"),
    map(results => {
      results.forEach(d => {
        d["name"] = d.country;
        d["proportion_formatted"] = formatPercent(d.proportion);
        d["dateTime"] = parseDate(d.date);
        d["location_id"] = d.country.replace(/\s/g, "");
      })
      return(results)
    }),
    catchError(e => {
      console.log("%c Error in getting recent prevalence data by country!", "color: red");
      console.log(e);
      return from([]);
    })
)
}

export function getTemporalPrevalence(apiurl, location, mutationString, mutationVar, indivCall = false, locationType = "country") {
  store.state.admin.reportloading = true;
  let url;
  if (location == "Worldwide") {
    url = `${apiurl}prevalence?${mutationVar}=${mutationString}`;
  } else {
    url = `${apiurl}prevalence-by-country?${mutationVar}=${mutationString}&${locationType}=${location}`;
  }

  return from(axios.get(url, {
    headers: {
      "Content-Type": "application/json"
    }
  })).pipe(
    pluck("data", "results"),
    map(results => {
      results.forEach(d => {
        d["dateTime"] = parseDate(d.date);
      })
      return(results)
    }),
    catchError(e => {
      console.log("%c Error in getting temporal data by location!", "color: red");
      console.log(e);
      return from([]);
    }),
    finalize(() => indivCall ? store.state.admin.reportloading = false : null)
  )
}

export function getCuratedMetadata(id) {
  return from(
    axios.get(curatedFile, {
      headers: {
        "Content-Type": "application/json"
      }
    })
  ).pipe(
    pluck("data"),
    map(results => {
      const curated = results.filter(d => d.mutation_name == id);
      if (curated.length === 1) {
        return (curated[0])
      } else {
        console.log("No reports or more than one report metadata found!")
      }
    }),
    // mergeMap(md => getLineageResources(apiUrl, md, 10, 1).pipe(
    //   map(resources => {
    //     resources["md"] = md;
    //     return(resources)
    //   })
    // )),
    catchError(e => {
      console.log("%c Error in getting curated data!", "color: red");
      console.log(e);
      return from([]);
    })
  )
}

export function getLineageResources(apiUrl, queryString, size, page, sort = "-date") {
  const fields = "@type, name, author, date, journalName"
  const timestamp = Math.round(new Date().getTime() / 36e5);


  return from(
    axios.get(`${apiUrl}query?q=${queryString}&sort=${sort}&size=${size}&from=${page}&fields=${fields}&timestamp=${timestamp}`, {
      headers: {
        "Content-Type": "application/json"
      }
    })
  ).pipe(
    pluck("data"),
    map(results => {
      const formatDate = timeFormat("%e %B %Y");

      results["hits"].forEach(d => {
        const parsedDate = parseDate(d.date)
        d["dateFormatted"] = formatDate(parsedDate);
      })

      return ({
        resources: results["hits"],
        total: results["total"]
      })
    }),
    catchError(e => {
      console.log("%c Error in getting resource metadata!", "color: red");
      console.log(e);
      return from([]);
    })
  )

}
