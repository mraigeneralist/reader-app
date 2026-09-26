/**
 * Switching appearance remounts the app, which resets navigation. Settings
 * records where to go back to, and the root layout returns there afterwards.
 */
let pending: string | null = null;

export const returnAfterThemeChange = (route: string) => {
  pending = route;
};

export const takeReturnRoute = () => {
  const route = pending;
  pending = null;
  return route;
};
