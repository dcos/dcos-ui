import GeminiScrollbar from "react-gemini-scrollbar";

let scrollbarWidth = null;

const ScrollbarUtil = {
  /**
   * Taken from Gemini's source code with some edits
   * https://github.com/noeldelgado/gemini-scrollbar/blob/master/index.js#L22
   * @param  {Object} options
   * @return {Number} The width of the native scrollbar
   */
  getScrollbarWidth(options = {}) {
    if (scrollbarWidth == null || options.forceUpdate) {
      const element = global.document.createElement("div");

      element.style.position = "absolute";
      element.style.top = "-9999px";
      element.style.width = "100px";
      element.style.height = "100px";
      element.style.overflow = "scroll";
      element.style.msOverflowStyle = "scrollbar";

      global.document.body.appendChild(element);
      scrollbarWidth = element.offsetWidth - element.clientWidth;
      global.document.body.removeChild(element);
    }

    return scrollbarWidth;
  },

  updateWithRef(containerRef) {
    // Use the containers gemini ref if present
    if (containerRef != null && containerRef.geminiRef != null) {
      this.updateWithRef(containerRef.geminiRef);

      return;
    }

    if (containerRef instanceof GeminiScrollbar) {
      containerRef.scrollbar.update();
    }
  }
};

module.exports = ScrollbarUtil;
