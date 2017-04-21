/* eslint-disable no-unused-vars */
import React from "react";
/* eslint-enable no-unused-vars */

const SDK = require("./SDK").getSDK();

const { Icon, DOMUtils } = SDK.get(["Icon", "DOMUtils"]);

module.exports = {
  configuration: {
    backgroundColor: "#1E232F",
    foregroundColor: "#FFFFFF",
    headerTitle: null,
    headerContent: null,
    footerContent: null,
    imagePath: null,
    dismissible: null
  },

  initialize() {
    SDK.Hooks.addAction(
      "applicationRendered",
      this.applicationRendered.bind(this)
    );
    SDK.Hooks.addFilter(
      "applicationContents",
      this.applicationContents.bind(this)
    );
    SDK.Hooks.addFilter(
      "overlayNewWindowButton",
      this.overlayNewWindowButton.bind(this)
    );
    this.configure(SDK.config);
  },

  configure(configuration) {
    // Only merge keys that have a non-null value
    Object.keys(configuration).forEach(key => {
      if (configuration[key] != null) {
        this.configuration[key] = configuration[key];
      }
    });
  },

  isEnabled() {
    const configuration = this.configuration;

    return (
      configuration.headerTitle != null ||
      configuration.headerContent != null ||
      configuration.footerContent != null
    );
  },

  toggleFullContent() {
    const banner = global.document.querySelector(".banner-plugin-wrapper");
    banner.classList.toggle("display-full");
  },

  applicationRendered() {
    if (this.isEnabled() === false || !DOMUtils.isTopFrame()) {
      return;
    }

    const frame = global.document.getElementById("banner-plugin-iframe");

    if (frame == null) {
      return;
    }

    if (this.historyListenerAdded) {
      return;
    }

    this.historyListenerAdded = true;

    const frameWindow = frame.contentWindow;
    const topWindow = global;

    frameWindow.addEventListener("hashchange", function() {
      topWindow.location.hash = frameWindow.location.hash;
    });
  },

  applicationContents() {
    if (this.isEnabled() === false || !DOMUtils.isTopFrame()) {
      return null;
    }

    return (
      <div className="banner-plugin-wrapper">
        {this.getHeader()}

        <iframe
          frameBorder="0"
          id="banner-plugin-iframe"
          src={`./index.html${global.location.hash}`}
        />

        {this.getFooter()}
      </div>
    );
  },

  overlayNewWindowButton(button) {
    if (this.isEnabled()) {
      return null;
    }

    return button;
  },

  getColorStyles() {
    return {
      color: this.configuration.foregroundColor,
      backgroundColor: this.configuration.backgroundColor
    };
  },

  getIcon() {
    const imagePath = this.configuration.imagePath;

    if (imagePath == null || imagePath === "") {
      return null;
    }

    return (
      <span className="
        icon
        icon-small
        icon-image-container
        icon-app-container">
        <img src={imagePath} />
      </span>
    );
  },

  getTitle() {
    const title = this.configuration.headerTitle;

    if (title == null || title === "") {
      return null;
    }

    return (
      <h5
        className="title flush-top flush-bottom"
        style={{ color: this.configuration.foregroundColor }}
      >
        {title}
      </h5>
    );
  },

  getHeaderContent() {
    const content = this.configuration.headerContent;

    if (content == null || content === "") {
      return null;
    }

    return (
      <span className="content hidden-small-down" title={content}>
        {content}
      </span>
    );
  },

  getHeader() {
    const icon = this.getIcon();
    const title = this.getTitle();
    const content = this.getHeaderContent();

    if (icon == null && title == null && content == null) {
      return null;
    }

    return (
      <header className="flex-container" style={this.getColorStyles()}>
        <span className="flex-container">
          <span>
            {icon}
            {title}
          </span>
          <span
            className="banner-plugin-info-icon clickable hidden-medium-up"
            onClick={this.toggleFullContent}
          >
            <Icon
              fill={this.configuration.foregroundColor}
              id="circle-information"
              size="mini"
            />
          </span>
        </span>
        {content}
      </header>
    );
  },

  getFooter() {
    const content = this.configuration.footerContent;

    if (content == null || content === "") {
      return null;
    }

    return (
      <footer style={this.getColorStyles()}>
        <span className="content" title={content}>
          {content}
        </span>
      </footer>
    );
  }
};
