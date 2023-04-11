import { sum } from 'd3-array';
import { timeDay } from 'd3-time';
import { timeParse } from 'd3-time-format';

export const rollingAverage = (df, all, dateVar = 'date_time', numDays = 3) => {
  const parseDate = timeParse('%Y-%m-%d');

  df.forEach((d) => {
    d['dateTime'] = parseDate(d[dateVar]);
  });

  all.forEach((d) => {
    d['dateTime'] = parseDate(d[dateVar]);
  });

  // Gotta calculate the date-time before doing the rollup
  df.forEach((d) => {
    const upperDate = timeDay.offset(d.dateTime, numDays);
    const lowerDate = timeDay.offset(d.dateTime, -1 * numDays);
    const countRange = df.filter(
      (x) => x.dateTime <= upperDate && x.dateTime >= lowerDate,
    );
    const allRange = all.filter(
      (x) => x.dateTime <= upperDate && x.dateTime >= lowerDate,
    );
    const total = allRange.filter((x) => x.dateTime - d.dateTime === 0);
    // d["countVals"] = countRange;
    d['countAverage'] = sum(countRange, (x) => x.n) / 7;
    d['allAverage'] = sum(allRange, (x) => x.n) / 7;
    d['total'] = total.length === 1 ? total[0].n : 0;
    let ci = calcCI(d.countAverage, d.allAverage);
    d['est'] = ci['est'];
    d['li'] = ci['lower'];
    d['ui'] = ci['upper'];
  });

  return df;
};

export const calcPrevalence = (
  df,
  dateVariable = 'date',
  countVariable = 'lineage_count_rolling',
  totalVariable = 'total_count_rolling',
) => {
  const parseDate = timeParse('%Y-%m-%d');

  df.forEach((d) => {
    d['dateTime'] = parseDate(d[dateVariable]);
    let ci = calcCI(d[countVariable], d[totalVariable]);
    d['est'] = ci['est'];
    d['li'] = ci['lower'];
    d['ui'] = ci['upper'];
  });

  df.sort((a, b) => a.dateTime - b.dateTime);
  return df;
};

export const calcCI = (x, n) => {
  const upper = quantile(0.975, x + 0.5, n - x + 0.5);
  const lower = quantile(0.025, x + 0.5, n - x + 0.5);
  const est = x / n;

  return {
    est: est,
    lower: lower,
    upper: upper,
  };
};
