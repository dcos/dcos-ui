const ChartMixin = require("../ChartMixin");

let thisProps;

describe("ChartMixin", () => {
  beforeEach(() => {
    var now = Date.now();
    var interval = 2000;

    var data = [
      {
        id: "used_resources",
        values: Array(31)
          .fill(0)
          .map((value, i) => {
            return {
              date: now + interval * i,
              percentage: 0,
              value: 0
            };
          })
      }
    ];

    thisProps = {
      data,
      margin: {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0
      },
      refreshRate: interval,
      height: 0,
      width: 0
    };
  });

  describe("#formatXAxis", () => {
    beforeEach(() => {
      thisProps = {
        axisConfiguration: {
          x: {
            hideMatch: false
          }
        }
      };
    });

    it("parses strings to numbers", () => {
      const result = ChartMixin.formatXAxis.call({ props: thisProps }, "0");
      expect(result).toEqual("0");
    });

    it("parses numbers", () => {
      const result = ChartMixin.formatXAxis.call({ props: thisProps }, 3);
      expect(result).toEqual("3s");
    });

    it("does not format zeros", () => {
      const result = ChartMixin.formatXAxis.call({ props: thisProps }, 0);
      expect(result).toEqual(0);
    });

    it("formats positive numbers", () => {
      const result = ChartMixin.formatXAxis.call({ props: thisProps }, 3);
      expect(result).toEqual("3s");
    });

    it("formats negative numbers", () => {
      const result = ChartMixin.formatXAxis.call({ props: thisProps }, -3);
      expect(result).toEqual("-3s");
    });

    it("returns an empty string if it matches the value", () => {
      thisProps.axisConfiguration.x.hideMatch = /^0$/;
      const result = ChartMixin.formatXAxis.call({ props: thisProps }, 0);
      expect(result).toEqual("");
    });

    it("returns value if there's no match", () => {
      thisProps.axisConfiguration.x.hideMatch = /^10$/;
      const result = ChartMixin.formatXAxis.call({ props: thisProps }, 0);
      expect(result).toEqual(0);
    });
  });

  describe("#getXScale", () => {
    it("builds the correct amount of ticks", () => {
      var props = thisProps;
      var xScale = ChartMixin.getXScale(
        props.data,
        props.width,
        props.refreshRate
      );
      expect(xScale.ticks(4)).toEqual([-60, -40, -20, 0]);
    });

    it("has the correct domain range", () => {
      var props = thisProps;
      var xScale = ChartMixin.getXScale(
        props.data,
        props.width,
        props.refreshRate
      );
      expect(xScale.domain()).toEqual([-60, 0]);
    });
  });

  describe("#getHeight", () => {
    it("returns 0 given 0 height and 0 margin", () => {
      var height = ChartMixin.getHeight(thisProps);
      expect(height).toEqual(0);
    });

    it("returns NaN when given a NaN argument", () => {
      var height = ChartMixin.getHeight({
        margin: {
          top: 10,
          bottom: NaN
        },
        height: 100
      });
      expect(isNaN(height)).toEqual(true);
    });

    it("returns a number when given a null argument", () => {
      var height = ChartMixin.getHeight({
        margin: {
          top: null,
          bottom: 10
        },
        height: 100
      });
      expect(height).toEqual(90);
    });

    it("yields positive view height given node height > margins", () => {
      var height = ChartMixin.getHeight({
        margin: {
          top: 10,
          right: 11,
          bottom: 12,
          left: 9
        },
        height: 31,
        width: 4
      });

      expect(height).toEqual(9);
    });

    it("yields negative view height given node height < margins", () => {
      var height = ChartMixin.getHeight({
        margin: {
          top: 100,
          bottom: 120
        },
        height: 31
      });

      expect(height).toEqual(-189);
    });
  });

  describe("#getWidth", () => {
    it("returns 0 given 0 width and 0 margin", () => {
      var width = ChartMixin.getWidth(thisProps);

      expect(width).toEqual(0);
    });

    it("returns NaN when given NaN argument", () => {
      var width = ChartMixin.getWidth({
        margin: {
          left: 9,
          right: NaN
        },
        width: 10
      });
      expect(isNaN(width)).toEqual(true);
    });

    it("returns a number when given a null argument", () => {
      var width = ChartMixin.getWidth({
        margin: {
          left: 9,
          right: 10
        },
        width: null
      });
      expect(width).toEqual(-19);
    });

    it("yields positive view width given node width > margins", () => {
      var width = ChartMixin.getWidth({
        margin: {
          top: 8,
          left: 9,
          bottom: 13,
          right: 21
        },
        height: 31,
        width: 55
      });

      expect(width).toEqual(25);
    });

    it("yields negative view width given node width < margins", () => {
      var width = ChartMixin.getWidth({
        margin: {
          left: 90,
          right: 210
        },
        width: 55
      });

      expect(width).toEqual(-245);
    });
  });
});
