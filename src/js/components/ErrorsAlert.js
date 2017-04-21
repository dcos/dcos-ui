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

  // De-duplicate error messages that have exactly the same translated output
  const errorMessages = showErrors.reduce(function(messages, error) {
    const message = getUnanchoredErrorMessage(error, pathMapping);
    if (messages.indexOf(message) !== -1) {
      return messages;
    }

    messages.push(message);

    return messages;
  }, []);

  const errorItems = errorMessages.map((message, index) => {
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
