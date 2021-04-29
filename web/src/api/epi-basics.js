import {
  from,
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
  nest,
  timeParse,
  timeFormat,
  sum,
  scaleThreshold
} from "d3";

import {
  schemeYlGnBu
} from "d3-scale-chromatic";
import {
  getSparklineTraces
} from "@/api/epi-traces.js";

import {
  getLocationTable
} from "@/api/genomics.js";

import {
  getAll
} from "@/api/biothings.js";

import CURATED from "@/assets/genomics/curated_mutations.json";

import store from "@/store";

export function getLocations(apiUrl) {
  store.state.admin.loading = true;

  if (store.state.geo.allPlaces.length == 0) {
    return getAll(
      apiUrl,
      `mostRecent:true&fields=location_id,name,country_name,state_name,wb_region,admin_level`
    ).pipe(
      map(results => {
        let places = results.map(d => {
          return {
            label: getLabel(d),
            id: d.location_id,
            admin_level: d.admin_level
          };
        });

        // Add in groups of Admin 1's, Admin 0's
        const regions = nest()
          .key(d => d.wb_region)
          .rollup(values => values.map(d => d.location_id).join(";"))
          .entries(results.filter(d => d.admin_level === 0));

        regions.forEach(d => {
          d["label"] = `${d.key} (all countries)`;
          d["id"] = d.value;
          d["admin_level"] = -0.5;
          delete d.key;
          delete d.value;
        });
        const countries = nest()
          .key(d => d.country_name)
          .rollup(values => values.map(d => d.location_id).join(";"))
          .entries(results.filter(d => d.admin_level === 1));

        countries.forEach(d => {
          d["label"] = `${d.key} (all states/provinces)`;
          d["id"] = d.value;
          d["admin_level"] = 0.5;
          delete d.key;
          delete d.value;
        });

        places = places.concat(regions).concat(countries);
        places.sort((a, b) => (a.admin_level < b.admin_level ? -1 : 1));
        store.state.geo.allPlaces = places;
        return places;
      }),
      catchError(e => {
        console.log("%c Error in getting locations!", "color: red");
        console.log(e);
        return from([]);
      }),
      finalize(() => (store.state.admin.loading = false))
    );
  } else {
    store.state.admin.loading = false;
    return (from(store.state.geo.allPlaces))
  }
}

function getLabel(entry) {
  if (entry.admin_level === 0) {
    return entry.name;
  } else if (entry.admin_level === 1) {
    return entry.country_name == "United States of America" ?
      `${entry.name} State, USA` :
      `${entry.name} Province, ${entry.country_name}`;
  } else if (String(entry.admin_level) == "1.7") {
    return `${entry.name}`;
  } else if (String(entry.admin_level) == "1.5") {
    return `${entry.name} Metropolitan Area`;
  } else if (String(entry.admin_level) == "2") {
    return `${entry.name}, ${entry.state_name}`;
  }
  return entry.name;
}

export function getMostCases(apiUrl, num2Return = 5) {
  store.state.admin.loading = true;
  const timestamp = Math.round(new Date().getTime() / 36e5);

  return from(
    axios.get(
      `${apiUrl}query?q=mostRecent:true AND admin_level:0&fields=location_id,name&sort=-confirmed&size=${num2Return}&timestamp=${timestamp}`
    )
  ).pipe(
    pluck("data", "hits"),
    tap(results => {
      store.state.epidata.mostCases = results;
      return results;
    }),
    catchError(e => {
      console.log("%c Error in getting highest case counts!", "color: red");
      console.log(e);
      return from([]);
    }),
    finalize(() => (store.state.admin.loading = false))
  );
}

export function getSummary(apiUrl, caseThreshold) {
  store.state.admin.loading = true;
  return forkJoin([
    getTotals(apiUrl),
    countCountries(apiUrl),
    getFirstCases(apiUrl),
    getCasesAboveThresh(apiUrl, caseThreshold)
  ]).pipe(
    map(([totals, numCountries, firstCases, highCases]) => {
      totals["numCountries"] = numCountries;
      totals["firstCases"] = firstCases;
      totals["aboveThreshold"] = highCases;
      return totals;
    }),
    catchError(e => {
      console.log("%c Error in getting summary!", "color: red");
      console.log(e);
      return from([]);
    }),
    finalize(() => (store.state.admin.loading = false))
  );
}

export function getTotals(apiUrl) {
  const timestamp = Math.round(new Date().getTime() / 36e5);

  return from(
    axios.get(
      `${apiUrl}query?q=mostRecent:true AND admin_level:"-1"&fields=confirmed,dead&sort=-confirmed&size=100&timestamp=${timestamp}`
    )
  ).pipe(
    pluck("data", "hits"),
    map(results => {
      const totals = {
        confirmed: sum(results, d => d.confirmed).toLocaleString(),
        dead: sum(results, d => d.dead).toLocaleString()
      };
      return totals;
    }),
    catchError(e => {
      console.log("%c Error in getting totals!", "color: red");
      console.log(e);
      return from([]);
    })
  );
}

export function countCountries(apiUrl) {
  const timestamp = Math.round(new Date().getTime() / 36e5);

  return from(
    axios.get(
      `${apiUrl}query?q=mostRecent:true AND admin_level:0&size=0&facet_size=300&facets=name&timestamp=${timestamp}`
    )
  ).pipe(
    pluck("data", "facets", "name", "terms"),
    map(results => {
      return results.length;
    }),
    catchError(e => {
      console.log("%c Error in getting number of countries!", "color: red");
      console.log(e);
      return from([]);
    })
  );
}

