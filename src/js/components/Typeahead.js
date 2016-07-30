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
      onDropdownItemSelection,
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
          onChange={onDropdownItemSelection}
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
  emptyLabel: 'Nothing to show.',
  onDropdownItemSelection: function () {},
  inverseStyle: false,
  items: [],
  selected: [],
  placeholder: 'Filter'
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

module.exports = Typeahead;
