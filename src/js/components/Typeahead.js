import classNames from 'classnames';
import InnerTypeahead from 'mesosphere-react-typeahead';
/* eslint-disable no-unused-vars */
import React, {PropTypes} from 'react';
/* eslint-enable no-unused-vars */

import FilterInputText from './FilterInputText';

class Typeahead extends FilterInputText {
  handleInputChange(input) {
    this.props.handleFilterChange(input);
  }

  renderClearIcon() {
    return this.getClearIcon();
  }

  handleClearInput() {
    if (this.typeahead) {
      this.typeahead.clear();
    };
  }

  getInputField() {
    let {
      emptyLabel,
      labelKey,
      inverseStyle,
      items,
      onChange,
      placeholder,
      selected
    } = this.props;

    if (selected === '') {
      selected = [];
    }

    let classSet = classNames('typeahead', {
      'inverse': inverseStyle
    });

    return (
      <div className={classSet}>
        <InnerTypeahead
          emptyLabel={emptyLabel}
          labelKey={labelKey}
          onChange={onChange}
          onInputChange={this.handleInputChange}
          options={items}
          placeholder={placeholder}
          ref={ref => { if (ref) { this.typeahead = ref.getInstance(); } }}
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
