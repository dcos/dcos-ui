import { Trans } from "@lingui/macro";
import { i18nMark } from "@lingui/react";

import classNames from "classnames/dedupe";
import PropTypes from "prop-types";
import * as React from "react";

import Config from "../config/Config";

function getDefaultMessage() {
  return (
    <p className="text-align-center flush-bottom">
      <Trans
        id="You can also join us on our <0>Slack channel</0> or send us an email at <1></1>."
        components={[
          <a href={Config.slackChannel} target="_blank" />,
          <a href={`mailto:${Config.supportEmail}`}>{Config.supportEmail}</a>,
        ]}
      />
    </p>
  );
}

const RequestErrorMsg = (props) => {
  const { header, message } = props;
  let { columnClasses } = props;

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
};

RequestErrorMsg.defaultProps = {
  columnClasses: {},
  header: i18nMark(
    "DC/OS UI cannot retrieve the requested information at this moment."
  ),
  message: getDefaultMessage(),
};

RequestErrorMsg.propTypes = {
  columnClasses: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object,
    PropTypes.string,
  ]),
  header: PropTypes.node,
  message: PropTypes.node,
};

export default RequestErrorMsg;
