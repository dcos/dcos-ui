import PropTypes from "prop-types";
import React from "react";
import mixin from "reactjs-mixin";
import { StoreMixin } from "mesosphere-shared-reactjs";

import DOMUtils from "../../utils/DOMUtils";
import InternalStorageMixin from "../../mixins/InternalStorageMixin";

const METHODS_TO_BIND = ["getChildren", "updateWidth"];

class Chart extends mixin(InternalStorageMixin, StoreMixin) {
  constructor() {
    super(...arguments);

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  componentWillMount() {
    this.store_listeners = [
      {
        name: "sidebar",
        events: ["widthChange"],
        suppressUpdate: true
      }
    ];

    this.internalStorage_set({ width: null });
  }

  componentDidMount() {
    this._mounted = true;
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
  }

  componentWillUnmount() {
    this._mounted = false;
    global.removeEventListener("resize", this.updateWidth);
  }

  updateWidth() {
    if (!this.chartRef) {
      return;
    }
    var dimensions = DOMUtils.getComputedDimensions(this.chartRef);
    var data = this.internalStorage_get();

    if (data.width !== dimensions.width || data.height !== dimensions.height) {
      this.internalStorage_set(dimensions);
      this.forceUpdate();
    }
  }

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
  }

  render() {
    // at the moment, 'chart' is used to inject the chart color palette.
    // we should reclaim it as the rightful className of <Chart />
    return (
      <div ref={el => (this.chartRef = el)} className="chart-chart">
        {this.getChildren()}
      </div>
    );
  }
}

Chart.displayName = "Chart";

Chart.propTypes = {
  calcHeight: PropTypes.func,
  delayRender: PropTypes.bool
};

Chart.defaultProps = {
  calcHeight: null,
  delayRender: false
};

module.exports = Chart;
