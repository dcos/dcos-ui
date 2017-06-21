jest.dontMock("../FilterBar");

const React = require("react");
const TestUtils = require("react-addons-test-utils");

const FilterBar = require("../FilterBar");

describe("FilterBar", function() {
  describe("FilterBar with left-align items", function() {
    beforeEach(function() {
      this.instance = TestUtils.renderIntoDocument(
        <FilterBar>
          <div>0</div>
          <div>1</div>
          <div>2</div>
        </FilterBar>
      );
    });

    describe("#getFilterItems", function() {
      it('wraps items in array with "filter-bar-item"', function() {
        const filterItems = this.instance.getFilterItems(
          React.Children.toArray(this.instance.props.children)
        );

        expect(filterItems.length).toEqual(3);
        expect(
          filterItems.reduce(function(hasClass, item) {
            return hasClass && item.props.className === "filter-bar-item";
          }),
          true
        ).toEqual(true);
      });
    });

    it("renders all items left-aligned", function() {
      const filterBarLeft = TestUtils.findRenderedDOMComponentWithClass(
        this.instance,
        "filter-bar-left"
      );

      expect(filterBarLeft.children.length).toEqual(3);
    });

    it("renders no items right-aligned", function() {
      const filterBarRight = TestUtils.scryRenderedDOMComponentsWithClass(
        this.instance,
        "filter-bar-right"
      );

      expect(filterBarRight.length).toEqual(0);
    });
  });

  describe("FilterBar with left- and right-align items", function() {
    beforeEach(function() {
      this.instance = TestUtils.renderIntoDocument(
        <FilterBar rightAlignLastNChildren={2}>
          <div>0</div>
          <div>1</div>
          <div>2</div>
          <div>3</div>
        </FilterBar>
      );
    });

    it("renders some items left-aligned", function() {
      const filterBarLeft = TestUtils.findRenderedDOMComponentWithClass(
        this.instance,
        "filter-bar-left"
      );

      expect(filterBarLeft.children.length).toEqual(2);
    });

    it("renders some items right-aligned", function() {
      const filterBarRight = TestUtils.findRenderedDOMComponentWithClass(
        this.instance,
        "filter-bar-right"
      );

      expect(filterBarRight.children.length).toEqual(2);
    });
  });

  describe("FilterBar with right-align items", function() {
    beforeEach(function() {
      this.instance = TestUtils.renderIntoDocument(
        <FilterBar rightAlignLastNChildren={3}>
          <div>0</div>
          <div>1</div>
          <div>2</div>
        </FilterBar>
      );
    });

    it("renders no items left-aligned", function() {
      const filterBarLeft = TestUtils.scryRenderedDOMComponentsWithClass(
        this.instance,
        "filter-bar-left"
      );

      expect(filterBarLeft.length).toEqual(0);
    });

    it("renders all items right-aligned", function() {
      const filterBarRight = TestUtils.findRenderedDOMComponentWithClass(
        this.instance,
        "filter-bar-right"
      );

      expect(filterBarRight.children.length).toEqual(3);
    });
  });
});
