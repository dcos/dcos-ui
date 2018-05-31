import classNames from "classnames/dedupe";
import PropTypes from "prop-types";
import React from "react";

import Config from "../config/Config";

function getDefaultMessage() {
  const slackLink = (
    <a href={Config.slackChannel} target="_blank">
      Slack channel
    </a>
  );
  const supportLink = (
    <a href={`mailto:${Config.supportEmail}`}>{Config.supportEmail}</a>
  );

  return (
    <p className="text-align-center flush-bottom">
      You can also join us on our {slackLink} or send us an email at{" "}
      {supportLink}
      .
    </p>
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
          <h3 className="text-align-center flush-top">{header}</h3>
          {message}
        </div>
      </div>
    );
  }
}

RequestErrorMsg.defaultProps = {
  columnClasses: {},
  header: "Cannot Connect With The Server",
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

module.exports = RequestErrorMsg;
