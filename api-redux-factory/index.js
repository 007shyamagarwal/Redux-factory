import identity from 'lodash/identity';
import { actionsFactory } from './actions-factory';
import { selectorsFactory } from './selectors-factory';
import { parametrizedSelector } from './utils';
import { reducerFactory } from './reducer-factory';

/**
 * Universal redux API call factory. Creates all needed reducers, action creators and selectors for given config
 *
 * @typedef {Object} ApiReduxConfig
 * @property {function(*): Promise<*>} apiCall - function which makes an API call on the server and returns promise
 * @property {string} storeKey - all store data will be stored in path `api.${storeKey}`
 * @property {[function(*) :*]} dataPayloadFormatter
 *  function which gives a control over how response data should be saved at store. Defaults to identity
 * @property {[function(*): *]} errorPayloadCreator
 *  function which gives a control over how error data should be saved at store. Returns true by default
 * @property {[function(apiCallParams: *): string]} parametersMemoizator
 *  function which controls the serialization of a request. By default any params are considered to be the same
 *
 * @param {ApiReduxConfig} config
 * @return {{
 *  parametrizedSelector: function(selector: Function, params): function(state: Object): *,
 *   Used to map given selector on request params. Returns a new selector, which will return the memoized value
 *  reducer: function(state: Object, action: Action): Object,
 *   Reducer for new api calls. Handles fetching, new data set, error set, etc
 *  ...actions: Actions,
 *   Redux action creators for newly created reducer. See actions factory for more information
 *  ...selectors: Selectors,
 *   Selector functions which return slice of state with given params. See selectos factory for more information
 * }}
 */
export function apiCallReduxFactory({
  apiCall,
  storeKey,
  dataPayloadFormatter = identity,
  errorPayloadCreator = () => true,
  parametersMemoizator,
}) {
  const config = {
    apiCall,
    storeKey,
    dataPayloadFormatter,
    errorPayloadCreator,
    parametersMemoizator,
  };
  const actions = actionsFactory(config);
  const selectors = selectorsFactory(config);
  const reducer = reducerFactory(config);

  return {
    ...actions,
    ...selectors,
    parametrizedSelector: parametrizedSelector(parametersMemoizator),
    reducer,
  };
}
