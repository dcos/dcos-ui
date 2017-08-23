/* @flow */
import React from "react";

type Props = { title?: string };

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

module.exports = BreadcrumbTextContent;
