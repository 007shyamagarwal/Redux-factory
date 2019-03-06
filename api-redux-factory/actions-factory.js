/**
 * @typedef {Object} Action - redux action
 * @property {string} type
 * @property {*} payload
 *
 * @typedef {function(dispatch: Function, [getState: Function]): *} ThunkAction
 *
 * @typedef {Object} Actions
 * @property {Function} setFetching - sets the fetching status of a request
 * @property {Function} clearError - clears request stored error field
 * @property {Function} setData - sets fetched data manually
 * @property {Function} setError - sets fetched error manually
 * @property {Function} clearData - clears fetched data
 * @property {Function} apiCallActionCreator - action creator for ajax request
 */

import noop from 'lodash/noop';
import { constantsFactory } from './constants-factory';
import { parametrizedSelector } from './utils';
import { DEFAULT_PARAMS } from './constants';
import { selectorsFactory } from './selectors-factory';

/**
 * @param {Object} config.constants - action type constants
 * @param {function(*): string} config.memoizer - defines where to store our fetched data
 * @return {function(isFetching: boolean, paramenters: *[]): Action}
 */
function createSetFetchingStatusActionCreator(config) {
  const { constants, memoizer } = config;

  return (isFetching, parameters) => ({
    type: constants.SET_FETCHING_ACTION_TYPE,
    payload: { isFetching, parameters: memoizer(...parameters) },
  });
}

/**
 * @param {Object} config.constants - action type constants
 * @param {function(*): string} config.memoizer - defines where to store our fetched data
 * @return {function(parameters: *[]): Action}
 */
function createClearFetchingErrorActionCreator(config) {
  const { constants, memoizer } = config;

  return parameters => ({
    type: constants.CLEAR_ERROR_ACTION_TYPE,
    payload: { parameters: memoizer(...parameters) },
  });
}

/**
 * @param {Object} config.constants - action type constants
 * @param {function(*): string} config.memoizer - defines where to store our fetched data
 * @param {function(*): *} config.dataPayloadFormatter - formats response data before setting it into the store
 * @return {function(data: *, parameters: *[]): Action}
 */
function createSetFetchedDataActionCreator(config) {
  const { constants, memoizer, dataPayloadFormatter } = config;

  return (data, parameters) => ({
    type: constants.SET_RESPONSE_ACTION_TYPE,
    payload: {
      data: dataPayloadFormatter(data),
      rawData: data,
      parameters: memoizer(...parameters),
    },
  });
}

/**
 * @param {Object} config.constants - action type constants
 * @param {function(*): string} config.memoizer - defines where to store our fetched data
 * @param {function(*): *} config.errorPayloadCreator - formats error data before setting it into the store
 * @return {function(data: *, parameters: *[]): Action}
 */
function createSetFetchingErrorActionCreator(config) {
  const { constants, memoizer, errorPayloadCreator } = config;

  return (error, parameters) => ({
    type: constants.SET_ERROR_ACTION_TYPE,
    payload: { error: errorPayloadCreator(error), parameters: memoizer(...parameters) },
  });
}

/**
 * @param {Object} config.constants - action type constants
 * @param {function(*): string} config.memoizer - defines where to store our fetched data
 * @return {function(*): Action}
 */
function createClearFetchedDataActionCreator(config) {
  const { constants, memoizer } = config;

  return parameters => ({
    type: constants.CLEAR_RESPONSE_ACTION_TYPE,
    payload: { parameters: memoizer(...parameters) },
  });
}

/**
 * @param {Object} config.syncActions - sync redux action creators
 * @return {function(data: *, params: *[]): ThunkAction}
 */
function createAfterFetchThunkActionCreator(config) {
  const { syncActions } = config;

  return (data, params) => dispatch => {
    dispatch(syncActions.setFetching(false, params));
    dispatch(syncActions.clearError(params));
    dispatch(syncActions.setData(data, params));
  };
}

/**
 * @param {Object} config.syncActions - sync redux action creators
 * @return {function(data: *, params: *[]): ThunkAction}
 */
function createAfterErrorThunkActionCreator(config) {
  const { syncActions } = config;

  return (error, params) => dispatch => {
    dispatch(syncActions.setFetching(false, params));
    dispatch(syncActions.setError(error, params));
  };
}

/**
 * Returns an object containing all sync action creators
 * @param {Object} config - redux factory config with the addition of selectors and mapped memoize function
 * @return {Object}
 */
function syncActionsFactory(config) {
  const setFetching = createSetFetchingStatusActionCreator(config);
  const clearError = createClearFetchingErrorActionCreator(config);
  const setData = createSetFetchedDataActionCreator(config);
  const setError = createSetFetchingErrorActionCreator(config);
  const clearData = createClearFetchedDataActionCreator(config);

  return {
    setFetching,
    clearError,
    setData,
    setError,
    clearData,
  };
}

/**
 * Returns thunk action creator, which manages fetching state, errors and memoizes promises
 * @param {Object} config.selectors - redux selectors
 * @param {Object} config.syncActions - sync redux action creators
 * @param {function(*): string} config.memoizer - defines where to store our fetched data
 * @param {function(*): Promise<*>} config.apiCall - ajax request caller
 * @return {function(*): ThunkAction}
 */
function createApiCallThunkActionCreator(config) {
  const { memoizer, selectors, apiCall, syncActions } = config;
  const currentPromises = {};
  const doAfterFetch = createAfterFetchThunkActionCreator(config);
  const doAfterError = createAfterErrorThunkActionCreator(config);

  return (...params) => (dispatch, getState) => {
    const state = getState();
    const parameters = memoizer(...params);

    const fetching = parametrizedSelector(memoizer)(selectors.fetchingStatusSelector, params)(state);
    const rawData = parametrizedSelector(memoizer)(selectors.rawDataSelector, params)(state);

    if (!fetching && !rawData) {
      dispatch(syncActions.setFetching(true, params));

      currentPromises[parameters || DEFAULT_PARAMS] = apiCall(...params)
        .then(data => {
          currentPromises[parameters || DEFAULT_PARAMS] = null;

          dispatch(doAfterFetch(data, params));

          return Promise.resolve(data);
        })
        .catch(error => {
          currentPromises[parameters || DEFAULT_PARAMS] = null;

          dispatch(doAfterError(error, params));

          return Promise.reject(error);
        });
    } else if (rawData) {
      return Promise.resolve(rawData);
    }

    return currentPromises[parameters || DEFAULT_PARAMS];
  };
}

/**
 * Creates set of action creators for redux store data retrieved via AJAX request
 * @export
 * @param {Object} config - factory config
 * @param {Object} config.storeKey - name of the service retrieving remote data
 * @returns {Actions}
 */
export function actionsFactory(config) {
  const { parametersMemoizator } = config;

  const selectors = selectorsFactory(config);
  const constants = constantsFactory(config);
  const memoizer = typeof parametersMemoizator === 'function' ? parametersMemoizator : noop;

  const patchedConfig = {
    ...config,
    selectors,
    constants,
    memoizer,
  };

  const syncActions = syncActionsFactory(patchedConfig);

  patchedConfig.syncActions = syncActions;

  const apiCallActionCreator = createApiCallThunkActionCreator(patchedConfig);
  return {
    ...syncActions,
    apiCallActionCreator,
  };
}
