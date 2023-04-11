import { forkJoin, from, of } from 'rxjs';
import axios from 'axios';
import { catchError, map, pluck } from 'rxjs/operators';
import { timeFormat, timeParse } from 'd3-time-format';

axios.interceptors.request.use(
  (config) => {
    // Pass GISAID param to API via headers
    // * BEFORE COMPLIATION, YOU NEED to run `export VUE_APP_API_ACCESS={key}`*
    config.headers.Authorization = `Bearer ${
      import.meta.env.VITE_APP_API_ACCESS
    }`;
    return config;
  },

  (error) => {
    return Promise.reject(error);
  },
);

export const getSourcesUpdated = (genomicsurl, resourcesurl, epiurl) => {
  return forkJoin([
    getLastUpdated(genomicsurl),
    getLastUpdated(resourcesurl),
    getLastUpdated(epiurl),
  ]).pipe(
    map(([genomics, resources, epi]) => {
      return {
        epi: epi,
        genomics: genomics,
        resources: resources,
      };
    }),
  );
};

export const getIndivSourcesUpdated = (genomicsurl, resourcesurl, epiurl) => {
  return forkJoin([
    getDateUpdated(genomicsurl, 'Sequences'),
    getResourcesDateUpdated(resourcesurl),
    getDateUpdated(epiurl),
  ]).pipe(
    map(([genomics, resources, epi]) => {
      return {
        epi: {
          epi: epi,
        },
        genomics: {
          genomics: genomics,
        },
        resources: resources,
      };
    }),
  );
};

const getDateUpdated = (apiurl, label = 'Records') => {
  const url = `${apiurl}metadata`;
  return from(
    axios.get(url, {
      headers: {
        'Content-Type': 'application/json',
      },
    }),
  ).pipe(
    pluck('data'),
    map((result) => {
      const dateUpdated = cleanDate(
        result.build_date,
        '%Y-%m-%dT%H:%M:%S.%f%Z',
      );
      const count = `${result.stats.total.toLocaleString()} ${label}`;
      return {
        count: count,
        dateUpdated: dateUpdated,
      };
    }),
    catchError((e) => {
      console.log('%c Error in getting date updated!', 'color: red');
      console.log(e);
      return of([]);
    }),
  );
};

const getLastUpdated = (apiurl) => {
  const url = `${apiurl}metadata`;
  return from(
    axios.get(url, {
      headers: {
        'Content-Type': 'application/json',
      },
    }),
  ).pipe(
    pluck('data', 'build_date'),
    map((result) => {
      return cleanDateElapsed(result);
    }),
    catchError((e) => {
      console.log('%c Error in getting date updated!', 'color: red');
      console.log(e);
      return of([]);
    }),
  );
};

const getResourcesDateUpdated = (apiurl) => {
  const url = `${apiurl}metadata`;
  return from(
    axios.get(url, {
      headers: {
        'Content-Type': 'application/json',
      },
    }),
  ).pipe(
    pluck('data', 'src'),
    map((result) => {
      const sources = Object.keys(result);
      let resultObj = {};

      sources.forEach((d) => {
        let count;
        let dateUpdated;

        switch (d) {
          case 'biorxiv':
            count = result[d]['stats'][d]
              ? `${result[d]['stats'][
                  d
                ].toLocaleString()} Records<sup>*</sup> (bioRxiv/medRxiv combined)`
              : null;
            break;
          case 'zenodo':
            count = `2,259 Records<sup>*</sup> (Datasets/ComputationalTools combined)`;
            // count = result[d]["stats"][d] ? `${result[d]["stats"][d].toLocaleString()} Records<sup>*</sup> (Datasets/ComputationalTools combined)` : null;
            break;

          case 'clinical_trials':
            count = result[d]['stats']['clinicaltrials']
              ? `${result[d]['stats'][
                  'clinicaltrials'
                ].toLocaleString()} Records`
              : null;
            break;
          case 'covid_who_clinical_trials':
            count = result[d]['stats']['clinicaltrialswho']
              ? `${result[d]['stats'][
                  'clinicaltrialswho'
                ].toLocaleString()} Records`
              : null;
            break;
          default:
            count = result[d]['stats'][d]
              ? `${result[d]['stats'][d].toLocaleString()} Records`
              : null;
        }

        switch (d) {
          case 'covid19_LST_reports':
            dateUpdated = '21 Oct 2021';

            break;
          default:
            dateUpdated = cleanDate(result[d]['version']);
        }

        resultObj[d] = {
          count: count,

          dateUpdated: dateUpdated,
        };
        return resultObj;
      });

      return resultObj;
    }),
    catchError((e) => {
      console.log('%c Error in getting resources date updated!', 'color: red');
      console.log(e);
      return of([]);
    }),
  );
};

const cleanDate = (result, dateFormat = '%Y-%m-%d-%H:%M') => {
  let dateUpdated = timeParse(dateFormat)(result); // ensure the time is parsed as PDT
  if (!dateUpdated) {
    // check because outbreak/NDE tag dates separately
    dateUpdated = timeParse('%Y-%m-%dT%H:%M:%S%Z')(result);
  }

  return dateUpdated ? timeFormat('%d %b %Y')(dateUpdated) : null;
};

const cleanDateElapsed = (result) => {
  const today = new Date();
  let lastUpdated;
  const strictIsoParse = timeParse('%Y-%m-%dT%H:%M:%S.%f%Z');
  const dateUpdated = strictIsoParse(result); // ensure the time is parsed as PDT
  if (dateUpdated) {
    const updatedDiff = (today - dateUpdated) / (60 * 60 * 1000);

    if (updatedDiff < 1) {
      lastUpdated = `${Math.round(updatedDiff * 60)}m`;
    } else if (updatedDiff <= 24) {
      lastUpdated = `${Math.round(updatedDiff)}h`;
    } else {
      lastUpdated = `${Math.round(updatedDiff / 24)}d`;
    }

    return lastUpdated;
  }
};
