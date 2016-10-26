import {Link} from 'react-router';
import React, {PropTypes} from 'react';

import AlertPanel from '../../../../../src/js/components/AlertPanel';
import Icon from '../../../../../src/js/components/Icon';

const ServiceItemNotFound = function ({ message }) {

  const icon = <Icon id="services" color="neutral" size="jumbo" />;
  const footer = (
    <Link to="/services" className="button button-stroke">
      Go back to Services Page
    </Link>
  );

  return (
    <AlertPanel
      title="Not Found"
      footer={footer}
      icon={icon}>
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
