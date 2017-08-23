/* @flow */
import React, { PropTypes } from "react";

type Props = { logName?: string };

function EmptyLogScreen(props: Props) {
  let { logName } = props;
  // Append space if logName is defined
  logName = logName && logName + " ";

  return (
    <div className="flex-grow horizontal-center vertical-center">
      <h3 className="text-align-center flush-top">
        {`${logName} Log is Currently Empty`}
      </h3>
      <p className="text-align-center flush-bottom">
        Please try again later.
      </p>
    </div>
  );
}

module.exports = EmptyLogScreen;
