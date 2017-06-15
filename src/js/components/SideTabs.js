import classNames from "classnames";
import React from "react";

class SideTabs extends React.Component {
  constructor() {
    super();

    this.state = {
      dropdownOpen: false
    };
  }

  handleTabClick(title) {
    const {
      state: { dropdownOpen },
      props: { onTabClick, selectedTab }
    } = this;

    if (title === selectedTab) {
      this.setState({ dropdownOpen: !dropdownOpen });
    } else {
      this.setState({ dropdownOpen: false });
    }
    // Trigger on both open and close to make sure to trigger gemini update
    onTabClick(title);
  }

  getSelectedTabTitle(selectedTab, tabs) {
    const selectedTabDefinition = tabs.find(function(tab) {
      return tab.selectValue === selectedTab;
    });

    if (selectedTabDefinition) {
      return selectedTabDefinition.title;
    }
  }

  getTabs() {
    const { selectedTab, tabs } = this.props;

    return tabs.map((tab, index) => {
      const { title, selectValue, definition } = tab;

      // Check if at least one field has errors
      const hasErrors =
        definition &&
        definition.reduce(function(lastErrors, field) {
          return lastErrors || !!field.showError;
        }, false);

      // Prepare classes
      const classes = classNames(
        "multiple-form-modal-sidebar-menu-item clickable visible-block",
        {
          selected: selectValue === selectedTab || title === selectedTab,
          "has-errors": hasErrors
        }
      );

      return (
        <li
          className={classes}
          key={index}
          onClick={this.handleTabClick.bind(this, selectValue)}
        >
          {title}
        </li>
      );
    });
  }

  render() {
    const {
      props: { className, selectedTab, tabs },
      state: { dropdownOpen }
    } = this;

    const classes = classNames(
      "list-unstyled multiple-form-modal-sidebar-menu",
      {
        "is-hidden": !dropdownOpen
      }
    );

    const caretClasses = classNames("caret caret--desc caret--visible", {
      dropup: dropdownOpen
    });

    return (
      <div className={className}>
        <span
          className="multiple-form-modal-sidebar-menu-item multiple-form-modal-sidebar-collapsed-header clickable visible-mini"
          onClick={this.handleTabClick.bind(this, selectedTab)}
        >
          {this.getSelectedTabTitle(selectedTab, tabs)}
          <span className={caretClasses} />
        </span>
        <ul className={classes}>
          {this.getTabs()}
        </ul>
      </div>
    );
  }
}

SideTabs.defaultProps = {
  className: "multiple-form-modal-sidebar-tabs",
  onTabClick() {},
  tabs: []
};

SideTabs.propTypes = {
  className: React.PropTypes.string,
  onTabClick: React.PropTypes.func,
  selectedTab: React.PropTypes.string,
  tabs: React.PropTypes.array
};

module.exports = SideTabs;
