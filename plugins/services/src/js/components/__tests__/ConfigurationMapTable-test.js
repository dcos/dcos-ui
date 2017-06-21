jest.dontMock("../ConfigurationMapEditAction");
jest.dontMock("../ConfigurationMapTable");
/* eslint-disable no-unused-vars */
const React = require("react");
const ReactDOM = require("react-dom");
/* eslint-enable no-unused-vars */
const TestUtils = require("react-addons-test-utils");
const JestUtil = require("../../../../../../src/js/utils/JestUtil");
const ConfigurationMapTable = require("../ConfigurationMapTable");

describe("ConfigurationMapTable", function() {
  it("should render a simple 1-row, 2-column dataset", function() {
    var instance = TestUtils.renderIntoDocument(
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

    var headerText = TestUtils.scryRenderedDOMComponentsWithTag(
      instance,
      "th"
    ).map(JestUtil.mapTextContent);
    var cellText = TestUtils.scryRenderedDOMComponentsWithTag(
      instance,
      "td"
    ).map(JestUtil.mapTextContent);

    expect(headerText).toEqual(["A", "B"]);
    expect(cellText).toEqual(["1", "2"]);
  });

  it("should accept custom `render` functions", function() {
    var instance = TestUtils.renderIntoDocument(
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

    var headerText = TestUtils.scryRenderedDOMComponentsWithTag(
      instance,
      "th"
    ).map(JestUtil.mapTextContent);
    var cellText = TestUtils.scryRenderedDOMComponentsWithTag(
      instance,
      "td"
    ).map(JestUtil.mapTextContent);

    expect(headerText).toEqual(["A", "B"]);
    expect(cellText).toEqual(["X", "Y"]);
  });

  it("should remove columns with `hideIfEmpty=true` column property", function() {
    var instance = TestUtils.renderIntoDocument(
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

    var headerText = TestUtils.scryRenderedDOMComponentsWithTag(
      instance,
      "th"
    ).map(JestUtil.mapTextContent);
    var cellText = TestUtils.scryRenderedDOMComponentsWithTag(
      instance,
      "td"
    ).map(JestUtil.mapTextContent);

    expect(headerText).toEqual(["A"]);
    expect(cellText).toEqual(["1"]);
  });

  it("should keep columns with `hideIfEmpty=false` column property", function() {
    var instance = TestUtils.renderIntoDocument(
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

    var headerText = TestUtils.scryRenderedDOMComponentsWithTag(
      instance,
      "th"
    ).map(JestUtil.mapTextContent);
    var cellText = TestUtils.scryRenderedDOMComponentsWithTag(
      instance,
      "td"
    ).map(JestUtil.mapTextContent);

    expect(headerText).toEqual(["A", "B"]);
    expect(cellText).toEqual(["1", "Not Configured"]);
  });

  it("should respect `placeholder` column property", function() {
    var instance = TestUtils.renderIntoDocument(
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

    var headerText = TestUtils.scryRenderedDOMComponentsWithTag(
      instance,
      "th"
    ).map(JestUtil.mapTextContent);
    var cellText = TestUtils.scryRenderedDOMComponentsWithTag(
      instance,
      "td"
    ).map(JestUtil.mapTextContent);

    expect(headerText).toEqual(["A", "B"]);
    expect(cellText).toEqual(["1", "(none)"]);
  });

  it("should properly handle defaults", function() {
    var instance = TestUtils.renderIntoDocument(
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

    var headerText = TestUtils.scryRenderedDOMComponentsWithTag(
      instance,
      "th"
    ).map(JestUtil.mapTextContent);
    var cellText = TestUtils.scryRenderedDOMComponentsWithClass(
      instance,
      "foo-bar"
    ).map(JestUtil.mapTextContent);

    expect(headerText).toEqual(["A", "B"]);
    expect(cellText).toEqual(["A", "B", "1", "2"]);
  });

  it("should add edit link column if onEditClick is provided", function() {
    var instance = TestUtils.renderIntoDocument(
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

    var headerText = TestUtils.scryRenderedDOMComponentsWithTag(
      instance,
      "th"
    ).map(JestUtil.mapTextContent);
    var editText = TestUtils.scryRenderedDOMComponentsWithClass(
      instance,
      "configuration-map-action"
    ).map(JestUtil.mapTextContent);

    expect(headerText).toEqual(["A", "B", ""]);
    expect(editText).toEqual(["", "Edit"]);
  });
});
