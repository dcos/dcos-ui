import { Trans } from "@lingui/macro";
import PropTypes from "prop-types";
import React from "react";

function EmptyLogScreen({ logName }) {
  // Append space if logName is defined
  logName = logName && logName + " ";

  return (
    <div className="flex-grow horizontal-center vertical-center">
      <Trans render="h3" className="text-align-center flush-top">
        {logName} Log is Currently Empty
      </Trans>
      <Trans render="p" className="text-align-center flush-bottom">
        Please try again later.
      </Trans>
    </div>
  );
}

EmptyLogScreen.propTypes = {
  logName: PropTypes.string
};

module.exports = EmptyLogScreen;
