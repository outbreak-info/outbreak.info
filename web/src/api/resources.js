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

function filterString2Arr(filterString) {
  return filterString.split(";").map(d => {
    const filters = d.split(":");
    return ({
      key: filters[0],
      values: filters[1].split(",")
    })
  })
}

function filterArr2String(filterArr) {
  return filterArr.map(d => `${d.key}:("${d.values.join('","')}")`).join(" AND ");
}

export function getResources(apiUrl, queryString, filterString, sort, size, page) {
  var comboString;
  var filterArr = [];
  if (!queryString && !filterString) {
    comboString = "__all__";
  } else if (!queryString) {
    filterArr = filterString2Arr(filterString);
    comboString = filterArr2String(filterArr);
  } else if (!filterString) {
    comboString = queryString;
  } else {
    filterArr = filterString2Arr(filterString);
    comboString = `${queryString} AND ${filterArr2String(filterArr)}`
  }

  store.state.admin.loading = true;
  return forkJoin([getMostRecent(apiUrl, comboString), getMetadataArray(apiUrl, comboString, sort, size, page), getResourceFacets(apiUrl, queryString, filterArr)]).pipe(
    map(([recent, results, facets]) => {
      results["recent"] = recent;
      results["facets"] = facets;
      console.log(results);
      return (results)
    }),
    catchError(e => {
      console.log("%c Error in getting resource metadata!", "color: red");
      console.log(e);
      return from([]);
    }),
    finalize(() => (store.state.admin.loading = false))
  )
}

export function getMetadataArray(apiUrl, queryString, sort, size, page) {
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
      console.log(results)
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

export function getResourceFacets(apiUrl, queryString, filterArr, facets = ["@type.keyword", "keywords.keyword", "topicCategory.keyword", "funding.funder.name.keyword", "measurementTechnique.keyword", "variableMeasured.keyword"]) {
  if (!queryString) {
    queryString = "__all__";
  }

  console.log(filterArr)
  const sortOrder = ["@type", "topicCategory", "keywords", "funding.funder.name", "measurementTechnique", "variableMeasured"];

  const facetString = facets.join(",")
  const timestamp = Math.round(new Date().getTime() / 1e5);
  return from(axios.get(`${apiUrl}query?q=${queryString}&size=0&facet_size=100&facets=${facetString}&timestamp=${timestamp}`, {
    headers: {
      'Content-Type': 'application/json'
    }
  })).pipe(
    pluck("data", "facets"),
    map(results => {
      const facets = Object.keys(results).map(key => {
        const filters = filterArr.filter(d => d.key == key.replace(".keyword", ""));
        results[key]["terms"].forEach(d => {
          d["checked"] = filters.length == 1 ? filters[0].values.includes(d.term) : false;
          d["checked2"] = d.term
          d["checked3"] = filters
          d["checked4"] = filterArr
          d["checked5"] = filterArr
        })
        return ({
          variable: key.replace(".keyword", "").replace("@", "").replace("funding.funder.name", "funding").replace("measurementTechnique", "measurement technique").replace("topicCategory", "topic").replace("variableMeasured", "variable measured"),
          id: key.replace(".keyword", ""),
          counts: results[key]["terms"],
          total: results[key]["terms"].length,
          num2Display: 5,
          expanded: true
        })
      })

      facets.sort((a, b) => sortOrder.indexOf(a.id) - sortOrder.indexOf(b.id));


      return (facets)
    }),
    catchError(e => {
      console.log("%c Error in getting resource facets!", "color: red");
      console.log(e);
      return from([]);
    })
  )
}

export function getMostRecent(apiUrl, queryString, sortVar = "-datePublished", num2Return = 3, fields = ["@type", "name", "author", "creator", "datePublished", "dateModified", "dateCreated"]) {
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
