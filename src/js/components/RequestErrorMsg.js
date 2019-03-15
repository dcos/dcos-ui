import { Trans } from "@lingui/macro";
import { i18nMark } from "@lingui/react";

import classNames from "classnames/dedupe";
import PropTypes from "prop-types";
import React from "react";

import Config from "../config/Config";

function getDefaultMessage() {
  return (
    <Trans render="p" className="text-align-center flush-bottom">
      You can also join us on our{" "}
      <a href={Config.slackChannel} target="_blank">
        Slack channel
      </a>{" "}
      or send us an email at{" "}
      <a href={`mailto:${Config.supportEmail}`}>{Config.supportEmail}</a>.
    </Trans>
  );
}

class RequestErrorMsg extends React.Component {
  render() {
    let { columnClasses, header, message } = this.props;

    columnClasses = classNames(
      "column-small-8 column-small-offset-2",
      "column-medium-6 column-medium-offset-3",
      columnClasses
    );

    return (
      <div className="row">
        <div className={columnClasses}>
          <Trans
            render="h3"
            className="text-align-center flush-top"
            id={header}
          />
          {message}
        </div>
      </div>
    );
  }
}

RequestErrorMsg.defaultProps = {
  columnClasses: {},
  header: i18nMark(
    "DC/OS UI cannot retrieve the requested information at this moment."
  ),
  message: getDefaultMessage()
};

RequestErrorMsg.propTypes = {
  columnClasses: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object,
    PropTypes.string
  ]),
  header: PropTypes.node,
  message: PropTypes.node
};

export default RequestErrorMsg;
