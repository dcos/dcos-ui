import { Typeahead as InnerTypeahead } from "@dcos/ui-kit";
import PropTypes from "prop-types";

import * as React from "react";

import FilterInputText from "./FilterInputText";

class Typeahead extends FilterInputText {
  static defaultProps = {
    emptyLabel: "Nothing to show.",
    onDropdownItemSelection() {},
    items: [],
    selected: [],
    placeholder: "Filter",
  };
  static propTypes = {
    emptyLabel: PropTypes.string,
    labelKey: PropTypes.string.isRequired,
    onDropdownItemSelection: PropTypes.func,
    handleFilterChange: PropTypes.func.isRequired,
    items: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string,
        name: PropTypes.node,
      })
    ),
    selected: PropTypes.array,
    placeholder: PropTypes.string,
    searchString: PropTypes.string.isRequired,
  };

  getInputField() {
    let {
      emptyLabel,
      labelKey,
      handleFilterChange,
      items,
      onDropdownItemSelection,
      placeholder,
      searchString,
      selected,
    } = this.props;

    if (selected === "") {
      selected = [];
    }

    const toUiKit = (i) => ({ value: i.id, label: i[labelKey] });
    const fromUiKit = (i) => ({ id: i });
    const options = items
      .filter((i) => i[labelKey].match(new RegExp(searchString)))
      .map(toUiKit);

    const onChange = (e) => handleFilterChange(e?.currentTarget?.value);
    const onSelect = (os) => onDropdownItemSelection(os.map(fromUiKit));

    return (
      <div className="typeahead">
        <InnerTypeahead
          items={options}
          menuEmptyState={<div style={{ padding: "1em" }}>{emptyLabel}</div>}
          onSelect={onSelect}
          resetInputOnSelect={true}
          textField={
            <input
              className="form-control filter-input-text"
              onChange={onChange}
              placeholder={placeholder}
              ref={(ref) => (this.inputField = ref)}
              value={searchString}
            />
          }
        />
      </div>
    );
  }
}
export default Typeahead;
