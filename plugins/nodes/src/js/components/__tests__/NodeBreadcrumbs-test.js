import React from "react";
import renderer from "react-test-renderer";
import HealthUnit from "#SRC/js/structs/HealthUnit";

const mockMesosSummaryStore = {
  getLastSuccessfulSummarySnapshot: jest.fn(),
  addChangeListener: jest.fn()
};
jest.mock("#SRC/js/stores/MesosSummaryStore", function() {
  return mockMesosSummaryStore;
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
    mockMesosSummaryStore.getLastSuccessfulSummarySnapshot = jest.fn();
    mockUnitHealthStore.getUnit = jest.fn();
    mockUnitHealthStore.getNode = jest.fn();
  });

  it("renders without breadcrumbs", function() {
    const tree = renderer.create(<NodeBreadcrumbs />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it("renders with node breadcrumbs", function() {
    mockMesosSummaryStore.getLastSuccessfulSummarySnapshot.mockReturnValue({
      slaves: [
        {
          id: "e99adb4a-eee7-4e48-ba86-79cd061d2215-S1",
          hostname: "foo.bar.baz"
        }
      ]
    });
    const tree = renderer
      .create(
        <NodeBreadcrumbs nodeID="e99adb4a-eee7-4e48-ba86-79cd061d2215-S1" />
      )
      .toJSON();

    expect(
      mockMesosSummaryStore.getLastSuccessfulSummarySnapshot
    ).toHaveBeenCalled();
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
    mockMesosSummaryStore.getLastSuccessfulSummarySnapshot.mockReturnValue({
      slaves: [
        {
          id: "e99adb4a-eee7-4e48-ba86-79cd061d2215-S1",
          hostname: "foo.bar.baz"
        }
      ]
    });
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
    mockMesosSummaryStore.getLastSuccessfulSummarySnapshot.mockReturnValue({
      slaves: []
    });
    const tree = renderer
      .create(
        <NodeBreadcrumbs nodeID="e99adb4a-eee7-4e48-ba86-79cd061d2215-S1" />
      )
      .toJSON();

    expect(
      mockMesosSummaryStore.getLastSuccessfulSummarySnapshot
    ).toHaveBeenCalled();
    expect(tree).toMatchSnapshot();
  });
});
