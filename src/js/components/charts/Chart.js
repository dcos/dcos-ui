import React from "react";
import ReactDOM from "react-dom";
import { StoreMixin } from "mesosphere-shared-reactjs";

import DOMUtils from "../../utils/DOMUtils";
import InternalStorageMixin from "../../mixins/InternalStorageMixin";

var Chart = React.createClass({
  displayName: "Chart",

  mixins: [InternalStorageMixin, StoreMixin],

  propTypes: {
    calcHeight: React.PropTypes.func,
    delayRender: React.PropTypes.bool
  },

  getDefaultProps() {
    return {
      calcHeight: null,
      delayRender: false
    };
  },

  componentWillMount() {
    this.store_listeners = [
      {
        name: "sidebar",
        events: ["widthChange"],
        suppressUpdate: false
      }
    ];

    this.internalStorage_set({ width: null });
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

  shouldComponentUpdate() {
    return DOMUtils.isElementOnTop(ReactDOM.findDOMNode(this));
  },

  componentWillUnmount() {
    global.removeEventListener("resize", this.updateWidth);
  },

  onSidebarStoreWidthChange() {
    this.updateWidth();
  },

  updateWidth() {
    if (!this.isMounted()) {
      return;
    }
    var node = ReactDOM.findDOMNode(this);
    var dimensions = DOMUtils.getComputedDimensions(node);
    var data = this.internalStorage_get();

    if (data.width !== dimensions.width || data.height !== dimensions.height) {
      this.internalStorage_set(dimensions);
      this.forceUpdate();
    }
  },

  getChildren() {
    var data = this.internalStorage_get();
    var width = data.width;
    var height = data.height;
    if (width != null) {
      var calcHeight = this.props.calcHeight;

      if (typeof calcHeight === "function") {
        height = calcHeight(width);
      }

      var children = this.props.children;
      if (Array.isArray(children)) {
        height = height / children.length;

        return children.map(function(child) {
          return React.cloneElement(child, { width, height });
        });
      } else {
        return React.cloneElement(children, { width, height });
      }
    }
  },

  render() {
    // at the moment, 'chart' is used to inject the chart color palette.
    // we should reclaim it as the rightful className of <Chart />
    return (
      <div className="chart-chart">
        {this.getChildren()}
      </div>
    );
  }
});

module.exports = Chart;
