import {
  from
} from "rxjs";
import axios from "axios";
import {
  tap,
  finalize,
  catchError,
  pluck,
  map,
} from "rxjs/operators";
import {
  nest,
  timeParse,
  sum
} from "d3";

import store from "@/store";

export function getLocations(apiUrl) {

  store.state.admin.loading = true;
  const timestamp = new Date().getTime();

  return from(axios.get(`${apiUrl}query?q=date:"2020-02-01"&fields=location_id,name,country_name,region_wb,admin_level&size=1000&timestamp=${timestamp}`)).pipe(
    pluck("data", "hits"),
    tap(results => {
      let places = results.map(d => {
        return ({
          label: d.admin_level == 1 ? `${d.name}, ${d.country_name}` : d.name,
          id: d.location_id,
          admin_level: d.admin_level
        })
      });

      // Add in groups of Admin 1's, Admin 0's
      const regions = nest()
        .key(d => d.region_wb)
        .rollup(values => values.map(d => d.location_id).join(";"))
        .entries(results.filter(d => d.admin_level === 0));

      regions.forEach(d => {
        d["label"] = `${d.key} (all countries)`;
        d["id"] = d.value;
        d["admin_level"] = -0.5;
        delete d.key;
        delete d.value;
      })
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
      })

      places = places.concat(regions).concat(countries);
      places.sort((a, b) => a.admin_level < b.admin_level ? -1 : 1);
      store.state.epidata.allPlaces = places;
      return (places)
    }),
    catchError(e => {
      console.log("%c Error in getting case counts!", "color: red");
      console.log(e);
      return from([]);
    }),
    finalize(() => (store.state.admin.loading = false))
  )
}
