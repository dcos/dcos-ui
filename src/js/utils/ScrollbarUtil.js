import FluidGeminiScrollbar from '../components/FluidGeminiScrollbar';

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
      let element = global.document.createElement('div');

      element.style.position = 'absolute';
      element.style.top = '-9999px';
      element.style.width = '100px';
      element.style.height = '100px';
      element.style.overflow = 'scroll';
      element.style.msOverflowStyle = 'scrollbar';

      global.document.body.appendChild(element);
      scrollbarWidth = (element.offsetWidth - element.clientWidth);
      global.document.body.removeChild(element);
    }

    return scrollbarWidth;
  },

  updateWithRef(containerRef) {
    if (containerRef) {
      if (containerRef instanceof FluidGeminiScrollbar.constructor
        && containerRef.geminiRef != null) {
        containerRef.geminiRef.scrollbar.update();
      } else {
        containerRef.scrollbar.update();
      }
    }
  }
};

module.exports = ScrollbarUtil;
