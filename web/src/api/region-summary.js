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

export function getStackedRegions(apiUrl) {
  store.state.admin.loading = true;
  const parseDate = timeParse("%Y-%m-%d");

  return from(axios.get(`${apiUrl}query?q=admin_level:"-1"&size=1000&fields=location_id, name,date,confirmed,recovered,dead`)).pipe(
      tap(x => console.log(x)),
      pluck("data", "hits"),
      map(results => {
        // nest by date
        const regionNest = nest()
          .key(d => d.date)
          .key(d => d.name)
          .rollup(values => {
            return ({
              confirmed: sum(values, d => d.confirmed),
              dead: sum(values, d => d.dead),
              recovered: sum(values, d => d.recovered)
            })
          })
          .entries(results);
          console.log(regionNest)


        const nested = {};
        nested["confirmed"] = [];
        nested["dead"] = [];
        nested["recovered"] = [];

        regionNest.map(d => {
          const objC = {};
          const objD = {};
          const objR = {};
          objC["date"] = parseDate(d.key);
          objD["date"] = parseDate(d.key);
          objR["date"] = parseDate(d.key);

          d.values.forEach(value => {
            objC[value.key] = value.value.confirmed;
            objD[value.key] = value.value.dead;
            objR[value.key] = value.value.recovered;
          });

          nested["confirmed"].push(objC)
          nested["dead"].push(objD)
          nested["recovered"].push(objR)

        });
        nested["confirmed"].sort((a,b) => a.date - b.date);
        nested["dead"].sort((a,b) => a.date - b.date);
        nested["recovered"].sort((a,b) => a.date - b.date);
        return nested;
      }),
      catchError(e => {
        console.log("%c Error in getting case counts!", "color: red");
        console.log(e);
        return from([]);
      }),
      finalize(() => (store.state.admin.loading = false))
    )
}
