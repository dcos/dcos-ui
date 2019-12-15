import d3 from "d3";
import PropTypes from "prop-types";
import React from "react";
import createReactClass from "create-react-class";
import ReactDOM from "react-dom";

import DialSlice from "./DialSlice";

// the data to render a single grey circle
function getEmptyState() {
  return [{ colorIndex: 7, value: 1 }];
}

const DialChart = createReactClass({
  displayName: "DialChart",

  propTypes: {
    // [{colorIndex: 0, name: 'Some Name', value: 4}]
    data: PropTypes.array.isRequired,
    slices: PropTypes.array,
    duration: PropTypes.number,
    value: PropTypes.string
  },

  getDefaultProps() {
    return {
      duration: 1000,
      slices: [],
      value: "value"
    };
  },

  UNSAFE_componentWillMount() {
    const value = this.props.value;
    const data = Object.assign(
      {
        pie: d3.layout
          .pie()
          .sort(null)
          .value(d => d[value])
      },
      this.getArcs(this.props)
    );

    this.data = data;
  },

  UNSAFE_componentWillUpdate(nextProps) {
    let slice = this.getSlice(this.props);
    const arcs = this.getArcs(this.props);
    const innerArc = arcs.innerArc;

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
        const interpolate = d3.interpolate(this._current, d);

        return t => {
          this._current = interpolate(t);

          return innerArc(this._current);
        };
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
    const namedSlices = slices.reduce((indexByName, slice) => {
      indexByName[slice.name] = slice;

      return indexByName;
    }, {});

    const namedData = data.reduce((indexByName, datum) => {
      indexByName[datum.name] = datum;

      return indexByName;
    }, {});

    const normalizedNamedData = Object.assign({}, namedSlices, namedData);

    return Object.values(normalizedNamedData);
  },

  isEmpty(data) {
    const sumOfData = data.reduce((memo, datum) => memo + datum.value, 0);

    return sumOfData === 0;
  },

  getSlice(props) {
    const data = this.data;
    const normalizedData = this.getNormalizedData(props.slices, props.data);

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
    const radius = this.getRadius(props);

    return {
      innerArc: d3.svg
        .arc()
        .outerRadius(radius * 0.9)
        .innerRadius(radius * 0.84),
      outerArc: d3.svg
        .arc()
        .outerRadius(radius)
        .innerRadius(radius),
      innerRadius: radius * 0.5
    };
  },

  getPosition() {
    return (
      "translate(" + this.props.width / 2 + "," + this.props.height / 2 + ")"
    );
  },

  getWedges() {
    const data = this.data;
    const innerArc = data.innerArc;
    const pie = data.pie;
    const normalizedData = this.getNormalizedData(
      this.props.slices,
      this.props.data
    );
    const normalizedPie = pie(normalizedData);

    return normalizedPie.map((element, i) => (
      <DialSlice
        key={i}
        colorIndex={element.data.colorIndex || i}
        path={innerArc(element)}
      />
    ));
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

export default DialChart;
