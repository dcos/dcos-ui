import React from "react";
import renderer from "react-test-renderer";
import NodesList from "#SRC/js/structs/NodesList";
import HealthUnit from "#SRC/js/structs/HealthUnit";

const mockCompositeState = {
  getNodesList: jest.fn()
};
jest.mock("#SRC/js/structs/CompositeState", function() {
  return mockCompositeState;
});

const mockUnitHealthStore = {
  getUnit: jest.fn(),
  getNode: jest.fn()
};
jest.mock("#SRC/js/stores/UnitHealthStore", function() {
  return mockUnitHealthStore;
});

const NodeBreadcrumbs = require("../NodeBreadcrumbs");

describe("NodeBreadcrumbs", function() {
  beforeEach(function() {
    mockCompositeState.getNodesList = jest.fn();
    mockUnitHealthStore.getUnit = jest.fn();
    mockUnitHealthStore.getNode = jest.fn();
  });

  it("renders without breadcrumbs", function() {
    const tree = renderer.create(<NodeBreadcrumbs />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it("renders with node breadcrumbs", function() {
    mockCompositeState.getNodesList.mockReturnValue(
      new NodesList({
        items: [
          {
            id: "e99adb4a-eee7-4e48-ba86-79cd061d2215-S1",
            hostname: "foo.bar.baz"
          }
        ]
      })
    );
    const tree = renderer
      .create(
        <NodeBreadcrumbs nodeID="e99adb4a-eee7-4e48-ba86-79cd061d2215-S1" />
      )
      .toJSON();

    expect(mockCompositeState.getNodesList).toHaveBeenCalled();
    expect(tree).toMatchSnapshot();
  });

  it("renders with taskID breadcrumbs", function() {
    const tree = renderer
      .create(
        <NodeBreadcrumbs taskID="super-nice-task-id" taskName="My Task" />
      )
      .toJSON();

    expect(tree).toMatchSnapshot();
  });

  it("renders with unitID breadcrumbs", function() {
    mockCompositeState.getNodesList.mockReturnValue(
      new NodesList({
        items: [
          {
            id: "e99adb4a-eee7-4e48-ba86-79cd061d2215-S1",
            hostname: "foo.bar.baz"
          }
        ]
      })
    );
    mockUnitHealthStore.getUnit.mockReturnValue(
      new HealthUnit({
        title: "MyUnit",
        hostname: "health-unit-hostname"
      })
    );
    mockUnitHealthStore.getNode.mockReturnValue({
      getHealth: jest.fn(function() {
        return {
          classNames: "green",
          title: "All green"
        };
      })
    });
    const tree = renderer
      .create(
        <NodeBreadcrumbs
          nodeID="e99adb4a-eee7-4e48-ba86-79cd061d2215-S1"
          unitID="unit-ids-are-nice"
        />
      )
      .toJSON();

    expect(mockUnitHealthStore.getUnit).toHaveBeenCalled();
    expect(mockUnitHealthStore.getNode).toHaveBeenCalled();

    expect(tree).toMatchSnapshot();
  });

  it("renders no unitID breadcrumbs without nodeID", function() {
    const tree = renderer
      .create(<NodeBreadcrumbs unitID="unit-ids-are-nice" />)
      .toJSON();

    expect(tree).toMatchSnapshot();
  });

  it("renders no node breadcrumbs if node cant be found", function() {
    mockCompositeState.getNodesList.mockReturnValue(
      new NodesList({
        items: []
      })
    );
    const tree = renderer
      .create(
        <NodeBreadcrumbs nodeID="e99adb4a-eee7-4e48-ba86-79cd061d2215-S1" />
      )
      .toJSON();

    expect(mockCompositeState.getNodesList).toHaveBeenCalled();
    expect(tree).toMatchSnapshot();
  });
});
