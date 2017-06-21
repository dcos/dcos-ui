import d3 from "d3";
import React from "react";
import ReactDOM from "react-dom";

import DialSlice from "./DialSlice";
import InternalStorageMixin from "../../mixins/InternalStorageMixin";

// the data to render a single grey circle
function getEmptyState() {
  return [{ colorIndex: 7, value: 1 }];
}

var DialChart = React.createClass({
  displayName: "DialChart",

  mixins: [InternalStorageMixin],

  propTypes: {
    // [{colorIndex: 0, name: 'Some Name', value: 4}]
    data: React.PropTypes.array.isRequired,
    slices: React.PropTypes.array,
    duration: React.PropTypes.number,
    value: React.PropTypes.string
  },

  getDefaultProps() {
    return {
      duration: 1000,
      slices: [],
      value: "value"
    };
  },

  componentWillMount() {
    var value = this.props.value;
    var data = Object.assign(
      {
        pie: d3.layout.pie().sort(null).value(function(d) {
          return d[value];
        })
      },
      this.getArcs(this.props)
    );

    this.internalStorage_set(data);
  },

  componentWillUpdate(nextProps) {
    var slice = this.getSlice(this.props);
    var arcs = this.getArcs(this.props);
    var innerArc = arcs.innerArc;

    slice.each(function(d) {
      this._current = d;
    });

    slice = this.getSlice(nextProps);
    slice
      .each(function(d) {
        if (d.value > 0) {
          d3.select(this).style("visibility", "inherit");
        }
      })
      .transition()
      .duration(nextProps.duration)
      .attrTween("d", function(d) {
        var interpolate = d3.interpolate(this._current, d);

        return function(t) {
          this._current = interpolate(t);

          return innerArc(this._current);
        }.bind(this);
      })
      .each("end", function(d) {
        if (d.value === 0) {
          d3.select(this).style("visibility", "hidden");
        }
      });
  },

  getNormalizedData(slices, data) {
    if (this.isEmpty(data)) {
      return getEmptyState();
    }

    // Zero-length defaults are populated with actual data if available
    var namedSlices = slices.reduce(function(indexByName, slice) {
      indexByName[slice.name] = slice;

      return indexByName;
    }, {});

    var namedData = data.reduce(function(indexByName, datum) {
      indexByName[datum.name] = datum;

      return indexByName;
    }, {});

    var normalizedNamedData = Object.assign({}, namedSlices, namedData);

    return Object.values(normalizedNamedData);
  },

  isEmpty(data) {
    var sumOfData = data.reduce(function(memo, datum) {
      return memo + datum.value;
    }, 0);

    return sumOfData === 0;
  },

  getSlice(props) {
    var data = this.internalStorage_get();
    var normalizedData = this.getNormalizedData(props.slices, props.data);

    return d3
      .select(ReactDOM.findDOMNode(this))
      .selectAll("path")
      .data(data.pie(normalizedData));
  },

  getRadius(props) {
    const smallSide = Math.min(
      props.width || Infinity,
      props.height || Infinity
    );

    return smallSide / 2;
  },

  getArcs(props) {
    var radius = this.getRadius(props);

    return {
      innerArc: d3.svg
        .arc()
        .outerRadius(radius * 0.9)
        .innerRadius(radius * 0.84),
      outerArc: d3.svg.arc().outerRadius(radius).innerRadius(radius),
      innerRadius: radius * 0.5
    };
  },

  getPosition() {
    return (
      "translate(" + this.props.width / 2 + "," + this.props.height / 2 + ")"
    );
  },

  getWedges() {
    var data = this.internalStorage_get();
    var innerArc = data.innerArc;
    var pie = data.pie;
    var normalizedData = this.getNormalizedData(
      this.props.slices,
      this.props.data
    );
    var normalizedPie = pie(normalizedData);

    return normalizedPie.map(function(element, i) {
      return (
        <DialSlice
          key={i}
          colorIndex={element.data.colorIndex || i}
          path={innerArc(element)}
        />
      );
    });
  },

  render() {
    return (
      <div
        className="chart-dialchart"
        height={this.props.height}
        width={this.props.width}
      >
        <svg height={this.props.height} width={this.props.width}>
          <g transform={this.getPosition()} className="slices">
            {this.getWedges()}
          </g>
        </svg>
        {this.props.children}
      </div>
    );
  }
});

module.exports = DialChart;
