import { from, EMPTY, BehaviorSubject } from 'rxjs';
import axios from 'axios';

import {
  finalize,
  catchError,
  pluck,
  map,
  expand,
  reduce,
} from 'rxjs/operators';
import { timeParse, timeFormat } from 'd3-time-format';
import { adminStore } from '@/stores/adminStore';

const store = adminStore();
export const progressSubject = new BehaviorSubject(0);
export const progressState$ = progressSubject.asObservable();

export const getDateUpdated = (apiUrl) => {
  const today = new Date();
  const url = `${apiUrl}metadata`;
  return from(axios.get(url)).pipe(
    pluck('data', 'build_date'),
    map((result) => {
      const strictIsoParse = timeParse('%Y-%m-%dT%H:%M:%S.%f%Z');
      const dateUpdated = strictIsoParse(result); // ensure the time is parsed as PDT
      let lastUpdated = null;
      if (dateUpdated) {
        const updatedDiff = (today - dateUpdated) / (60 * 60 * 1000);

        if (updatedDiff < 1) {
          lastUpdated = `${Math.round(updatedDiff * 60)}m`;
        } else if (updatedDiff <= 24) {
          lastUpdated = `${Math.round(updatedDiff)}h`;
        } else {
          lastUpdated = `${Math.round(updatedDiff / 24)}d`;
        }
      }
      return lastUpdated;
    }),
    catchError((e) => {
      console.log('%c Error in getting case counts!', 'color: red');
      console.log(e);
      return from([]);
    }),
  );
};

export const getCurrentDate = (apiUrl, returnFormatted = true) => {
  const formatDate = timeFormat('%e %B %Y');
  const parseDate = timeParse('%Y-%m-%d');

  const url = `${apiUrl}query?q=mostRecent:true&sort=-date&size=1&fields=date`;
  return from(axios.get(url)).pipe(
    pluck('data', 'hits'),
    map((result) => {
      const dateUpdated = parseDate(result[0].date);
      return returnFormatted ? formatDate(dateUpdated) : dateUpdated;
    }),
    catchError((e) => {
      console.log('%c Error in getting case counts!', 'color: red');
      console.log(e);
      return from([]);
    }),
  );
};

export const getAll = (apiUrl, queryString) => {
  store.$patch({ loading: true });
  return getOne(apiUrl, queryString, 0).pipe(
    expand((data, _) =>
      data.next ? getOne(apiUrl, queryString, data.count, data.next) : EMPTY,
    ),
    pluck('results'),
    reduce((acc, data) => {
      return acc.concat(data);
    }, []),
    map((all_data) => {
      // last iteration returns undefined; filter out
      all_data = all_data.filter((d) => d);

      return all_data;
    }),
    catchError((e) => {
      console.log('%c Error in fetching all!', 'color: red');
      console.log(e);
      return from([]);
    }),
    finalize(() => {
      progressSubject.next(0);
      store.$patch({ loading: false });
    }),
  );
};

export const getOne = (apiUrl, queryString, count, scrollID = null) => {
  let url = `${apiUrl}query?q=${queryString}&fetch_all=true&page=${count}`;
  if (scrollID) {
    url = `${url}&scroll_id=${scrollID}`;
  }

  return from(axios.get(url)).pipe(
    pluck('data'),
    map((results) => {
      let pct;
      if (!results['total'] || (count + 1) * 1000 > results['total']) {
        pct = 1;
      } else {
        pct = ((count + 1) * 1000) / results['total'];
      }
      progressSubject.next(pct);
      return {
        next: results['_scroll_id'],
        count: count + 1,
        results: results['hits'],
      };
    }),
    catchError((e) => {
      console.log('%c Error in fetching one!', 'color: red');
      console.log(e);
      return from([]);
    }),
  );
};
