import { Trans, t } from "@lingui/macro";
import { withI18n } from "@lingui/react";

import * as React from "react";

import { MESOS_STATE_CHANGE } from "#SRC/js/constants/EventTypes";
import FieldHelp from "#SRC/js/components/form/FieldHelp";
import FieldLabel from "#SRC/js/components/form/FieldLabel";
import FieldSelect from "#SRC/js/components/form/FieldSelect";
import FormGroup from "#SRC/js/components/form/FormGroup";
import FormGroupHeading from "#SRC/js/components/form/FormGroupHeading";
import FormGroupHeadingContent from "#SRC/js/components/form/FormGroupHeadingContent";
import FormRow from "#SRC/js/components/form/FormRow";
import MesosStateStore from "#SRC/js/stores/MesosStateStore";
import { findNestedPropertyInObject } from "#SRC/js/utils/Util";
import { getRegionOptionText } from "../utils/PlacementUtil";

function getRegionOptions(regions) {
  return regions.map((region, index) => (
    <option key={index} value={region}>
      {getRegionOptionText(region)}
    </option>
  ));
}

class RegionSelection extends React.Component {
  constructor() {
    super();
    this.onMesosStateChange = this.onMesosStateChange.bind(this);
    this.state = {
      regions: []
    };
  }

  componentDidMount() {
    MesosStateStore.addChangeListener(
      MESOS_STATE_CHANGE,
      this.onMesosStateChange
    );
    this.onMesosStateChange();
  }

  componentWillUnmount() {
    MesosStateStore.removeChangeListener(
      MESOS_STATE_CHANGE,
      this.onMesosStateChange
    );
  }

  onMesosStateChange() {
    const regions = Object.keys(
      (MesosStateStore.get("lastMesosState").slaves || []).reduce(
        (memo, slave) => {
          const name = findNestedPropertyInObject(
            slave,
            "domain.fault_domain.region.name"
          );

          if (name == null) {
            return memo;
          }
          memo[name] = name;

          return memo;
        },
        {}
      )
    );

    this.setState({ regions });
  }

  render() {
    const { selectProps, i18n } = this.props;
    const { regions } = this.state;

    return (
      <FormRow>
        <FormGroup>
          <FieldLabel className="column-12">
            <FormGroupHeading>
              <FormGroupHeadingContent primary={true} title="Region">
                <Trans render="span">Region</Trans>
              </FormGroupHeadingContent>
            </FormGroupHeading>
          </FieldLabel>
          <div className="column-5">
            <FieldSelect {...selectProps}>
              <option key="local" value="">
                {i18n._(t`Select...`)}
              </option>
              {getRegionOptions(regions)}
            </FieldSelect>
          </div>
          <FieldHelp className="column-12">
            <Trans render="span">
              If left undefined this will run in your local region.
            </Trans>
          </FieldHelp>
        </FormGroup>
      </FormRow>
    );
  }
}

export default withI18n()(RegionSelection);
