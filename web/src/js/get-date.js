export const getBeforeDate = (date, month) => {
  date.setMonth(date.getMonth() + month);
  return date;
};
