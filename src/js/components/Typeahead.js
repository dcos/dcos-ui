/* @flow */
import classNames from "classnames";
import InnerTypeahead from "mesosphere-react-typeahead";
/* eslint-disable no-unused-vars */
import React, { PropTypes } from "react";
/* eslint-enable no-unused-vars */

import FilterInputText from "./FilterInputText";

type Props = {
  emptyLabel?: string,
  labelKey: string,
  onDropdownItemSelection?: Function,
  handleFilterChange: Function,
  inverseStyle?: boolean,
  items?: Array<{
    id?: string,
    name?: number | string | React.Element | Array<any>
  }>,
  selected?: Array<any>,
  placeholder?: string,
  searchString: string
};

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
          typeaheadMenuClassName="dropdown-menu-list"
          typeaheadMenuWrapperClassName="dropdown-menu"
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

module.exports = Typeahead;
