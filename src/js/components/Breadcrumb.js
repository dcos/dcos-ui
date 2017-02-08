import React from 'react';

function Breadcrumb(props) {
  return props.children;
}

Breadcrumb.propTypes = {
  title: React.PropTypes.string.isRequired
};

module.exports = Breadcrumb;
