import orderBy from 'lodash/orderBy';
import flatten from 'lodash/flatten';
import { registerReducer } from 'rendering-engine-core/dist/app/store/reducer';
import { apiCallReduxFactory } from 'core/api/api-redux-factory';
import { getFAQ } from 'core/api';

/**
 * Fetches the FAQ content for the whole list of given categories and sorts the response
 * @param {string[]} categories - names of categories to fetch
 * @param {string} language
 * @param {string} urlprefix - API service url, prepended at server side
 * @return {Promise}
 */
function fetchFAQByCategories(categories, language, urlprefix) {
  return Promise.all(
    categories.map(category => getFAQ(
      {
        category,
        language,
      },
      urlprefix,
    ),
    ),
  ).then(data => orderBy(flatten(data), 'popularity', 'desc'));
}

const {
  reducer,
  apiCallActionCreator: fetchFAQData,
  dataSelector: faqDataSelector,
  errorSelector: faqErrorSelector,
  fetchingStatusSelector: faqFetchingStatusSelector,
} = apiCallReduxFactory({
  apiCall: fetchFAQByCategories,
  storeKey: 'faq',
});

export { reducer, fetchFAQData, faqDataSelector, faqErrorSelector, faqFetchingStatusSelector };
registerReducer('api', reducer);
