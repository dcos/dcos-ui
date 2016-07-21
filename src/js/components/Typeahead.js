import InnerTypeahead from 'mesosphere-react-typeahead';
/* eslint-disable no-unused-vars */
import React, {PropTypes} from 'react';
/* eslint-enable no-unused-vars */

import FilterInputText from './FilterInputText';

class Typeahead extends FilterInputText {
  handleInputChange(input) {
    this.props.handleFilterChange(input);
  }

  componentWillUpdate() {
    if (this.inputField == null && this.typeahead) {
      if (this.typeahead.refs.inner) {
        if (this.typeahead.refs.inner.inputComponent) {
          this.inputField = this.typeahead.refs.inner.inputComponent.input;
        }
      }
    }
  }

  renderClearIcon() {
    if (this.inputField && this.inputField.value) {
      return this.getClearIcon();
    }
  }

  getInputField() {
    let {
      emptyLabel,
      labelKey,
      onChange,
      items,
      placeholder,
      selected
    } = this.props;

    if (selected === '') {
      selected = [];
    }

    return (
      <div className="typeahead inverse">
        <InnerTypeahead
          emptyLabel={emptyLabel}
          labelKey={labelKey}
          onChange={onChange}
          onInputChange={this.handleInputChange}
          options={items}
          placeholder={placeholder}
          ref={(ref) => this.typeahead = ref}
          selected={selected}
          typeaheadMenuClassName="dropdown-menu-list"
          typeaheadMenuWrapperClassName="dropdown-menu" />
      </div>
    );
  }
}

Typeahead.defaultProps = {
  labelKey: 'name'
};

Typeahead.propTypes = {
  emptyLabel: PropTypes.string,
  labelKey: PropTypes.string,
  onChange: PropTypes.func,
  items: PropTypes.array,
  selected: PropTypes.array
};

module.exports = Typeahead;
