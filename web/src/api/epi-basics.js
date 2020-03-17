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


  // sort by date so the numbers appear in the right order.

  return from(axios.get(`${apiUrl}query?q=__all__&size=0&facets=name&facet_size=1000&timestamp=${timestamp}`)).pipe(
    pluck("data", "facets", "name", "terms"),
    tap(results => {
      const places = [...new Set(results.map(d => d.term))].sort();
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
