import React from 'react';

import SchemaForm from './SchemaForm';

const METHODS_TO_BIND = [
  'getTriggerSubmit',
  'triggerSubmit'
];

class AdvancedConfig extends React.Component {
  constructor() {
    super();

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  componentWillMount() {
    this.props.getTriggerSubmit(this.triggerSubmit);
  }

  triggerSubmit() {
    return this.triggerSchemaSubmit();
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
