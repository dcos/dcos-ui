import classNames from "classnames";
import PropTypes from "prop-types";
import React from "react";
import ReactDOM from "react-dom";
import { Trans, t } from "@lingui/macro";
import { withI18n } from "@lingui/react";

import FilterBar from "#SRC/js/components/FilterBar";
import FilterInputText from "#SRC/js/components/FilterInputText";
import KeyboardUtil from "#SRC/js/utils/KeyboardUtil";

const METHODS_TO_BIND = [
  "handleSearchStringChange",
  "handleCountChange",
  "handleKeyDown"
];

class SearchLog extends React.Component {
  constructor() {
    super(...arguments);

    this.state = {
      searchString: "",
      totalFound: 0,
      watching: 0
    };

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  componentDidMount() {
    const filterInput = ReactDOM.findDOMNode(this.refs.filterInput);

    if (filterInput) {
      filterInput.addEventListener("keydown", this.handleKeyDown);
    }
  }

  componentWillReceiveProps(nextProps, nextState) {
    const nextSearchString = nextState.searchString;
    const nextTotalFound = nextState.totalFound;
    const updatedState = {};

    if (nextTotalFound === 0) {
      updatedState.watching = 0;
    } else if (
      this.state.watching === 0 ||
      (nextSearchString != null && this.state.searchString !== nextSearchString)
    ) {
      updatedState.watching = 1;
    }

    this.setState(updatedState);
  }

  componentWillUnmount() {
    const filterInput = ReactDOM.findDOMNode(this.refs.filterInput);

    if (filterInput) {
      filterInput.removeEventListener("keydown", this.handleKeyDown);
    }
  }

  handleKeyDown(event) {
    const { keyCode } = event;
    if (keyCode === KeyboardUtil.keyCodes.enter) {
      this.changeWatching("next");
    }
  }

  handleSearchStringChange(searchString = "") {
    this.setState({ searchString, watching: 1 });
  }

  handleCountChange(totalFound) {
    this.setState({ totalFound });
  }

  changeWatching(direction) {
    let { totalFound, watching } = this.state;
    if (direction === "next") {
      watching += 1;
      if (watching > totalFound) {
        watching = 1;
      }
    }

    if (direction === "previous") {
      watching -= 1;
      if (watching < 1) {
        watching = totalFound;
      }
    }

    this.setState({ watching });
  }

  getSearchCount() {
    let { searchString, totalFound, watching } = this.state;

    if (totalFound === 0 && !searchString) {
      return null;
    }

    if (totalFound === 0 && searchString) {
      watching = 0;
    }

    return (
      <Trans render="span" className="search-count small flush text-muted">
        {watching} out of {totalFound}
      </Trans>
    );
  }

  getSearchButtons() {
    if (this.state.totalFound === 0) {
      return null;
    }

    return (
      <div className="button-group button-group-directions">
        <div
          onClick={this.changeWatching.bind(this, "previous")}
          className="button button-up-arrow button-outline"
        />
        <div
          onClick={this.changeWatching.bind(this, "next")}
          className="button button-down-arrow button-outline"
        />
      </div>
    );
  }

  render() {
    const { actions, children, i18n } = this.props;
    const { searchString, watching } = this.state;
    const clonedChildren =
      children &&
      React.cloneElement(children, {
        highlightText: searchString,
        watching,
        onCountChange: this.handleCountChange
      });

    const inputContainerClassSet = classNames({
      "filter-input-text-group-wide": this.state.searchString
    });

    return (
      <div className="flex flex-direction-top-to-bottom flex-item-grow-1 flex-item-shrink-1">
        <FilterBar
          className="filter-bar control-group form-group flex-wrap-items-none-screen-small flex-item-shrink-0 flush-bottom"
          leftChildrenClass="filter-bar-left filter-bar-search-container flex-wrap-items-none flex-item-grow-1 flex-item-shrink-1"
          rightAlignLastNChildren={React.Children.count(actions)}
        >
          <FilterInputText
            ref="filterInput"
            className="flex-grow flex-box flush-bottom"
            placeholder={i18n._(t`Search`)}
            searchString={this.state.searchString}
            sideText={this.getSearchCount()}
            handleFilterChange={this.handleSearchStringChange}
            inputContainerClass={inputContainerClassSet}
          />
          {this.getSearchButtons()}
          {actions}
        </FilterBar>
        {clonedChildren}
      </div>
    );
  }
}

SearchLog.defaultProps = {
  logFiles: []
};

SearchLog.propTypes = {
  logFiles: PropTypes.array,
  actions: PropTypes.node,
  children: PropTypes.node
};

module.exports = withI18n()(SearchLog);
