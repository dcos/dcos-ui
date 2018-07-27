import * as viewport from "../constants/Viewports";

export const getCurrentViewport = () => {
  const windowWidth = global.innerWidth;

  if (windowWidth <= viewport.MOBILE_THRESHOLD) {
    return viewport.MOBILE;
  }

  if (windowWidth > viewport.MOBILE_THRESHOLD) {
    return viewport.DESKTOP;
  }
};

export const hasViewportChanged = (previousWidth, windowWidth) => {
  // Transition from Mobile to Desktop
  if (
    windowWidth > viewport.MOBILE_THRESHOLD &&
    previousWidth < viewport.MOBILE_THRESHOLD
  ) {
    return true;
  }

  // Transition from Desktop to Mobile
  if (
    windowWidth < viewport.MOBILE_THRESHOLD &&
    previousWidth > viewport.MOBILE_THRESHOLD
  ) {
    return true;
  }

  return false;
};
