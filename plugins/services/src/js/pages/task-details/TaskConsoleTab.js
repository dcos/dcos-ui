import React from 'react';

const METHODS_TO_BIND = [
];

class TaskConsoleTab extends React.Component {
  constructor() {
    super(...arguments);

    this.state = {
    };

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  render() {
    return (
      <div>
        Console Placeholder
      </div>
    );
  }
}

TaskConsoleTab.propTypes = {
  task: React.PropTypes.shape({
    slave_id: React.PropTypes.string
  })
};

module.exports = TaskConsoleTab;
