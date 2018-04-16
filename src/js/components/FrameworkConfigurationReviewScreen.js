import PropTypes from "prop-types";
import React from "react";
import { Dropdown, Tooltip } from "reactjs-components";

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

  getVersionsDropdown() {
    const { frameworkMeta } = this.props;

    const versionItems = [
      {
        id: frameworkMeta,
        html: (
          <div className="button-split-content-wrapper">
            <Icon
              className="services-version-select-icon services-version-select-icon-selected button-split-content-item"
              id="check"
              size="mini"
              color="neutral"
            />
            <Icon
              className="services-version-select-icon button-split-content-item"
              id="commit"
              size="mini"
              color="neutral"
            />
            <span
              className="button-split-content-item text-overflow"
              title={frameworkMeta}
            >
              <span className="badge-container">
                <span className="badge-container-text">{frameworkMeta}</span>
                <span className="badge">Active</span>
              </span>
            </span>
          </div>
        )
      }
    ];

    return (
      <Tooltip
        content="Configuration version"
        wrapperClassName="button button-transparent button-flush"
      >
        <Dropdown
          buttonClassName="services-version-select-toggle dropdown-toggle button button-transparent button-split-content flush-left"
          dropdownMenuClassName="services-version-select-menu dropdown-menu"
          dropdownMenuListClassName="dropdown-menu-list"
          dropdownMenuListItemClassName="clickable"
          items={versionItems}
          persistentID={frameworkMeta}
          key="version-dropdown"
          scrollContainer=".gm-scroll-view"
          scrollContainerParentSelector=".gm-prevented"
          transition={true}
          transitionName="dropdown-menu"
          wrapperClassName="services-version-select dropdown"
        />
      </Tooltip>
    );
  }

  getVersionsActions() {
    return (
      <div className="pod flush-top flush-right flush-left">
        <div className="button-collection">
          {this.getVersionsDropdown()}
        </div>
      </div>
    );
  }

  render() {
    const { frameworkData, title, onEditClick, frameworkMeta } = this.props;

    const fileName = "config.json";
    const configString = JSON.stringify(frameworkData, null, 2);

    return (
      <div className="container">
        <div className="row">
          <div className="column-6">
            {title && <h1 className="flush-top">{title}</h1>}
            {frameworkMeta && this.getVersionsActions()}
          </div>
          <div className="column-6 text-align-right">
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
  title: PropTypes.string,
  frameworkMeta: PropTypes.string
};

module.exports = FrameworkConfigurationReviewScreen;
