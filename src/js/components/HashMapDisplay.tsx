import PropTypes from "prop-types";
import * as React from "react";

import ConfigurationMapHeading from "./ConfigurationMapHeading";
import ConfigurationMapLabel from "./ConfigurationMapLabel";
import ConfigurationMapRow from "./ConfigurationMapRow";
import ConfigurationMapSection from "./ConfigurationMapSection";
import ConfigurationMapValue from "./ConfigurationMapValue";

class HashMapDisplay extends React.PureComponent {
  static defaultProps = {
    headingLevel: 1,
    renderKeys: {},
  };
  static propTypes = {
    headingLevel: PropTypes.oneOf([1, 2, 3, 4, 5, 6]),
    headlineClassName: PropTypes.string,
    headline: PropTypes.node,
    hash: PropTypes.object,
    // Optional object with keys consisting of keys in `props.hash` to be
    // replaced, and with corresponding values of the replacement to be rendered.
    renderKeys: PropTypes.object,
    emptyValue: PropTypes.string,
  };

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

  getHashMapDisplay(headline, hashMap) {
    // Increase the heading level for each nested description list,
    // ensuring we don't surpass heading level <h6/>.
    const nextHeadingLevel = Math.min(this.props.headingLevel + 1, 6);

    return (
      <HashMapDisplay
        {...this.props}
        hash={hashMap}
        headingLevel={nextHeadingLevel}
        key={`hash-map-${headline}`}
        headline={headline}
      />
    );
  }

  getItemRow(headline, value) {
    const isAttribute = this.props.headline === "Attributes";

    return (
      <ConfigurationMapRow key={`hash-map-value-${headline}`}>
        <ConfigurationMapLabel keepTextCase={isAttribute}>
          {headline}
        </ConfigurationMapLabel>
        <ConfigurationMapValue>{this.formatValue(value)}</ConfigurationMapValue>
      </ConfigurationMapRow>
    );
  }

  getItems() {
    const { hash, renderKeys } = this.props;

    return Object.keys(hash).map((key) => {
      const value = hash[key];

      if (this.isHashMap(value)) {
        return this.getHashMapDisplay(key, value);
      }

      // Check if we need to render a component in the dt
      if (Object.prototype.hasOwnProperty.call(renderKeys, key)) {
        key = renderKeys[key];
      }

      return this.getItemRow(key, value);
    });
  }

  render() {
    const { hash } = this.props;

    if (!hash || Object.keys(hash).length === 0) {
      return null;
    }

    return (
      <ConfigurationMapSection>
        {this.getHeadline()}
        {this.getItems()}
      </ConfigurationMapSection>
    );
  }
  formatValue = (value) => {
    if (typeof value === "boolean") {
      value = value.toString();
    }

    if (Array.isArray(value)) {
      value = value.join(", ");
    }

    if (!value && this.props.emptyValue) {
      value = this.props.emptyValue;
    }

    return value;
  };
  isHashMap = (value) => {
    // Check whether we are trying to render an object that is not a
    // React component

    return (
      typeof value === "object" &&
      !Array.isArray(value) &&
      value !== null &&
      !React.isValidElement(value)
    );
  };
}

export default HashMapDisplay;
