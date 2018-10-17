import * as React from 'react';
import { shallow } from 'enzyme';

import { GraphParamsType, GraphType } from '../../../types/Graph';
import { Duration, EdgeLabelMode } from '../../../types/GraphFilter';
import Namespace from '../../../types/Namespace';

import GraphFilterToolbar from '../GraphFilterToolbar';

const PARAMS: GraphParamsType = {
  namespace: { name: 'itsio-system' },
  graphDuration: { value: 60 },
  graphLayout: { name: 'Cose' },
  edgeLabelMode: EdgeLabelMode.HIDE,
  graphType: GraphType.VERSIONED_APP,
  injectServiceNodes: false
};

describe('GraphPage test', () => {
  it('should propagate filter params change with correct value', () => {
    const onParamsChangeMockFn = jest.fn();
    const wrapper = shallow(
      <GraphFilterToolbar
        {...PARAMS}
        showSecurity={true}
        showUnusedNodes={false}
        isLoading={false}
        handleRefreshClick={jest.fn()}
      />
    );

    const toolbar = wrapper.instance() as GraphFilterToolbar;
    toolbar.handleUrlFilterChange = onParamsChangeMockFn;

    const newDuration: Duration = { value: 1800 };
    toolbar.handleDurationChange(newDuration); // simulate duration change
    const EXPECT2 = Object.assign({}, PARAMS, { graphDuration: newDuration });
    expect(onParamsChangeMockFn).toHaveBeenLastCalledWith(EXPECT2);

    const newNamespace: Namespace = { name: 'bookinfo' };
    toolbar.handleNamespaceChange(newNamespace); // simulate name change
    const EXPECT3 = Object.assign({}, PARAMS, { namespace: newNamespace });
    expect(onParamsChangeMockFn).toHaveBeenLastCalledWith(EXPECT3);
  });
});
