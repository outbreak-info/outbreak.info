import { from, forkJoin } from 'rxjs';
import axios from 'axios';
import { catchError, pluck, map, finalize } from 'rxjs/operators';
import { format } from 'd3-format';
import { timeParse, timeFormat } from 'd3-time-format';
import cloneDeep from 'lodash/cloneDeep';

import { adminStore } from '@/stores/adminStore';

const store = adminStore();

const filterString2Arr = (filterString) => {
  return filterString.split(';').map((d) => {
    const filters = d.split(':');

    return {
      key: filters[0],
      values: filters[1].split(','),
    };
  });
};

const filterArr2String = (filterArr) => {
  return filterArr
    .map((d) => `${d.key}:("${d.values.join('" OR "')}")`)
    .join(' AND ');
};

export const getResources = (
  apiUrl,
  queryString,
  filterString,
  sort,
  size,
  page,
  dateMin,
  dateMax,
) => {
  let comboString;
  let filterArr = [];

  // create date range query
  let dateString;
  if (dateMin && dateMax) {
    dateString = `date:[${dateMin} TO ${dateMax}]`;
  } else if (dateMin) {
    dateString = `date:[${dateMin} TO *]`;
  } else if (dateMax) {
    dateString = `date:[* TO ${dateMax}]`;
  }

  if (!queryString && !filterString && !dateString) {
    comboString = '__all__';
  } else if (!queryString && filterString) {
    // filters, but no query
    filterArr = filterString2Arr(filterString);
    comboString = dateString
      ? `()${filterArr2String(filterArr)}) AND ${dateString}`
      : filterArr2String(filterArr);
  } else if (!queryString && dateString) {
    // date filter, but no query or filter
    comboString = dateString;
  } else if (!filterString) {
    // query, but no filter
    comboString = dateString
      ? `(${queryString}) AND ${dateString}`
      : queryString;
  } else {
    filterArr = filterString2Arr(filterString);
    comboString = dateString
      ? `(${queryString}) AND (${filterArr2String(
          filterArr,
        )}) AND ${dateString}`
      : `(${queryString}) AND (${filterArr2String(filterArr)})`;
  }

  store.$patch({ loading: true });
  return forkJoin([
    getMostRecent(apiUrl, comboString, null),
    getMetadataArray(apiUrl, comboString, sort, size, page),
    getResourceFacets(apiUrl, queryString, filterArr), // call to get the counts for the supplied query
    getResourceFacets(apiUrl, comboString, filterArr), // call to get the counts for the supplies query + applied filters
  ]).pipe(
    // map(([recent, results, allFacets]) => {
    map(([recent, results, allFacets, currentFacets]) => {
      const facets = allFacets.map((all) => {
        all['filtered'] = cloneDeep(all.counts);
        all.filtered.map((obj) => {
          const current = currentFacets.find((curr) => curr.id === all.id);
          let newval = current['counts'].find((item) => obj.term === item.term);

          newval = newval
            ? newval
            : {
                term: obj.term,
                count: 0,
              };
          Object.assign(obj, newval);
        });

        all['total'] = all.filtered.filter((d) => d.count).length;

        all.filtered.sort((a, b) => b.count - a.count);
        return all;
      });

      const dateIdx = facets.findIndex((d) => d.variable === 'date');
      let dates = [];

      if (dateIdx >= 0) {
        dates = facets.splice(dateIdx, dateIdx);
      }

      results['recent'] = recent;
      results['facets'] = facets;
      results['dates'] = dates[0]['filtered'];
      results['query'] = comboString;
      return results;
    }),
    catchError((e) => {
      console.log('%c Error in getting all resource metadata!', 'color: red');
      console.log(e);
      return from([]);
    }),
    finalize(() => store.$patch({ loading: false })),
  );
};

