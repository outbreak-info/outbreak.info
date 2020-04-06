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
import {
  getAll
} from "@/api/biothings.js";

export function getMapData(apiUrl) {
  const parseDate = timeParse("%Y-%m-%d");

  store.state.admin.loading = true;
  // Choosing one specific date, since all dates contain the current info.
  return getAll(apiUrl, `date:"2020-03-24" AND admin_level:[0 TO 1]&fields=location_id,name,num_subnational,country_name,admin_level,lat,long,confirmed_currentCases,
  confirmed_currentIncrease,
  confirmed_currentPctIncrease,
  confirmed_currentToday,
  dead_currentCases,
  dead_currentIncrease,
  dead_currentPctIncrease,
  dead_currentToday,
  recovered_currentCases,
  recovered_currentIncrease,
  recovered_currentPctIncrease,recovered_currentToday`).pipe(
    map(results => {
      results.forEach(d => {
        d["coord"] = [d.lat, d.long];
        d["confirmed_currentToday"] = parseDate(d["confirmed_currentToday"]);
        d["recovered_currentToday"] = parseDate(d["recovered_currentToday"]);
        d["dead_currentToday"] = parseDate(d["dead_currentToday"]);
      })
      return (results)
    }),
    catchError(e => {
      console.log("%c Error in getting map data!", "color: red");
      console.log(e);
      return from([]);
    }),
    finalize(() => (store.state.admin.loading = false))
  )
}
