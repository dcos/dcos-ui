import PureRender from "react-addons-pure-render-mixin";
import React from "react";

import ConfigurationMapEditAction
  from "#PLUGINS/services/src/js/components/ConfigurationMapEditAction";
import ConfigurationMapHeading from "./ConfigurationMapHeading";
import ConfigurationMapLabel from "./ConfigurationMapLabel";
import ConfigurationMapRow from "./ConfigurationMapRow";
import ConfigurationMapSection from "./ConfigurationMapSection";
import ConfigurationMapValue from "./ConfigurationMapValue";

class HashMapDisplay extends React.Component {
  constructor() {
    super(...arguments);
    this.shouldComponentUpdate = PureRender.shouldComponentUpdate.bind(this);
  }

  getHeadline() {
    const { headline, headlineClassName, headingLevel } = this.props;
    if (!headline) {
      return null;
    }

    // Wrap in headline element and classes
    return (
      <ConfigurationMapHeading
        className={headlineClassName}
        level={headingLevel}
      >
        {headline}
      </ConfigurationMapHeading>
    );
  }

  getItems() {
    const {
      hash,
      headingLevel,
      renderKeys,
      onEditClick,
      keyPath,
      emptyValue
    } = this.props;

    return Object.keys(hash).map((key, index) => {
      let value = hash[key];

      // Check whether we are trying to render an object that is not a
      // React component
      if (
        typeof value === "object" &&
        !Array.isArray(value) &&
        value !== null &&
        !React.isValidElement(value)
      ) {
        // Increase the heading level for each nested description list, making
        // ensuring we don't surpass heading level 6.
        const nextHeadingLevel = Math.min(headingLevel + 1, 6);

        return (
          <HashMapDisplay
            {...this.props}
            hash={value}
            headingLevel={nextHeadingLevel}
            key={index}
            headline={key}
            keyPath={keyPath.concat(key)}
          />
        );
      }

      if (typeof value === "boolean") {
        value = value.toString();
      }

      if (Array.isArray(value)) {
        value = value.join(", ");
      }

      if (value === "" && emptyValue) {
        value = emptyValue;
      }

      let action = null;
      if (onEditClick) {
        action = (
          <ConfigurationMapEditAction
            onEditClick={onEditClick}
            tabViewID={keyPath.concat(key).join(".")}
          />
        );
      }

      // Check if we need to render a component in the dt
      if (Object.prototype.hasOwnProperty.call(renderKeys, key)) {
        key = renderKeys[key];
      }

      const isAttribute = this.props.headline === "Attributes";

      return (
        <ConfigurationMapRow key={index}>
          <ConfigurationMapLabel keepTextCase={isAttribute}>
            {key}
          </ConfigurationMapLabel>
          <ConfigurationMapValue>{value}</ConfigurationMapValue>
          {action}
        </ConfigurationMapRow>
      );
    });
  }

  render() {
    const { hash } = this.props;
    if (!hash || Object.keys(hash).length === 0) {
      return null;
    }

    return (
      <ConfigurationMapSection key={this.props.key}>
        {this.getHeadline()}
        {this.getItems()}
      </ConfigurationMapSection>
    );
  }
}

HashMapDisplay.defaultProps = {
  headingLevel: 1,
  key: "",
  renderKeys: {},
  keyPath: []
};

HashMapDisplay.propTypes = {
  headingLevel: React.PropTypes.oneOf([1, 2, 3, 4, 5, 6]),
  headlineClassName: React.PropTypes.string,
  headline: React.PropTypes.node,
  hash: React.PropTypes.object,
  key: React.PropTypes.string,
  // Optional object with keys consisting of keys in `props.hash` to be
  // replaced, and with corresponding values of the replacement to be rendered.
  renderKeys: React.PropTypes.object,
  showActions: React.PropTypes.bool,
  onEditClick: React.PropTypes.func,
  tabViewID: React.PropTypes.string,
  keyPath: React.PropTypes.array,
  emptyValue: React.PropTypes.string
};

module.exports = HashMapDisplay;
