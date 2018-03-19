import React from "react";
import { mount } from "enzyme";

const EmptyStates = require("#SRC/js/constants/EmptyStates");
const ConfigurationMapTable = require("../ConfigurationMapTable");

function mapValuesOfType(instance, type) {
  return instance.find(type).map(function(item) {
    return item.text();
  });
}

describe("ConfigurationMapTable", function() {
  it("renders a simple 1-row, 2-column dataset", function() {
    const instance = mount(
      <ConfigurationMapTable
        columns={[
          {
            heading: "A",
            prop: "a"
          },
          {
            heading: "B",
            prop: "b"
          }
        ]}
        data={[{ a: 1, b: 2 }]}
      />
    );

    const headerText = mapValuesOfType(instance, "th");
    const cellText = mapValuesOfType(instance, "td");

    expect(headerText).toEqual(["A", "B"]);
    expect(cellText).toEqual(["1", "2"]);
  });

  it("accepts custom `render` functions", function() {
    const instance = mount(
      <ConfigurationMapTable
        columns={[
          {
            heading: "A",
            prop: "a",
            render() {
              return "X";
            }
          },
          {
            heading: "B",
            prop: "b",
            render() {
              return "Y";
            }
          }
        ]}
        data={[{ a: 1, b: 2 }]}
      />
    );

    const headerText = mapValuesOfType(instance, "th");
    const cellText = mapValuesOfType(instance, "td");

    expect(headerText).toEqual(["A", "B"]);
    expect(cellText).toEqual(["X", "Y"]);
  });

  it("removes columns with `hideIfEmpty=true` column property", function() {
    const instance = mount(
      <ConfigurationMapTable
        columns={[
          {
            heading: "A",
            prop: "a"
          },
          {
            heading: "B",
            prop: "b",
            hideIfEmpty: true
          }
        ]}
        data={[{ a: 1, b: null }]}
      />
    );

    const headerText = mapValuesOfType(instance, "th");
    const cellText = mapValuesOfType(instance, "td");

    expect(headerText).toEqual(["A"]);
    expect(cellText).toEqual(["1"]);
  });

  it("keeps columns with `hideIfEmpty=false` column property", function() {
    const instance = mount(
      <ConfigurationMapTable
        columns={[
          {
            heading: "A",
            prop: "a"
          },
          {
            heading: "B",
            prop: "b",
            hideIfEmpty: false
          }
        ]}
        data={[{ a: 1, b: null }]}
      />
    );

    const headerText = mapValuesOfType(instance, "th");
    const cellText = mapValuesOfType(instance, "td");

    expect(headerText).toEqual(["A", "B"]);
    expect(cellText).toEqual(["1", EmptyStates.CONFIG_VALUE]);
  });

  it("respects `placeholder` column property", function() {
    const instance = mount(
      <ConfigurationMapTable
        columns={[
          {
            heading: "A",
            prop: "a"
          },
          {
            heading: "B",
            prop: "b",
            placeholder: "(none)"
          }
        ]}
        data={[{ a: 1, b: null }]}
      />
    );

    const headerText = mapValuesOfType(instance, "th");
    const cellText = mapValuesOfType(instance, "td");

    expect(headerText).toEqual(["A", "B"]);
    expect(cellText).toEqual(["1", "(none)"]);
  });

  it("handles defaults", function() {
    const instance = mount(
      <ConfigurationMapTable
        columns={[
          {
            heading: "A",
            prop: "a"
          },
          {
            heading: "B",
            prop: "b"
          }
        ]}
        columnDefaults={{
          className: "foo-bar"
        }}
        data={[{ a: 1, b: 2 }]}
      />
    );

    const headerText = mapValuesOfType(instance, "th");
    const cellText = mapValuesOfType(instance, ".foo-bar");

    expect(headerText).toEqual(["A", "B"]);
    expect(cellText).toEqual(["A", "B", "1", "2"]);
  });

  it("adds edit link column if onEditClick is provided", function() {
    const instance = mount(
      <ConfigurationMapTable
        onEditClick={function() {}}
        columns={[
          {
            heading: "A",
            prop: "a"
          },
          {
            heading: "B",
            prop: "b"
          }
        ]}
        columnDefaults={{
          className: "foo-bar"
        }}
        data={[{ a: 1, b: 2 }]}
      />
    );

    const headerText = mapValuesOfType(instance, "th");
    const editText = mapValuesOfType(instance, ".configuration-map-action");

    expect(headerText).toEqual(["A", "B", ""]);
    expect(editText).toEqual(["", "Edit"]);
  });
});
