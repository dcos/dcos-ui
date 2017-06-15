import React from "react";

import Alert from "./Alert";
import { getUnanchoredErrorMessage } from "../utils/ErrorMessageUtil";

const ErrorsAlert = function(props) {
  const { errors, hideTopLevelErrors, pathMapping } = props;
  let showErrors = errors;

  if (hideTopLevelErrors) {
    showErrors = showErrors.filter(function(error) {
      return error.path.length === 0;
    });
  }

  if (showErrors.length === 0) {
    return <noscript />;
  }

  const errorItems = showErrors.map((error, index) => {
    const message = getUnanchoredErrorMessage(error, pathMapping);

    return (
      <li key={index} className="short">
        {message}
      </li>
    );
  });

  return (
    <Alert>
      <strong>There is an error with your configuration</strong>
      <div className="pod pod-narrower-left pod-shorter-top flush-bottom">
        <ul className="short flush-bottom">
          {errorItems}
        </ul>
      </div>
    </Alert>
  );
};

ErrorsAlert.defaultProps = {
  errors: [],
  hideTopLevelErrors: false,
  pathMapping: []
};

ErrorsAlert.propTypes = {
  errors: React.PropTypes.array,
  hideTopLevelErrors: React.PropTypes.bool,
  pathMapping: React.PropTypes.array
};

module.exports = ErrorsAlert;
