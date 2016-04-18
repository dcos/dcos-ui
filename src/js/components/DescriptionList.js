import React from 'react';

class DescriptionList extends React.Component {
  getHeadline() {
    let {headline} = this.props;
    if (!headline) {
      return null;
    }

    // Wrap in headline element and classes
    return (
      <h6 className="flush-top">
        {headline}
      </h6>
    );
  }

  getItems() {
    let {hash, dtClassName, ddClassName} = this.props;

    return Object.keys(hash).map(function (key, index) {
      let value = hash[key];

      // Check whether we are trying to render an object that is not a
      // React component
      if (typeof value === 'object' && !Array.isArray(value) &&
        value !== null && !React.isValidElement(value)) {

        return (
          <DescriptionList hash={value} key={index} headline={key} />
        );
      }

      if (typeof value === 'boolean') {
        value = value.toString();
      }

      return (
        <dl key={index} className="flex-box row">
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
  ddClassName: 'column-9',
  dtClassName: 'column-3 emphasize',
  key: ''
};

DescriptionList.propTypes = {
  className: React.PropTypes.string,
  ddClassName: React.PropTypes.string,
  dtClassName: React.PropTypes.string,
  headline: React.PropTypes.node,
  hash: React.PropTypes.object,
  key: React.PropTypes.string
};

module.exports = DescriptionList;
