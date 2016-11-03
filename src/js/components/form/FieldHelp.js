import classNames from 'classnames/dedupe';
import React from 'react';

import Util from '../../utils/Util';

const FieldHelp = (props) => {
  let {className} = props;
  let classes = classNames('small flush-bottom', className);

  return (
    <p
      className={classes}
      {...Util.omit(props, Object.keys(FieldHelp.propTypes))} />
  );
};

FieldHelp.propTypes = {
  // Classes
  className: React.PropTypes.oneOfType([
    React.PropTypes.array,
    React.PropTypes.object,
    React.PropTypes.string
  ])
};

module.exports = FieldHelp;
