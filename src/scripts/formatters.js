/*eslint-env commonjs*/

exports.dateFormatter = new Intl.DateTimeFormat('en-US', {
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  month: 'long',
  second: 'numeric',
  year: 'numeric',
  timeZoneName: 'short'
});

// If browser doesn't support Intl (i.e. Safari), then we manually import
// the intl polyfill and locale data.
if (!global.Intl) {
  require.ensure([
    'intl',
    'intl/locale-data/jsonp/en.js'
  ], function (require) {
    require('intl');
    require('intl/locale-data/jsonp/en.js');
  });
}


exports.formatMaintainers = maintainers => maintainers.map(maintainership => maintainership.name).join(', ');

exports.formatSites = tags => {
  const sitePrefix = 'site:';
  return tags
    .filter(tagging => tagging.name.startsWith(sitePrefix))
    .map(tagging => tagging.name.slice(sitePrefix.length))
    .join(', ');
};
