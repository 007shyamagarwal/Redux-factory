import get from 'lodash/get';
import identity from 'lodash/identity';
import { constantsFactory } from './constants-factory';
import { COMMON_STORE_KEY } from './constants';
import { changeFieldValueWithParams } from './utils';

/**
 * Creates store data creator for setData action
 * @param {Object} extendedConfig
 * @param {ApiReduxConstants} constants
 * @param {string} storeKey
 * @return {function(state: Object, action: Action): Object}
 */
function createNewResponseDataCreator({ constants, storeKey }) {
  return (state, action) => ({
    ...state,
    [COMMON_STORE_KEY]: {
      ...state[COMMON_STORE_KEY],
      [storeKey]: changeFieldValueWithParams(
        {
          prev: get(state, constants.COMMON_PATH),
          params: action.payload.parameters,
        },
        {
          value: action.payload.data,
          key: 'data',
        },
        {
          value: action.payload.rawData,
          key: 'rawData',
        },
      ),
    },
  });
}

/**
 * Creates store data creator for setFetching action
 * @param {Object} extendedConfig
 * @param {ApiReduxConstants} constants
 * @param {string} storeKey
 * @return {function(state: Object, action: Action): Object}
 */
function createNewFetchingStatusCreator({ storeKey, constants }) {
  return (state, action) => ({
    ...state,
    [COMMON_STORE_KEY]: {
      ...state[COMMON_STORE_KEY],
      [storeKey]: changeFieldValueWithParams({
        prev: get(state, constants.COMMON_PATH),
        value: Boolean(action.payload.isFetching),
        key: 'fetching',
        params: action.payload.parameters,
      }),
    },
  });
}

/**
 * Creates store data creator for setError action
 * @param {Object} extendedConfig
 * @param {ApiReduxConstants} constants
 * @param {string} storeKey
 * @return {function(state: Object, action: Action): Object}
 */
function createNewErrorDataCreator({ storeKey, constants }) {
  return (state, action) => ({
    ...state,
    [COMMON_STORE_KEY]: {
      ...state[COMMON_STORE_KEY],
      [storeKey]: changeFieldValueWithParams({
        prev: get(state, constants.COMMON_PATH),
        value: action.payload.error,
        key: 'error',
        params: action.payload.parameters,
      }),
    },
  });
}

/**
 * Creates store data creator for clearError action
 * @param {Object} extendedConfig
 * @param {ApiReduxConstants} constants
 * @param {string} storeKey
 * @return {function(state: Object, action: Action): Object}
 */
function createNewErrorDataCleaner({ constants, storeKey }) {
  return (state, action) => ({
    ...state,
    [COMMON_STORE_KEY]: {
      ...state[COMMON_STORE_KEY],
      [storeKey]: changeFieldValueWithParams({
        prev: get(state, constants.COMMON_PATH),
        value: undefined,
        key: 'error',
        params: action.payload.parameters,
      }),
    },
  });
}

/**
 * Creates store data creator for clearData action
 * @param {Object} extendedConfig
 * @param {ApiReduxConstants} constants
 * @param {string} storeKey
 * @return {function(state: Object, action: Action): Object}
 */
function createNewResponseDataCleaner({ storeKey, constants }) {
  return (state, action) => ({
    ...state,
    [COMMON_STORE_KEY]: {
      ...state[COMMON_STORE_KEY],
      [storeKey]: changeFieldValueWithParams({
        prev: get(state, constants.COMMON_PATH),
        value: undefined,
        key: 'data',
        params: action.payload.parameters,
      }),
    },
  });
}

/**
 * Returns a reducer for newly created store api
 * @param {ApiReduxConfig} config
 * @return {function(state: Object, action: Action)}
 */
export function reducerFactory(config) {
  const constants = constantsFactory(config);
  const extendedConfig = {
    ...config,
    constants,
  };

  const fastAccessReducerObject = {
    [constants.SET_RESPONSE_ACTION_TYPE]: createNewResponseDataCreator(extendedConfig),
    [constants.SET_FETCHING_ACTION_TYPE]: createNewFetchingStatusCreator(extendedConfig),
    [constants.SET_ERROR_ACTION_TYPE]: createNewErrorDataCreator(extendedConfig),
    [constants.CLEAR_ERROR_ACTION_TYPE]: createNewErrorDataCleaner(extendedConfig),
    [constants.CLEAR_RESPONSE_ACTION_TYPE]: createNewResponseDataCleaner(extendedConfig),
  };

  return (state = { api: {} }, action) =>
    (fastAccessReducerObject[action.type] || identity)(state, action);
}
