import React from 'react';

const METHODS_TO_BIND = [
  'selectAll'
];

class ClickToSelect extends React.Component {
  constructor() {
    super();

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  selectAll(event) {
    event.preventDefault;
    let selection = document.getSelection();
    let node = this.target;

    selection.selectAllChildren(node);
  }

  render() {
    return (
      <span
        onClick={this.selectAll}
        ref={(node) => this.target = node}>
        {this.props.children}
      </span>
    );
  }
}

ClickToSelect.propTypes = {
  children: React.PropTypes.any
}

module.exports = ClickToSelect;
