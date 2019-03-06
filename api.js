import axios from 'axios';
import get from 'lodash/get';
import moment from 'moment';

export const ENDPOINTS = {
  Login: '/login',
 
};
const axiosConfig =  { baseURL: window.location.origin } ;
const service = axios.create(axiosConfig);

export const applyMock = fn => fn(service);

function rethrowUncatchedErrors(res) {
  const { request = {} } = res;
  const errorData = get(res, 'data.error');
  const code = errorData ? ERROR_CODE : SUCCESS_CODE;
  return res;
}

export const api = {

  get: (url, config = {}, params) => {
    logFetchEvent(url, 'GET', START_CODE);

    return service.get(url, {
      params,
      responseType: 'json',
      transformResponse: [
        data => {
          const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
          return get(parsedData, 'results', parsedData);
        },
      ],
      ...config,
    })
      .then(rethrowUncatchedErrors)
      .catch(error => {
        logFetchEvent(url, 'GET', ERROR_CODE, error);
        return Promise.reject(error);
      });
  },

  /**
   * Performs get request and returns promise with additional method called cancel to undo the request
   * @param {string} url
   * @param config
   * @param {*} rest
   * @return {{...Promise, cancel: Function}}
   */
  getCancellable(url, config, ...rest) {
    const source = axios.CancelToken.source();

    const request = this.get(url, {
      ...config,
      cancelToken: source.token,
    }, ...rest);

    request.cancel = message => source.cancel(message);

    return request;
  },

  /**
   * Describes the required parameters for the api.post request
   * @param {string} url - An object containing the parameters
   * @param {any} data - The data that are to be used for the post request
   * @param {Object} config - The config that is to be used for the post request (https://github.com/axios/axios#request-config)
   * @param {string} analyticsModule - The analytics module name
   *
   * @returns {Promise}
   */
  post: (url, data, config, analyticsModule) => {
    logFetchEvent(url, 'POST', START_CODE);

    return service.post(url, data, config)
      .then(rethrowUncatchedErrors)
      .catch(error => {
        logFetchEvent(url, 'POST', ERROR_CODE, error);

        if (analyticsModule) {
          trackSystemError(`${analyticsModule}:${error.message}`);
        }
        return Promise.reject(error);
      });
  },

  /**
   * Describes the required parameters for the api.delete request
   * @param {string} url - An object containing the parameters
   * @param {any} data - The data that are to be used for the post request
   * @param {Object} config - The config that is to be used for the post request (https://github.com/axios/axios#request-config)
   * @param {string} analyticsModule - The analytics module name
   *
   * @returns {Promise}
   */
  delete: (url, data, config, analyticsModule) => {
    logFetchEvent(url, 'DELETE', START_CODE);

    return service.delete(url, data, config)
      .then(rethrowUncatchedErrors)
      .catch(error => {
        logFetchEvent(url, 'DELETE', ERROR_CODE, error);

        if (analyticsModule) {
          trackSystemError(`${analyticsModule}:${error.message}`);
        }
        return Promise.reject(error);
      });
  },

  _applyMock: fn => fn(service),
};
