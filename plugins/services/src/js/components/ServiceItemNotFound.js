import {Link} from 'react-router';
import React, {PropTypes} from 'react';

import AlertPanel from '../../../../../src/js/components/AlertPanel';

const ServiceItemNotFound = function ({ message }) {

  const footer = (
    <div className="button-collection flush-bottom">
      <Link to="/services" className="button button-stroke">
        View Services
      </Link>
    </div>
  );

  return (
    <AlertPanel
      title="Service not found"
      >
      <p className="tall">
        {message}
      </p>
      {footer}
    </AlertPanel>
  );
};

ServiceItemNotFound.defaultProps = {
  message: 'Not Found.'
};

ServiceItemNotFound.propTypes = {
  message: PropTypes.node
};

module.exports = ServiceItemNotFound;
