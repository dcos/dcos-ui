import React from 'react';

import SchemaForm from './SchemaForm';

const METHODS_TO_BIND = [
  'getTriggerSubmit',
  'onResize',
  'triggerSubmit'
];
const MOBILE_WIDTH = 480;

class AdvancedConfig extends React.Component {
  constructor() {
    super();

    this.state = {
      isMobileWidth: false
    };

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  componentWillMount() {
    this.setState({isMobileWidth: this.isMobileWidth(global.window)});
    global.window.addEventListener('resize', this.onResize);
    this.props.getTriggerSubmit(this.triggerSubmit);
  }

  componentWillUnmount() {
    global.window.removeEventListener('resize', this.onResize);
  }

  onResize(e) {
    let isMobileWidth = this.isMobileWidth(e.target);
    if (isMobileWidth !== this.state.isMobileWidth) {
      this.setState({isMobileWidth});
    }
  }

  triggerSubmit() {
    return this.triggerSchemaSubmit();
  }

  isMobileWidth(element) {
    return element.innerWidth <= MOBILE_WIDTH;
  }

  getTriggerSubmit(triggerSubmit) {
    this.triggerSchemaSubmit = triggerSubmit;
  }

  render() {
    let {
      className,
      model,
      onChange,
      packageIcon,
      packageName,
      packageVersion,
      schema
    } = this.props;

    return (
      <div className={className}>
        <SchemaForm
          getTriggerSubmit={this.getTriggerSubmit}
          isMobileWidth={this.state.isMobileWidth}
          model={model}
          onChange={onChange}
          schema={schema}
          packageIcon={packageIcon}
          packageName={packageName}
          packageVersion={packageVersion} />
      </div>
    );
  }
}

AdvancedConfig.defaultProps = {
  getTriggerSubmit: function () {},
  onChange: function () {},
  schema: {}
};

AdvancedConfig.propTypes = {
  getTriggerSubmit: React.PropTypes.func,
  model: React.PropTypes.object,
  onChange: React.PropTypes.func,
  schema: React.PropTypes.object,
  packageIcon: React.PropTypes.string,
  packageName: React.PropTypes.string,
  packageVersion: React.PropTypes.string
};

module.exports = AdvancedConfig;
