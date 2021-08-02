export const getRelativeTimeDifference = (current, previous) => {
  const msPerSecond = 1000;
  const msPerMinute = 60 * msPerSecond;
  const msPerHour = msPerMinute * 60;
  const msPerDay = msPerHour * 24;
  const msPerMonth = msPerDay * 30;
  const msPerYear = msPerDay * 365;

  const elapsed = current - previous;

  if (elapsed <= msPerSecond) {
    return 'now';
  } else if (elapsed < msPerMinute / 5) {
    return 'a few seconds ago';
  } else if (elapsed < msPerMinute) {
    const relativeTime = Math.round(elapsed / msPerSecond);

    return `${relativeTime} second${relativeTime > 1 ? 's' : ''} ago`;
  } else if (elapsed < msPerHour) {
    const relativeTime = Math.round(elapsed / msPerMinute);

    return `${relativeTime} minute${relativeTime > 1 ? 's' : ''} ago`;
  } else if (elapsed < msPerDay) {
    const relativeTime = Math.round(elapsed / msPerHour);

    return `${relativeTime} hour${relativeTime > 1 ? 's' : ''} ago`;
  } else if (elapsed < msPerMonth) {
    const relativeTime = Math.round(elapsed / msPerDay);

    return `${relativeTime} day${relativeTime > 1 ? 's' : ''} ago`;
  } else if (elapsed < msPerYear) {
    const relativeTime = Math.round(elapsed / msPerMonth);

    return `${relativeTime} month${relativeTime > 1 ? 's' : ''} ago`;
  } else {
    const relativeTime = Math.round(elapsed / msPerYear);

    return `${relativeTime} year${relativeTime > 1 ? 's' : ''} ago`;
  }
};

export const getRelativeTime = (timestamp) => {
  return getRelativeTimeDifference(Date.now(), timestamp);
};