import serviceGraphFilterState from '../ServiceGraphFilterState';
import { ServiceGraphFilterActionKeys } from '../../actions/ServiceGraphFilterActions';

describe('ServiceGraphFilterState reducer', () => {
  it('should return the initial state', () => {
    expect(serviceGraphFilterState(undefined, {})).toEqual({
      showNodeLabels: true,
      showEdgeLabels: false,
      showCircuitBreakers: false,
      showRouteRules: true,
      disableLayers: false
    });
  });

  it('should handle TOGGLE_GRAPH_NODE_LABEL', () => {
    expect(
      serviceGraphFilterState(
        {
          showNodeLabels: true,
          showEdgeLabels: true,
          showCircuitBreakers: false,
          showRouteRules: true,
          disableLayers: false
        },
        {
          type: ServiceGraphFilterActionKeys.TOGGLE_GRAPH_NODE_LABEL
        }
      )
    ).toEqual({
      showNodeLabels: false,
      showEdgeLabels: true,
      showCircuitBreakers: true,
      showRouteRules: true,
      disableLayers: false
    });
  });

  it('should handle TOGGLE_GRAPH_EDGE_LABEL', () => {
    expect(
      serviceGraphFilterState(
        {
          showNodeLabels: true,
          showEdgeLabels: true,
          showCircuitBreakers: true,
          showRouteRules: true,
          disableLayers: false
        },
        {
          type: ServiceGraphFilterActionKeys.TOGGLE_GRAPH_EDGE_LABEL
        }
      )
    ).toEqual({
      showNodeLabels: true,
      showEdgeLabels: false,
      showCircuitBreakers: true,
      showRouteRules: true,
      disableLayers: false
    });
  });
});
