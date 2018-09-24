import { createSelector } from 'reselect';
import { KialiAppState } from './Store';
// These memoirized selectors are from Redux Reselect package

// select the proper field from Redux State
const activeNamespaceSelector = (state: KialiAppState) => state.namespaces.activeNamespace;

// Select from the above field(s) and the last function is the formatter
export const selectedNamespaceSelector = createSelector(
  activeNamespaceSelector,
  namespace => namespace.name // identity function in this case, but with a property
);
