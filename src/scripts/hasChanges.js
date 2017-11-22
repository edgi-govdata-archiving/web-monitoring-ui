export default function hasChanges(diff) {
  const hasAdditions = !!diff.find(element => element[0] === 1);
  const hasRemovals = !!diff.find(element => element[0] === -1);

  return (hasAdditions || hasRemovals);
}
