import classNames from "classnames";
import { Typeahead as InnerTypeahead } from "react-bootstrap-typeahead";
import PropTypes from "prop-types";
/* eslint-disable no-unused-vars */
import React from "react";
/* eslint-enable no-unused-vars */

import FilterInputText from "./FilterInputText";

class Typeahead extends FilterInputText {
  // Use this method to clear the input field with a ref.
  // See: https://github.com/mesosphere/react-typeahead#public-methods
  handleInputClear() {
    if (this.typeahead) {
      this.typeahead.clear();
      this.typeahead.focus();
    }
  }

  getInputField() {
    let {
      emptyLabel,
      labelKey,
      handleFilterChange,
      inverseStyle,
      items,
      onDropdownItemSelection,
      placeholder,
      selected
    } = this.props;

    if (selected === "") {
      selected = [];
    }

    const classSet = classNames("typeahead", {
      inverse: inverseStyle
    });

    return (
      <div className={classSet}>
        <InnerTypeahead
          emptyLabel={emptyLabel}
          labelKey={labelKey}
          onChange={onDropdownItemSelection}
          onInputChange={handleFilterChange}
          options={items}
          placeholder={placeholder}
          ref={ref => {
            if (ref) {
              this.typeahead = ref.getInstance();
            }
          }}
          selected={selected}
        />
      </div>
    );
  }
}

Typeahead.defaultProps = {
  emptyLabel: "Nothing to show.",
  onDropdownItemSelection() {},
  inverseStyle: false,
  items: [],
  selected: [],
  placeholder: "Filter"
};

Typeahead.propTypes = {
  emptyLabel: PropTypes.string,
  labelKey: PropTypes.string.isRequired,
  onDropdownItemSelection: PropTypes.func,
  handleFilterChange: PropTypes.func.isRequired,
  inverseStyle: PropTypes.bool,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.node
    })
  ),
  selected: PropTypes.array,
  placeholder: PropTypes.string,
  searchString: PropTypes.string.isRequired
};

export default Typeahead;
