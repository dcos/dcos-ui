import classNames from "classnames";
import GeminiScrollbar from "react-gemini-scrollbar";
import React from "react";

import ScrollbarUtil from "../utils/ScrollbarUtil";
import Util from "../utils/Util";

/**
 * A component to use as in place of GeminiScrollbar when the parent's width
 * will be animated. This component is unaware of any sort of animation; its
 * job is simply to calculate the width of the browser's scrollbar and apply a
 * width to Gemini's .gm-scroll-view element. The effect is the .gm-scroll-view
 * element will always match the width of its parent.
 *
 * It writes an inline <style> tag to the document's head in order to
 * dynamically apply a width with an offset equal to the width of the browser's
 * scrollbar. This is only added once, as the same styles apply for all
 * instances of this component.
 *
 * When the last component of its kind unmounts, the <style> tag is removed.
 * It passes all props to the GeminiScrollbar component, with the exception that
 * it adds a class to the provided className prop.
 *
 * @example
 *
 * <FluidGeminiScrollbar>
 *   ...content...
 * </FluidGeminiScrollbar>
 *
 */

let componentMountCount = 0;
let styleElement = null;

class FluidGeminiScrollbar extends React.Component {
  constructor() {
    super(...arguments);

    this.geminiRef = null;
  }

  componentDidMount() {
    // If the browser's scrollbar width is larger than zero and this is the
    // first instance of the component, then add the stylesheet to the
    // document's head.
    if (componentMountCount <= 0) {
      const scrollbarWidth = ScrollbarUtil.getScrollbarWidth();

      // Reset component mount counter
      componentMountCount = 0;

      if (scrollbarWidth > 0) {
        const head =
          global.document.head ||
          global.document.getElementsByTagName("head")[0];

        const cssString = `
          .gm-scrollbar-container-fluid-view-width > .gm-scroll-view {
            width: calc(100% + ${scrollbarWidth}px) !important;
          }
        `;

        styleElement = global.document.createElement("style");
        styleElement.type = "text/css";

        if (styleElement.styleSheet) {
          styleElement.styleSheet.cssText = cssString;
        } else {
          styleElement.appendChild(global.document.createTextNode(cssString));
        }

        head.appendChild(styleElement);
      }
    }

    // Keep track of the number of mounted instances.
    componentMountCount++;
  }

  /**
   * Handle component will unmount and remove the gemini style sheet if it's the
   * last mounted {FluidGeminiScrollbar} instance.
   */
  componentWillUnmount() {
    if (--componentMountCount > 0) {
      return;
    }

    if (
      styleElement instanceof Element &&
      styleElement.parentNode instanceof Node
    ) {
      styleElement.parentNode.removeChild(styleElement);
    }
  }

  render() {
    const { props } = this;
    const classes = classNames(
      "gm-scrollbar-container-fluid-view-width",
      props.className
    );

    return (
      <GeminiScrollbar
        className={classes}
        ref={ref => (this.geminiRef = ref)}
        {...Util.omit(props, ["className"])}
      />
    );
  }
}

FluidGeminiScrollbar.propTypes = {
  className: React.PropTypes.oneOfType([
    React.PropTypes.string,
    React.PropTypes.object
  ])
};

module.exports = FluidGeminiScrollbar;
