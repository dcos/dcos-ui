import {Link} from 'react-router';
import React, {PropTypes} from 'react';

import AlertPanel from '../../../../../src/js/components/AlertPanel';

const ServiceItemNotFound = function ({ message }) {

  const footer = (
    <Link to="/services" className="button button-stroke">
      Go back to Services Page
    </Link>
  );

  return (
    <AlertPanel
      title="Not Found"
      footer={footer}
      >
      <p className="flush-bottom">
        {message}
      </p>
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
