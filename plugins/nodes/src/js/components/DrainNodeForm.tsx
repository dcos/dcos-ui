export { DrainNodeForm as default, DrainOptions };

import * as React from "react";
import { Trans } from "@lingui/macro";
import { Tooltip } from "reactjs-components";

import FieldInput from "#SRC/js/components/form/FieldInput";
import FormGroup from "#SRC/js/components/form/FormGroup";
import FieldLabel from "#SRC/js/components/form/FieldLabel";
import FormGroupHeading from "#SRC/js/components/form/FormGroupHeading";
import FormGroupHeadingContent from "#SRC/js/components/form/FormGroupHeadingContent";
import InfoTooltipIcon from "#SRC/js/components/form/InfoTooltipIcon";

interface Props {
  onChange: (options: Partial<DrainOptions>) => void;
  formData: DrainOptions;
}

interface DrainOptions {
  maxGracePeriod: number | null;
  decommission: boolean;
}

function DrainNodeForm(props: Props) {
  const { formData, onChange } = props;

  const helpText = (
    <Trans>
      The maximum amount of time allowed for tasks to gracefully terminate.
    </Trans>
  );

  const handleChangeMaxGracePeriod = (e: React.FormEvent<HTMLFormElement>) => {
    const el = e.target as HTMLInputElement;
    onChange({
      maxGracePeriod: el.checkValidity()
        ? parseInt(el.value, 10)
        : formData.maxGracePeriod,
    });
  };

  const handleChangeDecommission = (e: React.FormEvent<HTMLFormElement>) => {
    const { value } = e.target as HTMLInputElement;
    onChange({ decommission: value === "1" });
  };

  return (
    <form>
      <FormGroup>
        <Trans render="p">Optional settings for draining node</Trans>
        <FieldLabel>
          <FormGroupHeading>
            <FormGroupHeadingContent>
              <Trans render="span">Max Grace Period</Trans>{" "}
              <Tooltip
                content={helpText}
                interactive={true}
                maxWidth={300}
                wrapperClassName="tooltip-wrapper text-align-center"
                wrapText={true}
              >
                <InfoTooltipIcon />
              </Tooltip>
            </FormGroupHeadingContent>
          </FormGroupHeading>
        </FieldLabel>
        <FieldInput
          id="max_grace_period"
          name="max_grace_period"
          type="text"
          min="0"
          placeholder="Enter in seconds"
          value={formData.maxGracePeriod || ""}
          onChange={handleChangeMaxGracePeriod}
        />
      </FormGroup>
      <FormGroup>
        <FieldLabel>
          <FormGroupHeading>
            <FormGroupHeadingContent>
              <Trans render="span">Decommission</Trans>
            </FormGroupHeadingContent>
          </FormGroupHeading>
        </FieldLabel>
        <FieldLabel>
          <FieldInput
            checked={!formData.decommission}
            name="decommission"
            type="radio"
            value="0"
            onChange={handleChangeDecommission}
          />
          <Trans>Drain only</Trans>
        </FieldLabel>
        <FieldLabel>
          <FieldInput
            checked={formData.decommission}
            name="decommission"
            type="radio"
            value="1"
            onChange={handleChangeDecommission}
          />
          <Trans>Drain and decommission</Trans>
        </FieldLabel>
      </FormGroup>
    </form>
  );
}
