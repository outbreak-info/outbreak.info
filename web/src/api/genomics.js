import axios from "axios";
import {
  from,
  of ,
  forkJoin,
  BehaviorSubject
} from "rxjs";
import {
  finalize,
  catchError,
  pluck,
  map,
  mergeMap
} from "rxjs/operators";
import {
  timeParse,
  timeFormat,
  format
} from "d3";

const parseDate = timeParse("%Y-%m-%d");
const formatDate = timeFormat("%e %B %Y");
const formatPercent = format(".0%");

import store from "@/store";

function capitalize(value) {
  if (!value) return ''
  value = value.toString()
  return value != "of" ? value.charAt(0).toUpperCase() + value.slice(1) : value
}

function titleCase(value) {
  if (value) {
    const values = value.split(" ");
    return values.map(d => capitalize(d)).join(" ");
  }
}

// reminder: must be the raw verison of the file
const curatedFile = "https://raw.githubusercontent.com/andersen-lab/hCoV19-sitrep/master/curated_mutations.json";


export function getReportData(apiurl, locations, mutationVar, mutationString, location, locationType) {
  store.state.admin.reportloading = true;

  return forkJoin([
    getMostRecentSeq(apiurl, mutationString, mutationVar, null),
    getTemporalPrevalence(apiurl, location, locationType, mutationString, mutationVar, null),
    getWorldPrevalence(apiurl, mutationString, mutationVar),
    getLocationPrevalence(apiurl, mutationString, mutationVar, location, locationType),
    getCuratedMetadata(mutationString),
    getCharacteristicMutations(apiurl, mutationString)
  ]).pipe(
    map(([mostRecent, longitudinal, globalPrev, byCountry, md, mutations]) => {
      const characteristicMuts = md && md.mutations && md.mutations.length && md.mutations.flatMap(Object.keys).length ? md.mutations : mutations;

      return ({
        mostRecent: mostRecent,
        longitudinal: longitudinal,
        globalPrev: globalPrev,
        byCountry: byCountry,
        md: md,
        mutations: characteristicMuts
      })
    }),
    catchError(e => {
      console.log("%c Error in getting initial report data!", "color: red");
      console.log(e);
      return ( of ([]));
    }),
    finalize(() => store.state.admin.reportloading = false)
  )
}

export function updateLocationData(apiurl, mutationVar, mutationString, location, locationType) {
  store.state.admin.reportloading = true;

  return forkJoin([
    getTemporalPrevalence(apiurl, location, locationType, mutationString, mutationVar, null),
    getLocationPrevalence(apiurl, mutationString, mutationVar, location, locationType)
  ]).pipe(
    map(([longitudinal, byLocation]) => {
      return ({
        longitudinal: longitudinal,
        byCountry: byLocation
      })
    }),
    catchError(e => {
      console.log("%c Error in updating report location data!", "color: red");
      console.log(e);
      return ( of ([]));
    }),
    finalize(() => store.state.admin.reportloading = false)
  )
}

export function getCharacteristicMutations(apiurl, lineage, prevalenceThreshold = 0.97) {
  const url = `${apiurl}lineage-mutations?pangolin_lineage=${lineage}&frequency=${prevalenceThreshold}`;
  return from(axios.get(url, {
    headers: {
      "Content-Type": "application/json"
    }
  })).pipe(
    pluck("data", "results"),
    map(results => {
      results.forEach(d => {
        d["codon_num"] = +d.codon_num;
      })
      return (results)
    }),
    catchError(e => {
      console.log("%c Error in getting characteristic mutations!", "color: red");
      console.log(e);
      return ( of ([]));
    })
  )
}

export function getMostRecentSeq(apiurl, mutationString, mutationVar) {
  const url = `${apiurl}most-recent-collection-date`;
  return from(axios.get(url, {
    headers: {
      "Content-Type": "application/json"
    }
  })).pipe(
    pluck("data", "results"),
    map(results => {
      const filtered = results.filter(d => d.pangolin_lineage.toLowerCase() == mutationString.toLowerCase());
      let lineageRecent;
      if (filtered.length == 1) {
        lineageRecent = filtered[0];
        const dateTime = parseDate(lineageRecent.date)
        lineageRecent["dateFormatted"] = formatDate(dateTime)
      }
      return (lineageRecent)
    }),
    catchError(e => {
      console.log("%c Error in getting recent global prevalence data!", "color: red");
      console.log(e);
      return ( of ([]));
    })
  )
}

