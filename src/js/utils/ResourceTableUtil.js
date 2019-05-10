import classNames from "classnames";
/* eslint-disable no-unused-vars */
import React from "react";
/* eslint-enable no-unused-vars */
import { Tooltip } from "reactjs-components";
import { Trans } from "@lingui/macro";

import InfoTooltipIcon from "#SRC/js/components/form/InfoTooltipIcon";

import TimeAgo from "../components/TimeAgo";
import Util from "./Util";

const LEFT_ALIGN_PROPS = [
  "cpus",
  "gpus",
  "disk",
  "log",
  "mem",
  "mtime",
  "priority",
  "size"
];

function leftAlignCaret(prop) {
  return LEFT_ALIGN_PROPS.includes(prop);
}

function getUpdatedTimestamp(model) {
  const lastStatus = Util.last(model.statuses);

  return (lastStatus && lastStatus.timestamp) || null;
}

const ResourceTableUtil = {
  getClassName(prop, sortBy, row) {
    return classNames({
      "text-align-right":
        leftAlignCaret(prop) || prop === "TASK_RUNNING" || prop === "action",
      "hidden-small-down": leftAlignCaret(prop),
      active: prop === sortBy.prop,
      clickable: row == null // this is a header
    });
  },

  renderHeading(config) {
    return function(prop, order, sortBy) {
      const title = config[prop];
      const caret = {
        before: null,
        after: null
      };
      const caretClassSet = classNames("caret", {
        [`caret--${order}`]: order != null,
        "caret--visible": prop === sortBy.prop
      });
      let helpIcon = null;

      if (leftAlignCaret(prop) || prop === "TASK_RUNNING") {
        caret.before = <span className={caretClassSet} />;
      } else {
        caret.after = <span className={caretClassSet} />;
      }

      if (this.helpText != null) {
        helpIcon = (
          <Tooltip
            content={this.helpText}
            wrapText={true}
            interactive={true}
            wrapperClassName="tooltip-wrapper text-align-center table-header-icon"
          >
            <InfoTooltipIcon />
          </Tooltip>
        );
      }

      return (
        <span>
          {caret.before}
          <Trans render="span" id={title} className="table-header-title" />
          {helpIcon}
          {caret.after}
        </span>
      );
    };
  },

  renderUpdated(prop, model) {
    const updatedAt = getUpdatedTimestamp(model);

    if (updatedAt == null) {
      return "N/A";
    }

    const ms = updatedAt.toFixed(3) * 1000;

    return <TimeAgo time={ms} autoUpdate={false} />;
  },

  renderTask(prop, model) {
    return (
      <span>
        {model[prop]}
        <span className="visible-mini-inline"> tasks</span>
      </span>
    );
  }
};

module.exports = ResourceTableUtil;
