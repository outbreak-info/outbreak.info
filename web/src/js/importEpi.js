import {
  timeParse,
  isoParse,
  nest,
  sum,
  timeFormat,
  map
} from 'd3';

import store from "@/store";

// Function to convert from the JHU data in wide form to long.
export function cleanEpi(data) {
  const parseDate = timeParse("%m/%d/%y");
  const formatDate = timeFormat("%m-%d-%y");

  data.forEach(row => {
    const metadata = {
      'locationName': row['Province/State'] && row["Province/State"] !== "" ? row['Province/State'].trim() : row['Country/Region'].trim(),
      'locationType': row['Province/State'] && row["Province/State"] !== "" ? "sub-national" : "country",
      'country': row['Country/Region'].trim(),
      'region': getRegion(row['Country/Region']),
      lat: +row["Lat"],
      lon: +row["Long"]
    };
    metadata['id'] = cleanID(metadata['locationName'], metadata['locationType']);

    delete row['Province/State'];
    delete row['Country/Region'];
    delete row['Lat'];
    delete row['Long'];

    // get array of all the dates to convert from wide --> long
    let dateArr = Object.keys(row);

    // check the data integrity. Often during Github update, the initial load is an empty new column.
    const dateToday = dateArr.slice(-1)[0];
    const badToday = data.map(d => row[dateToday]).every(d => d == "");

    if (badToday) {
      console.log("Deleting today's data: all null")
      dateArr.pop();
    }

    // convert from wide to long; save as `row['data']`
    row['data'] = dateArr.map(timepoint => {
      return ({
        "date": parseDate(timepoint),
        "date_string": formatDate(parseDate(timepoint)),
        "cases": +row[timepoint],
        "coord": [metadata.lon, metadata.lat],
        "id": metadata.id,
        "locationType": metadata.locationType,
        // variables needed for nesting and/or filtering
        "country": metadata.country,
        "countries": [metadata.country],
        "region": metadata.region
      })
    });

    //  remove wide data
    dateArr.forEach(timepoint => delete row[timepoint]);

    row['data'].sort((a, b) => a.date - b.date);

    // pull out some global numbers for the case counts
    // first date when cases are > 0.
    const firstDate = row.data.filter(d => d.cases > 0).slice(0, 1);
    row['locationName'] = metadata.locationName;
    row['id'] = metadata.id;
    const last2 = row.data.slice(-2);
    row['numIncrease'] = (last2[1].cases - last2[0].cases);
    row['pctIncrease'] = row.numIncrease / last2[0].cases;
    row['currentDate'] = last2[1].date;
    row['firstDate'] = firstDate.length ? firstDate[0]['date'] : null;
    row['newToday'] = row['firstDate'] === row['currentDate'];
    row['currentCases'] = last2[1].cases;
  });

console.log(data)
  return (data);
}

export function nestEpiTrace(data, nestingVar, nestingType) {
  const formatDate = timeFormat("%m-%d-%y");
  if (data) {
    // nest by date
    const regionNest = nest()
      .key(d => d[nestingVar])
      .key(d => d.date)
      .rollup(values => {
        return ({
          cases: sum(values, d => d.cases),
          countries: map(values, d => d.country).keys(),
          region: values[0].region
        })
      })
      .entries(data);

    regionNest.forEach(d => {
      d['locationName'] = d.key;
      d['id'] = d.key.replace(/\s/g, "_");
      d.values.forEach(timepoint => {
        timepoint['id'] = d.key.replace(/,\s/g, "_").replace(/\s/g, "_").replace(/\(/g, "_").replace(/\)/g, "_");
        timepoint['date'] = isoParse(timepoint.key);
        timepoint['date_string'] = formatDate(timepoint.date);
        timepoint['cases'] = timepoint.value.cases;
      })

      d['data'] = d.values;
      const last2 = d.data.slice(-2);
      d['numIncrease'] = (last2[1].cases - last2[0].cases);
      d['pctIncrease'] = d.numIncrease / last2[0].cases;
      d['currentDate'] = last2[1].date;
      d['currentCases'] = last2[1].cases;
      d['newToday'] = d.data[0].value.newToday;
      d['countries'] = d.data[0].value.countries;
      d['region'] = d.data[0].value.region;
      d['locationType'] = nestingType;
      // delete d['values'];
    })

    return (regionNest);
  }
}

export function nestRegions(data) {
  if (data) {
    // nest by date
    const regionNest = nest()
      .key(d => d.date)
      .key(d => d.region)
      .rollup(values => sum(values, d => d.cases))
      .entries(data);

    const nested = regionNest.map(d => {
      const obj = {};
      obj['date'] = isoParse(d.key);

      d.values.forEach(value => {
        obj[value.key] = value.value;
      })

      return (obj)
    })
    return (nested);
  }
}

export function cleanID(id, type) {
  const cleaned = id.replace(/,\s/g, "_").replace(/\s/g, "_").replace(/\(/g, "_").replace(/\)/g, "_").replace(/\//g, "_");
  return (`${cleaned}-${type}`);
}

export function getRegion(country) {
  const regionDict = store.state.geo.regionDict;

  const region = regionDict.filter(d => d.countries.includes(country));

  if (region.length === 1) {
    return (region[0].region)
  }
}
