import { Trans } from "@lingui/macro";
import * as React from "react";
import PropTypes from "prop-types";

import { findNestedPropertyInObject } from "#SRC/js/utils/Util";
import AddButton from "#SRC/js/components/form/AddButton";
import FieldError from "#SRC/js/components/form/FieldError";
import FormGroup from "#SRC/js/components/form/FormGroup";
import FormRow from "#SRC/js/components/form/FormRow";
import MetadataStore from "#SRC/js/stores/MetadataStore";

import PlacementRegionSelection from "./PlacementRegionSelection";
import ZoneSelection from "./ZoneSelection";
import LearnMoreTooltip from "./LearnMoreTooltip";
import PlacementConstraintsFields from "./PlacementConstraintsFields";

function partitionConstraints(memo, constraint, index) {
  const { fieldName, operator, type } = constraint;

  if (
    type === "zone" &&
    fieldName === "@zone" &&
    operator === "GROUP_BY" &&
    memo.zone.constraint == null
  ) {
    memo.zone = {
      index,
      constraint
    };

    return memo;
  }
  if (
    type === "region" &&
    fieldName === "@region" &&
    operator === "IS" &&
    memo.region.constraint == null
  ) {
    memo.region = {
      index,
      constraint
    };

    return memo;
  }
  memo.constraints.push({ index, constraint });

  return memo;
}

export default class PlacementFormPartial extends React.Component {
  static propTypes = {
    renderRegion: PropTypes.bool,
    data: PropTypes.object.isRequired,
    errors: PropTypes.object,
    onAddItem: PropTypes.func.isRequired,
    onRemoveItem: PropTypes.func.isRequired
  };
  render() {
    const { data, errors, onAddItem, onRemoveItem, renderRegion } = this.props;

    const mappedData = data.constraints.reduce(partitionConstraints, {
      region: {
        index: data.constraints.length
      },
      zone: {
        index: data.constraints.length
      },
      constraints: []
    });
    const constraintsErrors = findNestedPropertyInObject(errors, "constraints");
    let errorNode = null;

    const hasErrors =
      constraintsErrors != null && !Array.isArray(constraintsErrors);

    if (hasErrors) {
      errorNode = (
        <FormGroup showError={hasErrors}>
          <FieldError>{constraintsErrors}</FieldError>
        </FormGroup>
      );
    }

    return (
      <div>
        {renderRegion && <PlacementRegionSelection data={mappedData.region} />}
        <ZoneSelection data={mappedData.zone} />
        <h3 className="short-bottom">
          <Trans render="span">Advanced Constraints</Trans>{" "}
          <LearnMoreTooltip
            content={
              <Trans render="span">
                Constraints have three parts: a field name, an operator, and an
                optional parameter. The field can be the hostname of the agent
                node or any attribute of the agent node.
              </Trans>
            }
            link={MetadataStore.buildDocsURI(
              "/deploying-services/marathon-parameters/#constraints"
            )}
          />
        </h3>
        <Trans render="p">
          Control where your app runs with advanced rules and constraint
          attributes
        </Trans>
        <PlacementConstraintsFields
          data={mappedData.constraints}
          errors={errors}
          onRemoveItem={onRemoveItem}
        />
        {errorNode}
        <FormRow>
          <FormGroup className="column-12">
            <AddButton
              className="form-spacing-top"
              onClick={onAddItem.bind(this, {
                path: "constraints",
                value: { type: "default" }
              })}
            >
              <Trans render="span">Add Constraint</Trans>
            </AddButton>
          </FormGroup>
        </FormRow>
      </div>
    );
  }
}

PlacementFormPartial.defaultProps = {
  renderRegion: true,
  onRemoveItem: () => {}
};
