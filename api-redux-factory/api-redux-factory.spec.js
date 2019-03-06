import identity from 'lodash/identity';
import { reduce } from 'utils/tests/reducer.helper';
import { apiCallReduxFactory } from './index';

describe('apiCallReduxFactory', () => {
  let apiCall;

  beforeEach(() => {
    apiCall = jest.fn();
  });

  it('should create reducer, action creators and all selectors', () => {
    const result = apiCallReduxFactory({
      storeKey: 'test',
      apiCall,
    });

    expect(Object.keys(result)).toEqual(
      expect.arrayContaining([
        'reducer',
        'apiCallActionCreator',
        'fetchingStatusSelector',
        'dataSelector',
        'errorSelector',
      ]),
    );
  });

  it('apiCallActionCreator should change state properly when apiCall status is OK', async () => {
    const DATA = { ok: true };
    apiCall.mockImplementation(() => Promise.resolve(DATA));
    const { apiCallActionCreator, reducer, fetchingStatusSelector, dataSelector, errorSelector } = apiCallReduxFactory({
      storeKey: 'test',
      apiCall,
    });
    const dispatch = jest.fn();
    const getState = jest.fn();
    const promise = apiCallActionCreator()(dispatch, getState);
    let newState = reduce(reducer, dispatch);
    expect(fetchingStatusSelector(newState)).toEqual(true);
    await promise;
    newState = reduce(reducer, dispatch);
    expect(fetchingStatusSelector(newState)).toEqual(false);
    expect(dataSelector(newState)).toEqual(DATA);
    expect(errorSelector(newState)).not.toBeDefined();
  });

  it('apiCallAction should handle errors', async () => {
    const DATA = { ok: false };
    apiCall.mockImplementation(() => Promise.reject(DATA));
    const { apiCallActionCreator, reducer, fetchingStatusSelector, dataSelector, errorSelector } = apiCallReduxFactory({
      storeKey: 'test',
      apiCall,
      errorPayloadCreator: identity,
    });
    const dispatch = jest.fn();
    const getState = jest.fn();
    const promise = apiCallActionCreator()(dispatch, getState);
    let newState = reduce(reducer, dispatch);
    expect(fetchingStatusSelector(newState)).toEqual(true);
    await promise.catch(identity);
    newState = reduce(reducer, dispatch);
    expect(fetchingStatusSelector(newState)).toEqual(false);
    expect(dataSelector(newState)).not.toBeDefined();
    expect(errorSelector(newState)).toEqual(DATA);
  });

  it('should handle call with parameters', async () => {
    const DATA = { ok: true };
    apiCall.mockImplementation(() => Promise.resolve(DATA));
    const {
      apiCallActionCreator,
      reducer,
      fetchingStatusSelector,
      parametrizedSelector,
      dataSelector,
      errorSelector,
    } = apiCallReduxFactory({
      storeKey: 'test',
      apiCall,
      parametersMemoizator: () => 'test',
    });
    const dispatch = jest.fn();
    const getState = jest.fn();
    const params = { test: true };
    const promise = apiCallActionCreator(params)(dispatch, getState);
    let newState = reduce(reducer, dispatch);

    expect(parametrizedSelector(fetchingStatusSelector, params)(newState)).toEqual(true);
    await promise;
    newState = reduce(reducer, dispatch);
    expect(parametrizedSelector(fetchingStatusSelector, params)(newState)).toEqual(false);
    expect(parametrizedSelector(dataSelector, params)(newState)).toEqual(DATA);
    expect(parametrizedSelector(errorSelector, params)(newState)).not.toBeDefined();
  });

  it('should not fail if unknow action passed', () => {
    const { reducer } = apiCallReduxFactory({
      storeKey: 'test',
      apiCall,
      parametersMemoizator: () => 'test',
    });

    const newState = reducer(undefined, {type: 'unknown'});
    expect(newState).toEqual({ api: {} });
    const newestState = reducer(newState, { type: 'unknown' });
    expect(newestState).toBe(newState);
  });
});
