import {
  timeParse,
  isoParse,
  nest,
  sum, timeFormat
} from 'd3';

export function getRegion(country) {
  const regionDict = [{
      region: "Asia (outside China)",
      countries: ["Thailand", "Japan", "South Korea", "Taiwan", "Macau", "Hong Kong", "Singapore", "Vietnam",
        "Nepal", "Malaysia", "Cambodia", "Sri Lanka", "Philippines", "India", "Indonesia"
      ]
    },
    {
      region: "China",
      countries: ["Mainland China", ]
    },
    {
      region: "North America",
      countries: ["US", "Canada", "Mexico", "Dominican Republic"]
    },
    {
      region: "South America",
      countries: ["Brazil", "Ecuador"]
    },
    {
      region: "Europe",
      countries: ["Germany", "Finland", "France", "Croatia", "Austria", "Italy", "UK", "Russia", "Sweden", "Spain", "Belgium", "Switzerland", "Greece", "Georgia", "North Macedonia", "Norway",
        "Romania", "Denmark", "Estonia", "Netherlands", "San Marino", "Belarus", "Iceland", "Lithuania", "Ireland", "Luxembourg", "Monaco", "Azerbaijan", "Czech Republic", "Armenia", "Portugal", "Andorra", "Latvia"
      ]
    },
    {
      region: "Africa",
      countries: ["Algeria", "Nigeria", "Morocco", "Senegal"]
    },
    {
      region: "Diamond Princess Cruise",
      countries: ["Others", ]
    },
    {
      region: "Middle East",
      countries: ["Egypt", "Iran", "United Arab Emirates", "Israel", "Lebanon", "Iraq", "Oman", "Afghanistan", "Bahrain", "Kuwait", "Pakistan", "Qatar", "Saudi Arabia"]
    },
    {
      region: "Australia/Oceania",
      countries: ["Australia", "New Zealand"]
    }
  ];

  const region = regionDict.filter(d => d.countries.includes(country));

  if (region.length === 1) {
    return (region[0].region)
  }
}

export function cleanEpi(data) {

  const parseDate = timeParse("%m/%d/%y");
  // const parseD3Date = timeParse();

  data.forEach(d => {
    const metadata = {
      'province': d['Province/State'],
      'placeName': d['Province/State'],
      'country': d['Country/Region'],
      'region': getRegion(d['Country/Region']),
      id: d['Country/Region'].replace(/\s/g, "_"),
      lat: d["Lat"],
      lon: d["Long"]
    };
    delete d['Province/State'];
    delete d['Country/Region'];
    delete d['Lat'];
    delete d['Long'];
    const keys = Object.keys(d);

    d['data'] = keys.map(timepoint => {
      return ({
        "date_string": timepoint,
        "date": parseDate(timepoint),
        "cases": +d[timepoint],
        "country": metadata.country,
        "region": metadata.region,
        "id": `${metadata.country.replace(/\s/g, "_")}`
      })
    });

    keys.forEach(timepoint => delete d[timepoint]);

    d['data'].sort((a, b) => a.date - b.date);

    d['metadata'] = metadata;
    d['metadata']['currentCases'] = d.data.slice(-1)[0].cases;
  });

  console.log(data)
  return (data);
}

export function nestEpiTrace(data, nestingVar, nestingType) {
  const formatDate = timeFormat("%m-%d-%y")
  if (data) {
    // nest by date
    const regionNest = nest()
      .key(d => d[nestingVar])
      .key(d => d.date)
      .rollup(values => {
        return({
          cases: sum(values, d => d.cases),
          countries: values.map(d => d.country),
          region: values[0].region
         })
      })
      .entries(data);

    regionNest.forEach(d => {
      d['metadata'] = {};
      d['metadata']['placeName'] = d.key;
      d['metadata']['id'] = d.key.replace(/\s/g, "_");
      d.values.forEach(timepoint => {
      timepoint['id'] = d.metadata.id;
      timepoint['date'] = isoParse(timepoint.key);
      timepoint['date_string'] = formatDate(timepoint.date);
      timepoint['cases'] = timepoint.value.cases;
      })

      d['data'] = d.values;
      d['metadata']['currentCases'] = d.data.slice(-1)[0].cases;
      d['metadata']['countries'] = d.data[0].value.countries;
      d['metadata']['region'] = d.data[0].value.region;
      d['locationType'] = nestingType;
    })

    console.log(regionNest)

    return (regionNest);
  }
}

export function prep4Stacked(data, nestingVar) {
  if (data) {
    // nest by date
    const regionNest = nest()
      .key(d => d[nestingVar])
      .key(d => d.date)
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
  }
}
