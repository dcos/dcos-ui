import * as React from "react";
import { Trans } from "@lingui/macro";
import { Tooltip } from "reactjs-components";

import FormGroupHeading from "#SRC/js/components/form/FormGroupHeading";
import FormGroupHeadingContent from "#SRC/js/components/form/FormGroupHeadingContent";
import InfoTooltipIcon from "#SRC/js/components/form/InfoTooltipIcon";

import { FormOutput, FormError } from "./helpers/JobFormData";
import PlacementPartial from "./PlacementPartial";

interface PlacementSectionProps {
  formData: FormOutput;
  errors: FormError[];
  showErrors: boolean;
  onRemoveItem: (path: string, index: number) => void;
  onAddItem: (path: string) => void;
}

class PlacementSection extends React.Component<PlacementSectionProps, {}> {
  render() {
    const placementTooltipContent = (
      <Trans render="span">
        Constraints have three parts: a field name, an operator, and an optional{" "}
        parameter. The field can be the hostname of the agent node or any{" "}
        attribute of the agent node.
      </Trans>
    );

    return (
      <div className="form-section">
        <h1 className="flush-top short-bottom">
          <FormGroupHeading>
            <FormGroupHeadingContent primary={true}>
              <Trans render="span">Placement Constraints</Trans>
            </FormGroupHeadingContent>
            <FormGroupHeadingContent>
              <Tooltip
                content={placementTooltipContent}
                interactive={true}
                maxWidth={300}
                wrapText={true}
              >
                <InfoTooltipIcon />
              </Tooltip>
            </FormGroupHeadingContent>
          </FormGroupHeading>
        </h1>
        <PlacementPartial {...this.props} />
      </div>
    );
  }
}

export default PlacementSection;
