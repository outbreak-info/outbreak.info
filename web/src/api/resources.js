import {
  from,
  forkJoin,
  EMPTY
} from "rxjs";
import axios from "axios";
import {
  // finalize,
  catchError,
  pluck,
  map,
  tap,

  finalize
} from "rxjs/operators";

import store from "@/store";

export function getResources(apiUrl, queryString, sort, size, page) {
  if (!queryString) {
    queryString = "__all__";
  }
  console.log("GETTING RESOURCES")

  store.state.admin.loading = true;
  return forkJoin([getMostRecent(apiUrl, queryString), getMetadataList(apiUrl, queryString, sort, size, page), getResourceFacets(apiUrl, queryString)]).pipe(
    map(([recent, results, facets]) => {
      results["recent"] = recent;
      results["facets"] = facets;
      console.log(recent);
      console.log(results);
      console.log(facets);
      return(results)
    }),
    catchError(e => {
      console.log("%c Error in getting resource metadata!", "color: red");
      console.log(e);
      return from([]);
    }),
    finalize(() => (store.state.admin.loading = false))
  )
}

export function getMetadataList(apiUrl, queryString, sort, size, page) {
  const maxDescriptionLength = 75;
  // store.state.admin.loading = true;
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
          d['descriptionExpanded'] = false;
        }
      })

      resources.sort((a, b) => a.date > b.date ? -1 : 1);
      return ({
        results: resources,
        total: total
      })
    }),
    catchError(e => {
      console.log("%c Error in getting resource metadata!", "color: red");
      console.log(e);
      return from([]);
    })
    // finalize(() => (store.state.admin.loading = false))
  )
}


export function getResourceMetadata(apiUrl, id) {
  store.state.admin.loading = true;
  const timestamp = Math.round(new Date().getTime() / 1e5);
  return from(axios.get(`${apiUrl}query?q=_id:"${id}"&size=1&timestamp=${timestamp}`, {
    headers: {
      'Content-Type': 'application/json'
    }
  })).pipe(
    pluck("data", "hits"),
    map(results => {
      const metadata = results[0];

      metadata["date"] = metadata.dateModified ? metadata.dateModified : (metadata.datePublished ? metadata.datePublished : metadata.dateCreated)
      console.log(metadata);

      return (metadata)
    }),
    catchError(e => {
      console.log("%c Error in getting resource metadata!", "color: red");
      console.log(e);
      return from([]);
    }),
    finalize(() => (store.state.admin.loading = false))
  )
}

export function getResourceFacets(apiUrl, queryString, facets=["@type.keyword", "keywords.keyword", "topicCategory.keyword", "funding.funder.name.keyword", "measurementTechnique.keyword", "variableMeasured.keyword"]) {
  const facetString = facets.join(",")
  const timestamp = Math.round(new Date().getTime() / 1e5);
  return from(axios.get(`${apiUrl}query?q="${queryString}"&size=0&facet_size=100&facets=${facetString}&timestamp=${timestamp}`, {
    headers: {
      'Content-Type': 'application/json'
    }
  })).pipe(
    pluck("data", "facets"),
    map(results => {
      const facets = Object.keys(results).map(key => {
        results[key]["terms"].forEach(d => {
          d["checked"] = true;
        })
        return({
          variable: key.replace(".keyword", "").replace("@", "").replace("funding.funder.name", "funding").replace("measurementTechnique", "measurement technique").replace("topicCategory", "topic").replace("variableMeasured", "variable measured"),
          id: key.replace(".keyword", ""),
          counts: results[key]["terms"],
          total: results[key]["terms"].length,
          num2Display: 5,
          expanded: true
        })
      })


      return (facets)
    }),
    catchError(e => {
      console.log("%c Error in getting resource facets!", "color: red");
      console.log(e);
      return from([]);
    })
  )
}

export function getMostRecent(apiUrl, queryString, sortVar="-datePublished", num2Return=3, fields=["@type", "name", "author", "creator", "datePublished", "dateModified", "dateCreated"]) {
  const timestamp = Math.round(new Date().getTime() / 1e5);
  const fieldString = fields.join(",");
  return from(axios.get(`${apiUrl}query?q=${queryString}&field=${fieldString}&size=${num2Return}&sort=${sortVar}&timestamp=${timestamp}`, {
    headers: {
      'Content-Type': 'application/json'
    }
  })).pipe(
    pluck("data", "hits"),
    map(results => {
      results.forEach(d => {
        d["date"] = d.dateModified ? d.dateModified : (d.datePublished ? d.datePublished : d.dateCreated);
      })

      return (results)
    }),
    catchError(e => {
      console.log("%c Error in getting resource facets!", "color: red");
      console.log(e);
      return from([]);
    })
  )
}
