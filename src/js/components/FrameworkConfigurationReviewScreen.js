import PropTypes from "prop-types";
import React from "react";

import HashMapDisplay from "#SRC/js/components/HashMapDisplay";
import Util from "#SRC/js/utils/Util";
import StringUtil from "#SRC/js/utils/StringUtil";
import Icon from "#SRC/js/components/Icon";
import EmptyStates from "#SRC/js/constants/EmptyStates";
import RouterUtil from "#SRC/js/utils/RouterUtil";

const METHODS_TO_BIND = ["getHashMapRenderKeys"];

class FrameworkConfigurationReviewScreen extends React.Component {
  constructor(props) {
    super(props);

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  getHashMapRenderKeys(formData) {
    if (!Util.isObject(formData)) {
      return {};
    }

    let renderKeys = {};
    Object.keys(formData).forEach(key => {
      renderKeys[key] = StringUtil.capitalizeEveryWord(key);
      renderKeys = Object.assign(
        renderKeys,
        this.getHashMapRenderKeys(formData[key])
      );
    });

    return renderKeys;
  }

  render() {
    const { frameworkData, title, onEditClick } = this.props;

    const fileName = "config.json";
    const configString = JSON.stringify(frameworkData, null, 2);

    return (
      <div className="container">
        <div className="row">
          <div className="column-4">
            <h1 className="flush-top">{title}</h1>
          </div>
          <div className="column-8 text-align-right">
            <button
              className="button button-primary-link button-inline-flex"
              onClick={onEditClick}
            >
              <Icon id="pencil" size="mini" family="system" />
              <span>
                {"Edit Config"}
              </span>
            </button>
            <a
              className="button button-primary-link flush-right"
              download={fileName}
              onClick={RouterUtil.triggerIEDownload.bind(
                null,
                fileName,
                configString
              )}
              href={RouterUtil.getResourceDownloadPath(
                "attachment/json",
                fileName,
                configString
              )}
            >
              <Icon id="download" size="mini" family="system" />
              <span>
                {"Download Config"}
              </span>
            </a>
          </div>
        </div>
        <HashMapDisplay
          hash={frameworkData}
          renderKeys={this.getHashMapRenderKeys(frameworkData)}
          headlineClassName={"text-capitalize"}
          emptyValue={EmptyStates.CONFIG_VALUE}
        />
      </div>
    );
  }
}

FrameworkConfigurationReviewScreen.defaultProps = {
  title: ""
};

FrameworkConfigurationReviewScreen.propTypes = {
  onEditClick: PropTypes.func.isRequired,
  frameworkData: PropTypes.object.isRequired,
  title: PropTypes.string
};

module.exports = FrameworkConfigurationReviewScreen;
