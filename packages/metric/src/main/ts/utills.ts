export const isPromise = (value: any) =>
  value instanceof Promise ||
  (typeof value?.then === 'function' && typeof value?.catch === 'function')
