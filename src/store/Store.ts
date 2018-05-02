// Store is the Redux Data store

// Various pages are described here with their various sections
export interface ServiceGraphFilterState {
  // Toggle props
  readonly showEdgeLabels: boolean;
  readonly showNodeLabels: boolean;
  readonly showCircuitBreakers: boolean;
  readonly showRouteRules: boolean;
  // disable the service graph layers
  readonly disableLayers: boolean;
}

// @todo: Add namespaces interface

// This defines the Kiali Global Application State
export interface KialiAppState {
  // page settings
  namespaces: any;
  serviceGraphFilterState: ServiceGraphFilterState;
}
