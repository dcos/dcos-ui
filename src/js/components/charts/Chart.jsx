import PropTypes from "prop-types";
import React from "react";
import createReactClass from "create-react-class";

import StoreMixin from "#SRC/js/mixins/StoreMixin";
import DOMUtils from "../../utils/DOMUtils";

const Chart = createReactClass({
  displayName: "Chart",

  mixins: [StoreMixin],

  propTypes: {
    calcHeight: PropTypes.func,
    delayRender: PropTypes.bool
  },

  getDefaultProps() {
    return {
      calcHeight: null,
      delayRender: false
    };
  },

  UNSAFE_componentWillMount() {
    this.store_listeners = [
      {
        name: "sidebar",
        events: ["widthChange"],
        suppressUpdate: true
      }
    ];

    this.dimensions = { width: null };
  },

  componentDidMount() {
    if (this.props.delayRender) {
      // As of right now this is used on the Side Panels
      // because they animate in we need to wait on calling
      // `window.getComputedStyle` because it'll cause a repaint
      // which causes the panel to not animate
      // Making this happen on the next tick fixes it.
      setTimeout(this.updateWidth, 0);
    } else {
      this.updateWidth();
    }
    global.addEventListener("resize", this.updateWidth);
  },

  componentWillUnmount() {
    global.removeEventListener("resize", this.updateWidth);
  },

  onSidebarStoreWidthChange() {
    this.updateWidth();
  },

  updateWidth() {
    if (!this.chartRef) {
      return;
    }
    const dimensions = DOMUtils.getComputedDimensions(this.chartRef);
    const { width, height } = this.dimensions;

    if (width !== dimensions.width || height !== dimensions.height) {
      this.dimensions = dimensions;
      this.forceUpdate();
    }
  },

  getChildren() {
    let { width, height } = this.dimensions;
    if (width != null) {
      const calcHeight = this.props.calcHeight;

      if (typeof calcHeight === "function") {
        height = calcHeight(width);
      }

      const children = this.props.children;
      if (Array.isArray(children)) {
        height = height / children.length;

        return children.map(child =>
          React.cloneElement(child, { width, height })
        );
      } else {
        return React.cloneElement(children, { width, height });
      }
    }
  },

  render() {
    // at the moment, 'chart' is used to inject the chart color palette.
    // we should reclaim it as the rightful className of <Chart />
    return (
      <div ref={el => (this.chartRef = el)} className="chart-chart">
        {this.getChildren()}
      </div>
    );
  }
});

export default Chart;
