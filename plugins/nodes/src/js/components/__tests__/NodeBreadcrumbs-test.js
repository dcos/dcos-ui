import React from "react";
import renderer from "react-test-renderer";
import HealthUnit from "#SRC/js/structs/HealthUnit";
import Node from "#SRC/js/structs/Node";

const mockUnitHealthStore = {
  getUnit: jest.fn(),
  getNode: jest.fn()
};
jest.mock("#SRC/js/stores/UnitHealthStore", () => mockUnitHealthStore);

const NodeBreadcrumbs = require("../NodeBreadcrumbs");

describe("NodeBreadcrumbs", () => {
  beforeEach(() => {
    mockUnitHealthStore.getUnit = jest.fn();
    mockUnitHealthStore.getNode = jest.fn();
  });

  it("renders without breadcrumbs", () => {
    const tree = renderer.create(<NodeBreadcrumbs />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it("renders with node breadcrumbs", () => {
    const node = new Node({
      id: "e99adb4a-eee7-4e48-ba86-79cd061d2215-S1",
      hostname: "foo.bar.baz"
    });
    const tree = renderer.create(<NodeBreadcrumbs node={node} />).toJSON();

    expect(tree).toMatchSnapshot();
  });

  it("renders with taskID breadcrumbs", () => {
    const node = new Node({
      id: "e99adb4a-eee7-4e48-ba86-79cd061d2215-S1",
      hostname: "foo.bar.baz"
    });
    const tree = renderer
      .create(
        <NodeBreadcrumbs
          taskID="super-nice-task-id"
          taskName="My Task"
          node={node}
        />
      )
      .toJSON();

    expect(tree).toMatchSnapshot();
  });

  it("renders with unitID breadcrumbs", () => {
    const node = new Node({
      id: "e99adb4a-eee7-4e48-ba86-79cd061d2215-S1",
      hostname: "foo.bar.baz"
    });
    mockUnitHealthStore.getUnit.mockReturnValue(
      new HealthUnit({
        title: "MyUnit",
        hostname: "health-unit-hostname"
      })
    );
    mockUnitHealthStore.getNode.mockReturnValue({
      getHealth: jest.fn(() => ({
        classNames: "green",
        title: "All green"
      }))
    });
    const tree = renderer
      .create(<NodeBreadcrumbs node={node} unitID="unit-ids-are-nice" />)
      .toJSON();

    expect(mockUnitHealthStore.getUnit).toHaveBeenCalled();
    expect(mockUnitHealthStore.getNode).toHaveBeenCalled();

    expect(tree).toMatchSnapshot();
  });

  it("renders no unitID breadcrumbs without nodeID", () => {
    const tree = renderer
      .create(<NodeBreadcrumbs unitID="unit-ids-are-nice" />)
      .toJSON();

    expect(tree).toMatchSnapshot();
  });
});
