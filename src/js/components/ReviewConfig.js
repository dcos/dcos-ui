import GeminiScrollbar from "react-gemini-scrollbar";
import PropTypes from "prop-types";
import React from "react";

import RouterUtil from "#SRC/js/utils/RouterUtil";
import ConfigurationMap from "./ConfigurationMap";
import defaultServiceImage from "../../../plugins/services/src/img/icon-service-default-small@2x.png";
import HashMapDisplay from "./HashMapDisplay";
import Icon from "./Icon";
import Image from "./Image";
import ScrollbarUtil from "../utils/ScrollbarUtil";

class ReviewConfig extends React.Component {
  componentDidMount() {
    // Timeout necessary due to modal content height updates on did mount
    setTimeout(() => {
      ScrollbarUtil.updateWithRef(this.refs.gemini);
    });
  }

  getHeader() {
    const {
      configuration,
      packageIcon,
      packageName,
      packageVersion
    } = this.props;
    const fileName = "config.json";
    const configString = JSON.stringify(configuration, null, 2);

    return (
      <div className="modal-header flex-item-shrink-0">
        <div className="row">
          <div className="column-4">
            <div className="media-object-spacing-wrapper media-object-spacing-narrow media-object-offset">
              <div className="media-object media-object-align-middle">
                <div className="media-object-item">
                  <div className="icon icon-medium icon-image-container icon-app-container icon-default-white">
                    <Image
                      fallbackSrc={defaultServiceImage}
                      src={packageIcon}
                    />
                  </div>
                </div>
                <div className="media-object-item">
                  <h4 className="flush-top flush-bottom text-color-neutral">
                    {packageName}
                  </h4>
                  <span className="side-panel-resource-label">
                    {packageVersion}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="column-8 text-align-right">
            <a
              className="button button-primary-link"
              onClick={RouterUtil.triggerIEDownload.bind(
                null,
                fileName,
                configString
              )}
              download={fileName}
              href={RouterUtil.getResourceDownloadPath(
                "attachment/json",
                fileName,
                configString
              )}
            >
              <Icon id="download" size="mini" /> Download config.json
            </a>
          </div>
        </div>
      </div>
    );
  }

  getDefinitionReview() {
    return (
      <ConfigurationMap>
        <HashMapDisplay hash={this.props.configuration} />
      </ConfigurationMap>
    );
  }

  render() {
    return (
      <div className={this.props.className}>
        {this.getHeader()}
        <GeminiScrollbar autoshow={true} className="review-config" ref="gemini">
          <div className="modal-body flush-top flush-bottom">
            {this.getDefinitionReview()}
          </div>
        </GeminiScrollbar>
      </div>
    );
  }
}

ReviewConfig.defaultProps = {
  className: "modal-install-package-body-and-header"
};

ReviewConfig.propTypes = {
  className: PropTypes.string,
  configuration: PropTypes.object.isRequired,
  packageIcon: PropTypes.string,
  packageName: PropTypes.string,
  packageVersion: PropTypes.string
};

module.exports = ReviewConfig;
