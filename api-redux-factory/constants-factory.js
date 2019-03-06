import { COMMON_STORE_KEY } from './constants';

/**
 * @typedef {Object} ApiReduxConstants
 * @property {String} SET_RESPONSE_ACTION_TYPE
 * @property {String} SET_FETCHING_ACTION_TYPE
 * @property {String} SET_ERROR_ACTION_TYPE
 * @property {String} CLEAR_ERROR_ACTION_TYPE
 * @property {String} CLEAR_RESPONSE_ACTION_TYPE
 * @property {String} COMMON_PATH - path from redux root to the api store
 */

/**
 * Returns an object containing set of important redux constants based on storeKey
 * for managing data retrieved via AJAX request
 * @param {Object} config
 * @param {Object} config.storeKey
 *  Name of the service retrieving remote data
 * @returns {ApiReduxConstants}
 */
export function constantsFactory({ storeKey }) {
  return {
    SET_RESPONSE_ACTION_TYPE: `API/RESPONSE/${storeKey}`,
    SET_FETCHING_ACTION_TYPE: `API/FETCHING/${storeKey}`,
    SET_ERROR_ACTION_TYPE: `API/ERROR/${storeKey}`,
    CLEAR_ERROR_ACTION_TYPE: `API/CLEAR_ERROR/${storeKey}`,
    CLEAR_RESPONSE_ACTION_TYPE: `API/CLEAR_RESPONSE/${storeKey}`,
    COMMON_PATH: `${COMMON_STORE_KEY}.${storeKey}`,
  };
}
