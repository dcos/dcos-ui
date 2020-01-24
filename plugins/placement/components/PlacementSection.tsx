import { Trans } from "@lingui/macro";
import * as React from "react";

import FormGroupHeading from "#SRC/js/components/form/FormGroupHeading";
import FormGroupHeadingContent from "#SRC/js/components/form/FormGroupHeadingContent";
import MetadataStore from "#SRC/js/stores/MetadataStore";

import LearnMoreTooltip from "./LearnMoreTooltip";
import PlacementFormPartial from "./PlacementFormPartial";

class PlacementSection extends React.Component {
  render() {
    const { data = {}, errors, onAddItem, onRemoveItem } = this.props;

    return (
      <div>
        <h1 className="flush-top short-bottom">
          <FormGroupHeading>
            <FormGroupHeadingContent primary={true} title="Placement">
              <Trans render="span">Placement</Trans>
            </FormGroupHeadingContent>
            <FormGroupHeadingContent>
              <LearnMoreTooltip
                content={
                  <Trans render="span">
                    You can configure the placement of agent nodes in regions
                    and zones for high availability or to expand capacity to new
                    regions when necessary.
                  </Trans>
                }
                link={MetadataStore.buildDocsURI(
                  "/deploying-services/fault-domain-awareness/"
                )}
              />
            </FormGroupHeadingContent>
          </FormGroupHeading>
        </h1>
        <Trans render="p">
          Placement constraints control where apps run to allow optimization for
          either fault tolerance or locality.
        </Trans>
        <PlacementFormPartial
          data={data}
          errors={errors}
          onAddItem={onAddItem}
          onRemoveItem={onRemoveItem}
        />
      </div>
    );
  }
}

export default PlacementSection;
