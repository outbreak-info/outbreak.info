import {
  from,
  EMPTY
} from "rxjs";
import axios from "axios";
import {
  // finalize,
  catchError,
  pluck,
  map,
  expand,
  reduce,
  finalize
} from "rxjs/operators";

import store from "@/store";

export function getResources(apiUrl, queryString, sort, size, page) {
  if (!queryString) {
    queryString = "__all__";
  }
  if (!size) {
    size = 10;
  }
  if (!page) {
    page = 0;
  }

  const maxDescriptionLength = 75;
  store.state.admin.loading = true;
  const timestamp = Math.round(new Date().getTime() / 1e5);
  return from(axios.get(`${apiUrl}query?q=${queryString}&sort=${sort}&size=${size}&from=${page}&timestamp=${timestamp}`, {
    headers: {
      'Content-Type': 'application/json'
    }
  })).pipe(
    pluck("data"),
    map(results => {
      console.log(results);

      const resources = results.hits;
      const total = results.total;

      resources.forEach(d => {
        d["date"] = d.dateModified ? d.dateModified : (d.datePublished ? d.datePublished : d.dateCreated);
        d["longDescription"] = d.abstract ? d.abstract : d.description;
        if (d.longDescription) {
          let descriptionArray = d.longDescription.split(" ");
          d['shortDescription'] = descriptionArray.slice(0, maxDescriptionLength).join(" ");
          d['descriptionTooLong'] = descriptionArray.length >= maxDescriptionLength;
        }
      })

      resources.sort((a, b) => a.date > b.date ? -1 : 1);
      return ({results: resources, total: total})
    }),
    catchError(e => {
      console.log("%c Error in getting resource metadata!", "color: red");
      console.log(e);
      return from([]);
    }),
    finalize(() => (store.state.admin.loading = false))
  )
}
