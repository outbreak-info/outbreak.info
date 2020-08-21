import {
  from,
  EMPTY,
  BehaviorSubject
} from "rxjs";
import axios from "axios";
import {
  finalize,
  catchError,
  pluck,
  map,
  expand,
  reduce
} from "rxjs/operators";

import store from "@/store";


export function getLocation(apiUrl) {
  if (!navigator.geolocation) {
    console.log("Geolocation not supported")
  }
  else {
    navigator.geolocation.getCurrentPosition(loc => processLocation(apiUrl, loc).subscribe(x => console.log(x)), failedLocation)
  }
}

function processLocation(apiUrl, location) {
  const scalar = 0.05;
  const url = `${apiUrl}query?q=mostRecent:true AND lat:[${(1-scalar) * location.coords.latitude} TO ${(1+scalar) * location.coords.latitude}] AND long:[${(1+scalar) * location.coords.longitude} TO ${(1-scalar) * location.coords.longitude}] &fields=location_id,name,lat,long&size=25`;
  return from(axios.get(url)).pipe(
    pluck("data", "hits"),
    map(results => {
      // Calc Pythagoean distance
      results.forEach(loc => {
        loc["dist"] = Math.pow(location.coords.latitude - loc.lat, 2) + Math.pow(location.coords.longitude - loc.long, 2)
      })

      results.sort((a,b) => a.dist - b.dist);

      const nearest = results[0];

      return(nearest)
    }),
    catchError(e => {
      console.log("%c Error in getting nearest location!", "color: red");
      console.log(e);
      return from([]);
    })
  );
}


function failedLocation(location) {
  console.log("success")
  console.log(location)
}
