import get from 'lodash/get';
import noop from 'lodash/noop';

/**
 * Maps given memoizer and returns function, which maps selector with given parameters
 * @param {function(*): string} memoizer
 * @return {function(selector: Selector, parameters: *[]): Selector}
 */
export const parametrizedSelector = memoizer =>
  (selector, parameters) =>
    state =>
      (memoizer === noop
        ? selector(state)
        : get(selector(state), memoizer(parameters)));

/**
 * @typedef {Object} KeysToAdd
 * @property {string} key - property which is going to be replaced
 * @property {*} value - value to be saved
 *
 * Used inside reducer to set multiple values into the store keys
 *
 * @param {Object} settings
 * @param {string} settings.params - serialized params, describing the key where to store the memoized data
 * @param {string} settings.key - property which is going to be replaced
 * @param {*} settings.value - value to be saved
 * @param {Object} settings.prev - prev store value
 * @param {...{KeysToAdd}} additionalKeys - addtional keys to be set
 * @return {Object} - new state slice
 */
export function changeFieldValueWithParams({ params, key, value, prev }, ...additionalKeys) {
  const iterator = arguments.length === 1 ? [{ key, value }] : [...additionalKeys];

  return iterator.reduce(
    (res, field) => (params
      ? {
        ...res,
        [field.key]: {
          ...get(prev, field.key),
          [params]: field.value,
        },
      }
      : {
        ...res,
        [field.key]: field.value,
      }),
    prev,
  );
}
