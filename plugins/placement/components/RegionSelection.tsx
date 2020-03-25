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
import CompositeState from "#SRC/js/structs/CompositeState";

function getRegionOptionText(region) {
  const zone = CompositeState.getMasterNode().getRegionName();

  return `${region}${zone === region ? " (Local)" : ""}`;
}

const getRegionOptions = regions =>
  regions.map((region, index) => (
    <option key={index} value={region}>
      {getRegionOptionText(region)}
    </option>
  ));

class RegionSelection extends React.Component {
  state = { regions: [] };

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

  onMesosStateChange = () => {
    this.setState({
      regions: (MesosStateStore.get("lastMesosState").slaves || [])
        .map(({ domain }) => domain?.fault_domain?.region?.name)
        // filter undefineds and duplicates
        .filter((x, i, self) => x && self.indexOf(x) === i)
    });
  };

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
