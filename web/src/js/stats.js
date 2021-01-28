import {
  timeParse,
  timeDay,
  sum
} from "d3";

import { quantile } from "@stdlib/stats/base/dists/beta";

export function rollingAverage(df, all, dateVar = "date_time", numDays = 3) {
  const parseDate = timeParse("%Y-%m-%d");

  df.forEach(d => {
    d["dateTime"] = parseDate(d[dateVar]);
  })

  all.forEach(d => {
    d["dateTime"] = parseDate(d[dateVar]);
  })

  // Gotta calculate the date-time before doing the rollup
  df.forEach(d => {
    const upperDate = timeDay.offset(d.dateTime, numDays);
    const lowerDate = timeDay.offset(d.dateTime, -1 * numDays);
    const countRange = df.filter(d => d.dateTime <= upperDate && d.dateTime >= lowerDate);
    const allRange = all.filter(d => d.dateTime <= upperDate && d.dateTime >= lowerDate);
    d["countAverage"] = sum(countRange, x => x.n) / countRange.length;
    d["allAverage"] = sum(allRange, x => x.n) / allRange.length;
    let ci = calcCI(d.countAverage, d.allAverage);
    d["est"] = ci["est"];
    d["li"] = ci["lower"];
    d["ui"] = ci["upper"];
  })

  return (df)
}

export function calcCI(x, n) {
  const upper = quantile(0.975, x + 0.5, n - x + 0.5);
  const lower = quantile(0.025, x + 0.5, n - x + 0.5);
  const est = x / n;

  return ({
    est: est,
    lower: lower,
    upper: upper
  });
}
