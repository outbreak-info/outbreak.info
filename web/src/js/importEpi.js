import {
  timeParse,
  isoParse,
  nest,
  sum
} from 'd3';

export function getRegion(country) {
  const regionDict = [{
      region: "Asia (outside China)",
      countries: ["Thailand", "Japan", "South Korea", "Taiwan", "Macau", "Hong Kong", "Singapore", "Vietnam",
        "Nepal", "Malaysia", "Cambodia", "Sri Lanka", "Philippines", "India"
      ]
    },
    {
      region: "China",
      countries: ["Mainland China", ]
    },
    {
      region: "North America",
      countries: ["US", "Canada", ]
    },
    {
      region: "South America",
      countries: ["Brazil"]
    },
    {
      region: "Europe",
      countries: ["Germany", "Finland", "France", "Croatia", "Austria", "Italy", "UK", "Russia", "Sweden", "Spain", "Belgium", "Switzerland", "Greece", "Georgia", "North Macedonia", "Norway",
        "Romania"
      ]
    },
    {
      region: "Africa",
      countries: ["Algeria", ]
    },
    {
      region: "Diamond Princess Cruise",
      countries: ["Others", ]
    },
    {
      region: "Middle East",
      countries: ["Egypt", "Iran", "United Arab Emirates", "Israel", "Lebanon", "Iraq", "Oman", "Afghanistan", "Bahrain", "Kuwait", "Pakistan"]
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

export function nestEpi(data, nestingVar) {
  if (data) {
    // nest by date
    const regionNest = nest()
      .key(d => d.date)
      .key(d => d[nestingVar])
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
    console.log(nested)
    return (nested);
  }
}
