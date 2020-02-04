import * as React from "react";
import { Trans } from "@lingui/macro";
import { Tooltip } from "reactjs-components";

import FormGroupHeading from "#SRC/js/components/form/FormGroupHeading";
import FormGroupHeadingContent from "#SRC/js/components/form/FormGroupHeadingContent";
import InfoTooltipIcon from "#SRC/js/components/form/InfoTooltipIcon";
import PlacementPartial from "#PLUGINS/jobs/src/js/components/form/PlacementPartial";
import {
  PlacementConstraint,
  FormError,
  FormOutput
} from "#PLUGINS/jobs/src/js/components/form/helpers/JobFormData";

import RegionSelection from "./RegionSelection";

interface JobPlacementSectionProps {
  formData: FormOutput;
  errors: FormError[];
  showErrors: boolean;
  onRemoveItem: (path: string, index: number) => void;
  onAddItem: (path: string) => void;
}

export default class JobPlacementSection extends React.Component<
  JobPlacementSectionProps,
  {}
> {
  public getHeader(): React.ReactNode {
    return (
      <h1 className="flush-top short-bottom">
        <FormGroupHeading>
          <FormGroupHeadingContent primary={true} title="Placement">
            <Trans>Placement</Trans>
          </FormGroupHeadingContent>
          <FormGroupHeadingContent>
            <Tooltip
              content={
                <Trans>
                  You can configure the placement of agent nodes in regions and
                  zones for high availability or to expand capacity to new
                  regions when necessary.
                </Trans>
              }
              interactive={true}
              maxWidth={300}
              wrapText={true}
            >
              <InfoTooltipIcon />
            </Tooltip>
          </FormGroupHeadingContent>
        </FormGroupHeading>
      </h1>
    );
  }

  public getRegionSelection(regionIndex: number): React.ReactNode {
    const {
      formData: { placementConstraints = [] }
    } = this.props;
    let regionConstraint: Partial<PlacementConstraint> = {
      value: ""
    };
    if (regionIndex < placementConstraints.length) {
      regionConstraint = placementConstraints[regionIndex];
    }
    const selectProps = {
      name: `${regionIndex}.regionConstraint`,
      type: "text",
      value: regionConstraint.value
    };

    return <RegionSelection selectProps={selectProps} />;
  }

  public getRegionIndex(): number {
    const {
      formData: { placementConstraints = [] }
    } = this.props;
    let regionIndex = placementConstraints.length;
    for (let i = 0; i < placementConstraints.length; i++) {
      const constraint = placementConstraints[i];
      if (constraint.type === "region") {
        regionIndex = i;
        break;
      }
    }
    return regionIndex;
  }

  public isGenericConstraintFactory(index: number) {
    return (constraint: PlacementConstraint) => {
      const {
        formData: { placementConstraints = [] }
      } = this.props;
      return constraint !== placementConstraints[index];
    };
  }

  public render() {
    const regionIndex = this.getRegionIndex();

    return (
      <div>
        {this.getHeader()}
        {this.getRegionSelection(regionIndex)}
        <h2 className="short-bottom">
          <Trans>Advanced Constraints</Trans>{" "}
          <Tooltip
            content={
              <Trans>
                Constraints have three parts: a field name, an operator, and an
                optional parameter. The field can be the hostname of the agent
                node or any attribute of the agent node.
              </Trans>
            }
            interactive={true}
            maxWidth={300}
            wrapText={true}
          >
            <InfoTooltipIcon />
          </Tooltip>
        </h2>
        <Trans render="p">
          Control where your job runs with advanced rules and constraint
          attributes
        </Trans>
        <PlacementPartial
          addButtonText={<Trans>Add Constraint</Trans>}
          getIsGenericConstraint={this.isGenericConstraintFactory(regionIndex)}
          {...this.props}
        />
      </div>
    );
  }
}
