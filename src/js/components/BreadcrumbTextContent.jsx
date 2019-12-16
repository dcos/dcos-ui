import PropTypes from "prop-types";
import React from "react";

const BreadcrumbTextContent = ({ children }) => {
  if (!children) {
    return <noscript />;
  }

  return (
    <div className="breadcrumb__content breadcrumb__content--text">
      {children}
    </div>
  );
};

BreadcrumbTextContent.propTypes = {
  title: PropTypes.string
};

export default BreadcrumbTextContent;
