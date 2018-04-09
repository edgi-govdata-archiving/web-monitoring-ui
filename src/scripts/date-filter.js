/*eslint-env commonjs*/

exports.loadDateFilter = () => {
  // HACK: We are using an arbitray cutoff here
  let dateFrom = '2016-11-01';

  if ('sessionStorage' in window) {
    dateFrom = sessionStorage.getItem('dateFrom') || dateFrom;
  }

  return dateFrom;
};

exports.setDateFilter = dateFrom => {
  if ('sessionStorage' in window) {
    sessionStorage.setItem('dateFrom', dateFrom);
  }
};