export const getMetadataArray = (apiUrl, queryString, sort, size, page) => {
  const maxDescriptionLength = 75;

  return from(
    axios.get(
      `${apiUrl}query?q=${queryString}&sort=${sort}&size=${size}&from=${page}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    ),
  ).pipe(
    pluck('data'),
    map((results) => {
      const resources = results.hits;
      const total = results.total;

      resources.forEach((d) => {
        d['longDescription'] =
          d.abstract && d.abstract.length ? d.abstract : d.description;
        if (d.longDescription) {
          let descriptionArray = d.longDescription.split(' ');
          d['shortDescription'] = descriptionArray
            .slice(0, maxDescriptionLength)
            .join(' ');
          d['descriptionTooLong'] =
            descriptionArray.length >= maxDescriptionLength;
          d['descriptionExpanded'] = false;
        }
      });

      return {
        results: resources,
        total: total,
      };
    }),
    catchError((e) => {
      console.log('%c Error in getting resource metadata array!', 'color: red');
      console.log(e);
      return from([]);
    }),
    // finalize(() => (stores.state.admin.loading = false))
  );
};

export const getResourceMetadata = (apiUrl, id) => {
  store.$patch({ loading: true });
  const query = `_id:"${id}"`;

  return from(
    axios.get(`${apiUrl}query?q=${query}&size=1`, {
      headers: {
        'Content-Type': 'application/json',
      },
    }),
  ).pipe(
    pluck('data', 'hits'),
    map((results) => {
      const metadata = results[0];

      if (metadata) {
        delete metadata['_score'];
      }

      return metadata;
    }),
    catchError((e) => {
      console.log('%c Error in getting resource metadata!', 'color: red');
      console.log(e);
      return from([]);
    }),
    finalize(() => store.$patch({ loading: false })),
  );
};

export const getResourceFacets = (
  apiUrl,
  queryString,
  filterArr,
  facets = [
    '@type',
    'curatedBy.name',
    'keywords',
    'date',
    'topicCategory',
    'interventions.name',
    // "sponsor.name",
    'funding.funder.name',
    'measurementTechnique',
    'variableMeasured',
  ],
) => {
  if (!queryString) {
    queryString = '__all__';
  }

  const sortOrder = [
    'Type',
    'date',
    'Source',
    'Topic',
    'Funding',
    // "Trial Sponsor",
    'Trial Intervention',
    'Measurement Technique',
    'Variable Measured',
    'Keywords',
  ];

  const facetString = facets.join(',');
  return from(
    axios.get(
      `${apiUrl}query?q=${queryString}&size=0&facet_size=1000&facets=${facetString}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    ),
  ).pipe(
    pluck('data', 'facets'),
    map((results) => {
      const facets = Object.keys(results).map((key) => {
        // turn on check boxes for filters that have been selected.
        const filters = filterArr.filter(
          (d) => d.key === key.replace('.keyword', ''),
        );
        results[key]['terms'].forEach((d) => {
          d['checked'] =
            filters.length === 1 ? filters[0].values.includes(d.term) : false;

          // convert dates from strings to dates
          if (key === 'date') {
            d['date'] = timeParse('%Y-%m-%dT00:00:00.000Z')(d['term']);
          }
        });

        return {
          variable: key
            .replace('.keyword', '')
            .replace('@type', 'Type')
            .replace('interventions.name', 'Trial Intervention')
            // .replace("sponsor.name", "Trial Sponsor")
            .replace('curatedBy.name', 'Source')
            .replace('funding.funder.name', 'Funding')
            .replace('measurementTechnique', 'Measurement Technique')
            .replace('topicCategory', 'Topic')
            .replace('variableMeasured', 'Variable Measured')
            .replace('keywords', 'Keywords'),
          id: key.replace('.keyword', ''),
          counts: results[key]['terms'],
          num2Display: 5,
          expanded: true,
          // expanded: results[key]["terms"].some(d => d.checked) // expand if anything is checked
        };
      });

      facets.sort(
        (a, b) => sortOrder.indexOf(a.variable) - sortOrder.indexOf(b.variable),
      );

      return facets;
    }),
    catchError((e) => {
      console.log('%c Error in getting resource facets!', 'color: red');
      console.log(e);
      return from([]);
    }),
  );
};

