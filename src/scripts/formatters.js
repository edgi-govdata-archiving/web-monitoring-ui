export const dateFormatter = new Intl.DateTimeFormat('en-US', {
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  month: 'long',
  second: 'numeric',
  year: 'numeric',
  timeZoneName: 'short'
});
