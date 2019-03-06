import { reducer as reactResponsiveReducer } from 'react-responsive-redux';

const syncReducers = [{ name: 'responsive', reducer: reactResponsiveReducer }];
const asyncReducers = [];

export default function rootReducer(state = {}, action) {
  const syncReducersStateChange = syncReducers.reduce(
    (currState, { reducer, name }) => ({
      ...currState,
      [name]: reducer(currState[name], action),
    }),
    state
  );

  return asyncReducers.reduce((currState, reducer) => reducer(currState, action), syncReducersStateChange);
}

export function registerReducer(name, reducer) {
  asyncReducers.push(reducer);
}
