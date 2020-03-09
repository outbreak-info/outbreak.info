import { timeParse, isoParse, nest, sum, timeFormat } from "d3";

import store from "@/store";

// Function to convert from the JHU data in wide form to long.
export function cleanEpi(data) {
  const parseDate = timeParse("%m/%d/%y");
  const formatDate = timeFormat("%m-%d-%y");

  data.forEach(row => {
    const metadata = {
      locationName:
        row["Province/State"] && row["Province/State"] !== ""
          ? row["Province/State"].trim()
          : row["Country/Region"].trim(),
      locationType:
        row["Province/State"] && row["Province/State"] !== ""
          ? "sub-national"
          : "country",
      country: row["Country/Region"].trim(),
      region: getRegion(row["Country/Region"]),
      lat: +row["Lat"],
      lon: +row["Long"]
    };
    metadata["id"] = cleanID(
      metadata["locationName"],
      metadata["locationType"]
    );

    delete row["Province/State"];
    delete row["Country/Region"];
    delete row["Lat"];
    delete row["Long"];

    // get array of all the dates to convert from wide --> long
    let dateArr = Object.keys(row);

    // check the data integrity. Often during Github update, the initial load is an empty new column.
    const dateToday = dateArr.slice(-1)[0];
    const badToday = data.map(d => row[dateToday]).every(d => d == "");

    if (badToday) {
      console.log("Deleting today's data: all null");
      dateArr.pop();
    }

    // convert from wide to long; save as `row['data']`
    // INNER DATA STRUCTURE
    row["data"] = dateArr.map(timepoint => {
      return {
        date: parseDate(timepoint),
        date_string: formatDate(parseDate(timepoint)),
        cases: +row[timepoint],
        coord: [metadata.lon, metadata.lat],
        id: metadata.id,
        locationType: metadata.locationType,
        locationName: metadata.locationName,
        // variables needed for nesting and/or filtering
        country: metadata.country,
        region: metadata.region
      };
    });

    //  remove wide data
    dateArr.forEach(timepoint => delete row[timepoint]);

    row["data"].sort((a, b) => a.date - b.date);

    // OUTER METADATA ABOUT THAT PLACE
    // pull out some global numbers for the case counts
    // first date when cases are > 0.
    const firstDate = row.data.filter(d => d.cases > 0).slice(0, 1);
    row["locationName"] = metadata.locationName;
    row["locationType"] = metadata.locationType;
    row["coord"] = [metadata.lat, metadata.lon];
    row["region"] = metadata.region;
    row["country"] = metadata.country;
    row["id"] = metadata.id;
    const last2 = row.data.slice(-2);
    row["numIncrease"] = last2[1].cases - last2[0].cases;
    row["pctIncrease"] = row.numIncrease / last2[0].cases;
    row["currentDate"] = last2[1].date;
    row["firstDate"] = firstDate.length ? firstDate[0]["date"] : null;
    row["newToday"] = row["firstDate"] === row["currentDate"];
    row["currentCases"] = last2[1].cases;
  });

  return data;
}

// Nest by a geographic aggreagtor (region, country, etc.) and then by date to get a cases / date.
export function nestEpiTrace(data, nestingVar, nestingType) {
  const formatDate = timeFormat("%m-%d-%y");
  if (data) {
    // nest by date
    const regionNest = nest()
      .key(d => d[nestingVar])
      .key(d => d.date)
      .rollup(values => {
        return {
          cases: sum(values, d => d.cases),
          subregions: values.map(d => d.locationName),
          region: values[0].region // should all be the same...
        };
      })
      .entries(data);

    regionNest.forEach(d => {
      // pull out variables
      d["locationName"] = d.key;
      d["id"] = cleanID(d.key, "region");
      d["data"] = d.values;
      d["subregions"] = d.data[0].value.subregions;
      d["region"] = d.data[0].value.region;
      d["locationType"] = nestingType;

      d.values.forEach(timepoint => {
        timepoint["id"] = d.id;
        timepoint["locationName"] = d.key;
        timepoint["locationType"] = nestingType;
        timepoint["date"] = isoParse(timepoint.key);
        timepoint["date_string"] = formatDate(timepoint.date);
        timepoint["cases"] = timepoint.value.cases;
        timepoint["region"] = timepoint.value.region;
        // cleanup
        delete timepoint.key;
        delete timepoint.value;
      });

      // calc variables
      const last2 = d.data.slice(-2);
      const firstDate = d.data.filter(d => d.cases > 0).slice(0, 1);
      d["numIncrease"] = last2[1].cases - last2[0].cases;
      d["pctIncrease"] = d.numIncrease / last2[0].cases;
      d["currentDate"] = last2[1].date;
      d["currentCases"] = last2[1].cases;
      d["firstDate"] = firstDate.length ? firstDate[0]["date"] : null;
      d["newToday"] = d["firstDate"] === d["currentDate"];

      // delete duplicates from nesting
      delete d["values"];
      delete d["key"];
    });

    return regionNest;
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
      obj["date"] = isoParse(d.key);

      d.values.forEach(value => {
        obj[value.key] = value.value;
      });

      return obj;
    });
    return nested;
  }
}

export function cleanID(id, type) {
  const cleaned = id
    .replace(/,\s/g, "_")
    .replace(/\s/g, "_")
    .replace(/\(/g, "_")
    .replace(/\)/g, "_")
    .replace(/\//g, "_");
  return `${cleaned}-${type}`;
}

export function getRegion(country) {
  const regionDict = store.state.geo.regionDict;

  const region = regionDict.filter(d => d.countries.includes(country));

  if (region.length === 1) {
    return region[0].region;
  }
}
