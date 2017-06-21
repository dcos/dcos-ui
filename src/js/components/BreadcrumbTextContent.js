import React from "react";

class BreadcrumbTextContent extends React.Component {
  render() {
    if (!this.props.children) {
      return <noscript />;
    }

    return (
      <div className="breadcrumb__content breadcrumb__content--text">
        {this.props.children}
      </div>
    );
  }
}

BreadcrumbTextContent.propTypes = {
  title: React.PropTypes.string
};

module.exports = BreadcrumbTextContent;
