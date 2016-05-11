jest.dontMock('../ChartMixin');
var ChartMixin = require('../ChartMixin');

describe('ChartMixin', function () {

  beforeEach(function () {
    var now = Date.now();
    var interval = 2000;

    var data = [{
      id: 'used_resources',
      values: Array(31).fill(0).map(function (value, i) {
        return {
          date: now + (interval * i),
          percentage: 0,
          value: 0
        };
      })
    }];

    this.props = {
      data: data,
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

  describe('#formatXAxis', function () {

    beforeEach(function () {
      this.props = {
        axisConfiguration: {
          x: {
            hideMatch: false
          }
        }
      };
    });

    it('should parse strings to numbers', function () {
      let result = ChartMixin.formatXAxis.call({props: this.props}, '0');
      expect(result).toEqual('0');
    });

    it('should parse numbers', function () {
      let result = ChartMixin.formatXAxis.call({props: this.props}, 3);
      expect(result).toEqual('3s');
    });

    it('should not format zeros', function () {
      let result = ChartMixin.formatXAxis.call({props: this.props}, 0);
      expect(result).toEqual(0);
    });

    it('should format positive numbers', function () {
      let result = ChartMixin.formatXAxis.call({props: this.props}, 3);
      expect(result).toEqual('3s');
    });

    it('should format negative numbers', function () {
      let result = ChartMixin.formatXAxis.call({props: this.props}, -3);
      expect(result).toEqual('-3s');
    });

    it('should return an empty string if it matches the value', function () {
      this.props.axisConfiguration.x.hideMatch = /^0$/;
      let result = ChartMixin.formatXAxis.call({props: this.props}, 0);
      expect(result).toEqual('');
    });

    it('should return value if there\'s no match', function () {
      this.props.axisConfiguration.x.hideMatch = /^10$/;
      let result = ChartMixin.formatXAxis.call({props: this.props}, 0);
      expect(result).toEqual(0);
    });
  });

  describe('#getXScale', function () {

    it('should build the correct amount of ticks', function () {
      var props = this.props;
      var xScale = ChartMixin.getXScale(
        props.data, props.width, props.refreshRate
      );
      expect(xScale.ticks(4)).toEqual([-60, -40, -20, 0]);
    });

    it('should have the correct domain range', function () {
      var props = this.props;
      var xScale = ChartMixin.getXScale(
        props.data, props.width, props.refreshRate
      );
      expect(xScale.domain()).toEqual([-60, 0]);
    });

  });

  describe('#getHeight', function () {

    it('should return 0 given 0 height and 0 margin', function () {
      var height = ChartMixin.getHeight(this.props);
      expect(height).toEqual(0);
    });

    it('should return NaN when given a NaN argument', function () {
      var height = ChartMixin.getHeight({
        margin: {
          top: 10,
          bottom: NaN
        },
        height: 100
      });
      expect(isNaN(height)).toEqual(true);
    });

    it('should return a number when given a null argument', function () {
      var height = ChartMixin.getHeight({
        margin: {
          top: null,
          bottom: 10
        },
        height: 100
      });
      expect(height).toEqual(90);
    });

    it('yields positive view height given node height > margins', function () {
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

    it('yields negative view height given node height < margins', function () {
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

  describe('#getWidth', function () {

    it('should return 0 given 0 width and 0 margin', function () {
      var width = ChartMixin.getWidth(this.props);

      expect(width).toEqual(0);
    });

    it('should return NaN when given NaN argument', function () {
      var width = ChartMixin.getWidth({
        margin: {
          left: 9,
          right: NaN
        },
        width: 10
      });
      expect(isNaN(width)).toEqual(true);
    });

    it('should return a number when given a null argument', function () {
      var width = ChartMixin.getWidth({
        margin: {
          left: 9,
          right: 10
        },
        width: null
      });
      expect(width).toEqual(-19);
    });

    it('yields positive view width given node width > margins', function () {
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

    it('yields negative view width given node width < margins', function () {
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
