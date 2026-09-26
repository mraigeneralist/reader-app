const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

/** "3 Aug 2026" */
export const formatDate = (ts: number) => {
  const d = new Date(ts);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};

/** "8:12" (24-hour, as in the design) */
export const formatTime = (ts: number) => {
  const d = new Date(ts);
  return `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
};

export const isToday = (ts: number) => startOfDay(new Date(ts)) === startOfDay(new Date());

/** "today at 8:12", "yesterday at 21:40", "3 Aug 2026" */
export const relativeDay = (ts: number) => {
  const days = Math.round((startOfDay(new Date()) - startOfDay(new Date(ts))) / 86_400_000);
  if (days === 0) return `today at ${formatTime(ts)}`;
  if (days === 1) return `yesterday at ${formatTime(ts)}`;
  return formatDate(ts);
};