export function getWorldPrevalence(apiurl, mutationString, mutationVar) {
  const url = `${apiurl}global-prevalence?cumulative=true&${mutationVar}=${mutationString}`;
  return from(axios.get(url, {
    headers: {
      "Content-Type": "application/json"
    }
  })).pipe(
    pluck("data", "results"),
    map(results => {
      // results["name"] = "Worldwide";
      results["proportion_formatted"] = formatPercent(results.global_prevalence);
      results["lineage_count_formatted"] = format(",")(results.lineage_count);
      // results["proportion"] = results.global_prevalence;
      // results["cum_lineage_count"] = results.lineage_count;
      // results["location_id"] = "worldwide";
      return (results)
    }),
    catchError(e => {
      console.log("%c Error in getting recent global prevalence data!", "color: red");
      console.log(e);
      return ( of ([]));
    })
  )
}

export function getLocationPrevalence(apiurl, mutationString, mutationVar, location, locationType) {
  if (locationType != "division") {
    let url;
    url = location == "Worldwide" ?
      `${apiurl}lineage-by-country-most-recent?${mutationVar}=${mutationString}` :
      `${apiurl}lineage-by-division-most-recent?country=${location}&${mutationVar}=${mutationString}`;;
    return from(axios.get(url, {
      headers: {
        "Content-Type": "application/json"
      }
    })).pipe(
      pluck("data", "results"),
      map(results => {
        results.forEach(d => {
          d["name"] = titleCase(d.name);
          d["proportion_formatted"] = formatPercent(d.proportion);
          d["dateTime"] = parseDate(d.date);
          // fixes the Georgia (state) / Georgia (country) problem
          d["location_id"] = location == "Worldwide" ? `country_${d.name.replace(/\s/g, "")}` : d.name.replace(/\s/g, "");
        })
        return (results)
      }),
      catchError(e => {
        console.log("%c Error in getting recent prevalence data by country!", "color: red");
        console.log(e);
        return ( of ([]));
      })
    )
  } else {
    return ( of ([]))
  }
}

export function getTemporalPrevalence(apiurl, location, locationType, mutationString, mutationVar, indivCall = false) {
  store.state.admin.reportloading = true;
  let url;
  if (location == "Worldwide") {
    url = `${apiurl}global-prevalence?${mutationVar}=${mutationString}`;
  } else {
    url = `${apiurl}prevalence-by-location?${mutationVar}=${mutationString}&${locationType}=${location}`;
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
        d["name"] = titleCase(d.name);
      })
      return (results)
    }),
    catchError(e => {
      console.log("%c Error in getting temporal data by location!", "color: red");
      console.log(e);
      return of([]);
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
      return ( of ([]));
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
      return ( of ([]));
    })
  )

}


export function findCountry(apiUrl, queryString) {
  const url = `${apiUrl}country?name=*${queryString}*`

  return from(
    axios.get(url, {
      headers: {
        "Content-Type": "application/json"
      }
    })
  ).pipe(
    pluck("data", "results"),
    map(results => {
      results.forEach(d => {
        d.name = titleCase(d.name);
      })
      return (results)
    }),
    catchError(e => {
      console.log("%c Error in getting country names!", "color: red");
      console.log(e);
      return ( of ([]));
    })
  )
}

export function findDivision(apiUrl, queryString) {
  const url = `${apiUrl}division?name=*${queryString}*`

  return from(
    axios.get(url, {
      headers: {
        "Content-Type": "application/json"
      }
    })
  ).pipe(
    pluck("data", "results"),
    map(results => {
      results.forEach(d => {
        d.name = titleCase(d.name);
      })
      return (results)
    }),
    catchError(e => {
      console.log("%c Error in getting country names!", "color: red");
      console.log(e);
      return ( of ([]));
    })
  )
}

export function findPangolin(apiUrl, queryString) {
  const url = `${apiUrl}lineage?name=*${queryString}*`;

  return from(
    axios.get(url, {
      headers: {
        "Content-Type": "application/json"
      }
    })
  ).pipe(
    pluck("data", "results"),
    map(results => {
      results.forEach(d => {
        d.name = capitalize(d.name);
      })

      return (results)
    }),
    catchError(e => {
      console.log("%c Error in getting Pangolin lineage names!", "color: red");
      console.log(e);
      return ( of ([]));
    })
  )
}
