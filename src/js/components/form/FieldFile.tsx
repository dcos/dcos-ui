import * as React from "react";
import PropTypes from "prop-types";

import { omit } from "../../utils/Util";

const FieldFile = props => <input type="file" {...omit(props, ["type"])} />;

FieldFile.defaultProps = {
  onChange: () => undefined,
  value: ""
};

FieldFile.propTypes = {
  onChange: PropTypes.func,
  value: PropTypes.string,

  // Classes
  className: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object,
    PropTypes.string
  ])
};

export default FieldFile;