export const getMostRecent = (
  apiUrl,
  queryString,
  filterString,
  sortVar = '-date',
  num2Return = 3,
  fields = ['@type', 'name', 'author', 'creator', 'date'],
) => {
  const today = new Date();
  const fieldString = fields.join(',');

  if (queryString !== '__all__') {
    queryString = queryString
      ? filterString
        ? `(${queryString}) AND ${filterString}`
        : `(${queryString})`
      : filterString;
  } else {
    queryString = filterString ? filterString : `__all__`;
  }

  return from(
    axios.get(
      `${apiUrl}query?q=${queryString}&field=${fieldString}&size=${num2Return}&sort=${sortVar}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    ),
  ).pipe(
    pluck('data', 'hits'),
    map((results) => {
      return results;
    }),
    catchError((e) => {
      console.log('%c Error in getting resource facets!', 'color: red');
      console.log(e);
      return from([]);
    }),
  );
};

export const getMostRecentGroup = (
  apiUrl,
  queryString,
  sortVar,
  num2Return,
) => {
  return forkJoin([
    getMostRecent(
      apiUrl,
      queryString,
      '@type:Publication',
      sortVar,
      num2Return,
    ),
    getMostRecent(apiUrl, queryString, '@type:Dataset', sortVar, num2Return),
    getMostRecent(
      apiUrl,
      queryString,
      '@type:ClinicalTrial',
      sortVar,
      num2Return,
    ),
    getMostRecent(apiUrl, queryString, '@type:Protocol', sortVar, num2Return),
  ]).pipe(
    map(([pubs, datasets, trials, protocols]) => {
      return {
        Publication: pubs,
        Dataset: datasets,
        ClinicalTrial: trials,
        Protocol: protocols,
      };
    }),
  );
};

export const getQuerySummaries = (queries, apiUrl) => {
  queries.forEach((d) => {
    d['query'] = encodeURIComponent(`("${d.terms.join('" OR "')}")`);
  });

  return forkJoin(...queries.map((d) => getQuerySummary(d.query, apiUrl))).pipe(
    map((results) => {
      results.forEach((d, idx) => {
        d['key'] = queries[idx];
        d.types.forEach((type) => {
          type['x'] = d.key.name;
          type['y'] = type.term;
        });
      });
      return results;
    }),
  );
};

export const getQuerySummary = (
  queryString,
  apiUrl,
  fields = '@type,name,identifierSource,interventions,studyStatus,armGroup,studyLocation,studyDesign,date,journalName, journalNameAbbrev, author,keywords',
  facets = '@type, curatedBy.name,date',
) => {
  return from(
    axios.get(
      // `${apiUrl}query?q=name:${queryString} OR description:${queryString}&size=100&fields=${fields}&facets=${facets}&facet_size=100`, {
      `${apiUrl}query?q=${queryString}&size=1000&fields=${fields}&facets=${facets}&facet_size=1000`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    ),
  ).pipe(
    pluck('data'),
    map((results) => {
      results['types'] = results['facets']['@type']['terms'];
      const dateParse = timeParse('%Y-%m-%dT00:00:00.000Z');
      results['facets']['date']['terms'].forEach((d) => {
        d['date'] = dateParse(d.term);
      });

      return results;
    }),
  );
};

export const getSourceSummary = (apiUrl, query) => {
  return forkJoin([
    getSourceCounts(apiUrl, query),
    getResourcesMetadata(apiUrl),
  ]).pipe(
    map(([results, metadata]) => {
      results['dateModified'] = metadata;
      return results;
    }),
  );
};

export const getResourceTotal = (apiUrl) => {
  return from(
    axios.get(`${apiUrl}query?size=0`, {
      headers: {
        'Content-Type': 'application/json',
      },
    }),
  ).pipe(
    pluck('data', 'total'),
    map((total) => {
      const rounded = Math.floor(total / 1000) * 1000;
      return {
        floor: format(',')(rounded),
        total: total,
      };
    }),
  );
};

export const getSourceCounts = (apiUrl, queryString) => {
  return from(
    axios.get(
      `${apiUrl}query?q=${queryString}&aggs=@type(curatedBy.name)&facet_size=100`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    ),
  ).pipe(
    pluck('data'),
    map((results) => {
      const cleaned = results.facets['@type']['terms'].flatMap((d) => {
        const source = {
          name: d.term,
        };
        // Temp, till `curatedBy` added for Zenodo
        const zenodo = d['count'] - d['curatedBy.name']['total'];

        d['curatedBy.name']['terms'].forEach((source) => {
          source['name'] = source.term
            .replace('The Protein Data Bank', 'PDB')
            .replace('ClinicalTrials.gov', 'NCT')
            .replace(
              'WHO International Clinical Trials Registry Platform',
              'WHO',
            );
        });
        if (zenodo) {
          d['curatedBy.name']['terms'].push({
            name: 'unknown',
            count: zenodo,
          });
        }

        source['children'] = d['curatedBy.name']['terms'];

        return source;
      });
      return {
        total: results.total.toLocaleString(),
        sources: {
          name: 'root',
          children: cleaned,
        },
      };
    }),
  );
};

export const getResourcesMetadata = (apiUrl) => {
  const formatDate = timeFormat('%d %B %Y');

  return from(axios.get(`${apiUrl}metadata`)).pipe(
    pluck('data', 'build_date'),
    map((metadata) => {
      const strictIsoParse = timeParse('%Y-%m-%dT%H:%M:%S.%f%Z');
      if (metadata) {
        const dateUpdated = metadata ? strictIsoParse(metadata) : null;
        return formatDate(dateUpdated);
      } else {
        return null;
      }
    }),
  );
};

export const getCTPublications = (apiUrl, id) => {
  return from(
    axios.get(`${apiUrl}query?q=${id} AND @type:Publication`, {
      headers: {
        'Content-Type': 'application/json',
      },
    }),
  ).pipe(
    pluck('data', 'hits'),
    map((results) => {
      return results;
    }),
    catchError((e) => {
      console.log('%c Error in getting resource facets!', 'color: red');
      console.log(e);
      return from([]);
    }),
  );
};
