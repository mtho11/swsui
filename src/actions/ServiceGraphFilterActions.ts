// Action Creators allow us to create typesafe utilities for dispatching actions
import { createAction } from 'typesafe-actions';

export enum ServiceGraphFilterActionsType {
  // Toggle Actions
  TOGGLE_GRAPH_NODE_LABEL = 'TOGGLE_GRAPH_NODE_LABEL',
  TOGGLE_GRAPH_EDGE_LABEL = 'TOGGLE_GRAPH_EDGE_LABEL',
  TOGGLE_GRAPH_CIRCUIT_BREAKERS = 'TOGGLE_GRAPH_CIRCUIT_BREAKERS',
  TOGGLE_GRAPH_ROUTE_RULES = 'TOGGLE_GRAPH_ROUTE_RULES',
  // Disable Actions
  DISABLE_GRAPH_LAYERS = 'DISABLE_GRAPH_LAYERS'
}

export const serviceGraphFilterActions = {
  // Toggle actions
  toggleGraphNodeLabel: createAction(ServiceGraphFilterActionsType.TOGGLE_GRAPH_NODE_LABEL),
  toggleGraphEdgeLabel: createAction(ServiceGraphFilterActionsType.TOGGLE_GRAPH_EDGE_LABEL),
  toggleGraphRouteRules: createAction(ServiceGraphFilterActionsType.TOGGLE_GRAPH_ROUTE_RULES),
  toggleGraphCircuitBreakers: createAction(ServiceGraphFilterActionsType.TOGGLE_GRAPH_CIRCUIT_BREAKERS),
  disableGraphLayers: createAction(ServiceGraphFilterActionsType.DISABLE_GRAPH_LAYERS, (value: boolean) => ({
    type: ServiceGraphFilterActionsType.DISABLE_GRAPH_LAYERS,
    payload: value
  }))
};