export function getFirstCases(apiUrl) {
  const timestamp = Math.round(new Date().getTime() / 36e5);

  return from(
    axios.get(
      `${apiUrl}query?q=mostRecent:true%20AND%20admin_level:0%20AND%20confirmed_newToday:true&size=300&fields=name,location_id&timestamp=${timestamp}`
    )
  ).pipe(
    pluck("data", "hits"),
    map(results => {
      const summary = {};
      results.sort((a, b) => (a.name < b.name ? -1 : 1));

      summary["count"] = results.length;
      summary["names"] = results.map(d => d.name).join(", ");
      summary["link"] = results.map(d => d.location_id).join(";");
      return summary;
    }),
    catchError(e => {
      console.log("%c Error in getting cfirst cases!", "color: red");
      console.log(e);
      return from([]);
    })
  );
}

export function getCasesAboveThresh(apiUrl, threshold) {
  const timestamp = Math.round(new Date().getTime() / 36e5);

  return from(
    axios.get(
      `${apiUrl}query?q=mostRecent:true%20AND%20admin_level:0%20AND%20confirmed_numIncrease:[${threshold} TO *]&size=300&fields=name,location_id&timestamp=${timestamp}`
    )
  ).pipe(
    pluck("data", "hits"),
    map(results => {
      const summary = {};
      results.sort((a, b) => (a.name < b.name ? -1 : 1));

      summary["count"] = results.length;
      summary["names"] = results.map(d => d.name).join(", ");
      summary["link"] = results.map(d => d.location_id).join(";");
      return summary;
    }),
    catchError(e => {
      console.log("%c Error in getting case counts!", "color: red");
      console.log(e);
      return from([]);
    })
  );
}

export function getGlanceSummary(apiUrl, genomicsUrl, locations) {
  store.state.admin.loading = true;
  const formatDate = timeFormat("%e %B %Y");
  const parseDate = timeParse("%Y-%m-%d");
  const timestamp = Math.round(new Date().getTime() / 36e5);
  const location_string =
    locations && locations.length ?
    ` AND location_id:("${locations.join('","')}")` :
    ` AND admin_level:[0 TO *]&sort=-confirmed_numIncrease`;
  const num2Return = locations && locations.length ? locations.length : 3;

  return from(
    axios.get(
      `${apiUrl}query?q=mostRecent:true${location_string}&fields=location_id,name,confirmed,confirmed_numIncrease,confirmed_pctIncrease,date,dead,dead_numIncrease,dead_pctIncrease,dead_rolling,confirmed_rolling&size=${num2Return}&timestamp=${timestamp}`
    )
  ).pipe(
    pluck("data", "hits"),
    mergeMap(summaryData =>
      forkJoin([
        getVOCs(genomicsUrl, summaryData.map(d => d.location_id), 25),
        getSparklineTraces(
          apiUrl,
          summaryData.map(d => d.location_id),
          "confirmed,dead,confirmed_numIncrease,dead_numIncrease,confirmed_rolling,dead_rolling"
        )
      ]).pipe(
        map(([voc, sparks]) => {
          sparks.forEach(spark => {
            const idx = summaryData.findIndex(d => d.location_id === spark.key);
            if (idx > -1) {
              summaryData[idx]["longitudinal"] = spark.value;
            }
          });

          voc.forEach(variant => {
            if (variant) {
              const idx = summaryData.findIndex(d => d.location_id === variant[0].id);
              if (idx > -1) {
                summaryData[idx]["voc"] = variant;
              }
            }
          })

          summaryData.forEach(d => {
            d["date"] = formatDate(parseDate(d["date"]));
          });

          return summaryData;
        })
      )
    ),
    catchError(e => {
      console.log("%c Error in getting glance summary!", "color: red");
      console.log(e);
      return from([]);
    }),
    finalize(() => (store.state.admin.loading = false))
  );
}

export function getVOCs(genomicsUrl, locations, totalThreshold) {
  const mutations = CURATED.filter(d => (d.variantType == "Variant of Concern" || d.variantType == "Variant of Interest") && d.reportType == "lineage").map(d => {
    // const mutations = CURATED.filter(d => d.variantType == "Variant of Concern" || d.variantType == "Variant of Interest").map(d => {
    return ({
      label: d.mutation_name,
      type: d.variantType == "Variant of Concern" ? "VOC" : d.variantType == "Variant of Interest" ? "VOI" : null,
      query: `pangolin_lineage=${d.mutation_name}`
    })
  });

  return forkJoin(...locations.map(loc => getLocationTable(genomicsUrl, loc, mutations, totalThreshold))).pipe(
    map(results => {
      const flattened = results.flatMap(d => d).map(d => d.values);
      const whiteThreshold = 0.35;
      const colorScale = scaleThreshold(schemeYlGnBu[9])
        .domain([0.01, 0.05, 0.1, 0.2, 0.35, 0.5, 0.75]);

      const cleaned = flattened.map(location => {
        if (location.every(d => !d.global_prevalence)) {
          // no location map for sequencing
          return (null)
        } else {
          location.forEach(d => {
            d["fill"] = colorScale(d.global_prevalence);
            d["proportion_formatted"] = d.proportion_formatted == "not detected" ? "none" : d.proportion_formatted;
            d["color"] = d.global_prevalence > whiteThreshold ? "#FFFFFF" : "#2c3e50";
          })
          return (location)
        }
      })

      return cleaned;
    })
  );
}
