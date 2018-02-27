const React = require("react");
const renderer = require("react-test-renderer");

const PlacementConstraintsField = require("../PlacementConstraintsField")
  .default;

describe("PlacementConstraintsField", function() {
  it("renders with value column", () => {
    const result = renderer
      .create(
        <PlacementConstraintsField
          constraint={{ operator: "LIKE", fieldName: "hostname" }}
          index={3}
          hideValueColumn={false}
          isLastField={false}
          onRemoveItem={jest.fn()}
        />
      )
      .toJSON();
    expect(result).toMatchSnapshot();
  });

  it("renders without value column", () => {
    const result = renderer
      .create(
        <PlacementConstraintsField
          constraint={{ operator: "LIKE", fieldName: "hostname" }}
          index={3}
          hideValueColumn={true}
          isLastField={false}
          onRemoveItem={jest.fn()}
        />
      )
      .toJSON();
    expect(result).toMatchSnapshot();
  });

  it("renders as first field", () => {
    const result = renderer
      .create(
        <PlacementConstraintsField
          constraint={{ operator: "LIKE", fieldName: "hostname" }}
          index={0}
          hideValueColumn={false}
          isLastField={false}
          onRemoveItem={jest.fn()}
        />
      )
      .toJSON();
    expect(result).toMatchSnapshot();
  });

  it("renders as last field", () => {
    const result = renderer
      .create(
        <PlacementConstraintsField
          constraint={{ operator: "LIKE", fieldName: "hostname" }}
          index={3}
          hideValueColumn={false}
          isLastField={true}
          onRemoveItem={jest.fn()}
        />
      )
      .toJSON();
    expect(result).toMatchSnapshot();
  });
});
