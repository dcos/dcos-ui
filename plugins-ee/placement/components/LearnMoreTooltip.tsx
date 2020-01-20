import { Trans } from "@lingui/macro";
import * as React from "react";
import { Tooltip } from "reactjs-components";
import InfoTooltipIcon from "#SRC/js/components/form/InfoTooltipIcon";

export default function LearnMoreTooltip({ content, link }) {
  return (
    <Tooltip
      content={
        <span>
          {content}{" "}
          <Trans render={<a href={link} target="_blank" />}>Learn more</Trans>.
        </span>
      }
      interactive={true}
      maxWidth={300}
      wrapText={true}
    >
      <InfoTooltipIcon />
    </Tooltip>
  );
}
