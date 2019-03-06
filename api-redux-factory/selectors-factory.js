import get from 'lodash/get';
import { constantsFactory } from './constants-factory';

/**
 * Redux state selector. Use second param if you'd like to select memoized data according to them
 * @typedef {function(state: Object, [params: *[]]): *} Selector
 *
 * All selectors have one thing in common: they all take the same 2 arguments.
 * The first is for redux state, and the second is used only if you'd like to
 * @typedef {Object} Selectors
 * @property {ThunkAction} fetchingStatusSelector - selects
 * @property {Selector} dataSelector - selects formatted data from store
 * @property {Selector} errorSelector - selects error data from store
 * @property {Selector} rawDataSelector - selects data as it has been received from server
 * @property {Selector} fetchingStatusSelector - selects fetchingStatus. Returns boolean
 */

/**
 * Creates set of selectors for redux store data retrieved via AJAX request
 * @param {Object} config - redux factory config. See the redux factory for more information
 * @returns {Selectors}
 */
export function selectorsFactory(config) {
  const constants = constantsFactory(config);
  const fetchingStatusSelector = state => get(state, `${constants.COMMON_PATH}.fetching`);
  const dataSelector = state => get(state, `${constants.COMMON_PATH}.data`);
  const rawDataSelector = state => get(state, `${constants.COMMON_PATH}.rawData`);
  const errorSelector = state => get(state, `${constants.COMMON_PATH}.error`);
  return {
    fetchingStatusSelector,
    dataSelector,
    errorSelector,
    rawDataSelector,
  };
}
