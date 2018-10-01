import { createSelector } from 'reselect';
import { KialiAppState } from './Store';

const activeNamespaceSelector = (state: KialiAppState) => state.namespaces.activeNamespace;

export const selectedNamespaceSelector = createSelector(
  activeNamespaceSelector,
  namespace => namespace // identity function
);
