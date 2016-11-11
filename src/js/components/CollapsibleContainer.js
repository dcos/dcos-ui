import React, {Component} from 'react';

import Icon from './Icon';

class CollapsibleContainer extends Component {
  constructor() {
    super(...arguments);

    this.state = {
      toggle: false
    };
    this.toggleContainer = this.toggleContainer.bind(this);
  }

  toggleContainer() {
    this.setState({toggle: !this.state.toggle});
  }

  getChildren() {
    if (this.state.toggle) {
      return this.props.children;
    }
    return null;
  }

  render() {
    let icon = 'triangle-right';
    if (this.state.toggle) {
      icon = 'triangle-down';
    }

    return (
      <div>
        <a className="button button-primary-link button-flush" onClick={this.toggleContainer}>
          <Icon
            id={icon}
            color="purple"
            family="mini"
            size="mini" />
          {this.props.label}
        </a>
        {this.getChildren()}
      </div>
    );
  }

}

CollapsibleContainer.defaultProps = {
  label: ''
};

CollapsibleContainer.propTypes = {
  label: React.PropTypes.string
};

module.exports = CollapsibleContainer;
