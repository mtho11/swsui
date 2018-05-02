import { combineReducers } from 'redux';

import namespaces from './Namespaces';
import serviceGraphFilterState from './ServiceGraphFilterState';

const rootReducer = combineReducers({
  namespaces,
  serviceGraphFilterState: serviceGraphFilterState
});

export default rootReducer;
