import PureRender from 'react-addons-pure-render-mixin';
import React from 'react';

class DescriptionList extends React.Component {
  constructor() {
    super(...arguments);
    this.shouldComponentUpdate = PureRender.shouldComponentUpdate.bind(this);
  }

  getHeadline() {
    let {headline, headlineClassName} = this.props;
    if (!headline) {
      return null;
    }

    // Wrap in headline element and classes
    return (
      <h5 className={headlineClassName}>
        {headline}
      </h5>
    );
  }

  getItems() {
    let {dtClassName, ddClassName, hash, renderKeys} = this.props;

    return Object.keys(hash).map((key, index) => {
      let value = hash[key];

      // Check whether we are trying to render an object that is not a
      // React component
      if (typeof value === 'object' && !Array.isArray(value) &&
        value !== null && !React.isValidElement(value)) {

        return (
          <DescriptionList
            {...this.props}
            hash={value}
            key={index}
            headline={key} />
        );
      }

      if (typeof value === 'boolean') {
        value = value.toString();
      }

      // Check if we need to render a component in the dt
      if (Object.prototype.hasOwnProperty.call(renderKeys, key)) {
        key = renderKeys[key];
      }

      return (
        <dl key={index} className="flex row">
          <dt className={dtClassName}>{key}</dt>
          <dd className={ddClassName}>{value}</dd>
        </dl>
      );
    });
  }

  render() {
    let {hash, className} = this.props;
    if (!hash || Object.keys(hash).length === 0) {
      return null;
    }

    return (
      <div className={className} key={this.props.key}>
        {this.getHeadline()}
        {this.getItems()}
      </div>
    );
  }
}

DescriptionList.defaultProps = {
  className: '',
  ddClassName: 'column-9 text-overflow-break-word',
  dtClassName: 'column-3 text-mute text-overflow-break-word',
  headlineClassName: 'flush-top',
  key: '',
  renderKeys: {}
};

DescriptionList.propTypes = {
  className: React.PropTypes.string,
  ddClassName: React.PropTypes.string,
  dtClassName: React.PropTypes.string,
  headlineClassName: React.PropTypes.string,
  headline: React.PropTypes.node,
  hash: React.PropTypes.object,
  key: React.PropTypes.string,
  // Optional object with keys consisting of keys in `props.hash` to be
  // replaced, and with corresponding values of the replacement to be rendered.
  renderKeys: React.PropTypes.object
};

module.exports = DescriptionList;
