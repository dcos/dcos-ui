import React from 'react';

import CheckboxTable from './CheckboxTable';
import ExpandingTable from './ExpandingTable';

class ExpandingWithCheckboxTable extends React.Component {
  getColGroup() {
    return (
      <colgroup>
        <col style={{width: '40px'}} />
        <col />
        <col style={{width: '120px'}} className="hidden-mini" />
        <col style={{width: '160px'}} className="hidden-mini" />
        <col style={{width: '160px'}} className="hidden-mini" />
      </colgroup>
    );
  }

  render() {
    return (
      <ExpandingTable {...this.props}
        getColGroup={this.getColGroup}
        tableComponent={CheckboxTable} />
    );
  }
}

module.exports = ExpandingWithCheckboxTable;
