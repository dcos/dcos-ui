import * as React from "react";
import { mount } from "enzyme";
import ConfigurationMapTable from "../ConfigurationMapTable";

import { EmptyStates } from "#SRC/js/constants/EmptyStates";

function mapValuesOfType(instance, type) {
  return instance.find(type).map(item => item.text());
}

describe("ConfigurationMapTable", () => {
  it("renders a simple 1-row, 2-column dataset", () => {
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

  it("accepts custom `render` functions", () => {
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

  it("removes columns with `hideIfEmpty=true` column property", () => {
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

  it("keeps columns with `hideIfEmpty=false` column property", () => {
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

  it("respects `placeholder` column property", () => {
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

  it("handles defaults", () => {
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

  it("adds edit link column if onEditClick is provided", () => {
    const instance = mount(
      <ConfigurationMapTable
        onEditClick={() => {}}
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
