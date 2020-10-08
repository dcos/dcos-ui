import { Trans } from "@lingui/macro";
import { Tooltip } from "reactjs-components";
import PropTypes from "prop-types";
import * as React from "react";

import AddButton from "#SRC/js/components/form/AddButton";
import FieldAutofocus from "#SRC/js/components/form/FieldAutofocus";
import FieldError from "#SRC/js/components/form/FieldError";
import FieldInput from "#SRC/js/components/form/FieldInput";
import FieldLabel from "#SRC/js/components/form/FieldLabel";
import FormGroup from "#SRC/js/components/form/FormGroup";
import FormGroupContainer from "#SRC/js/components/form/FormGroupContainer";
import FormGroupHeading from "#SRC/js/components/form/FormGroupHeading";
import FormGroupHeadingContent from "#SRC/js/components/form/FormGroupHeadingContent";
import FormRow from "#SRC/js/components/form/FormRow";
import InfoTooltipIcon from "#SRC/js/components/form/InfoTooltipIcon";
import MetadataStore from "#SRC/js/stores/MetadataStore";
import ConfigStore from "#SRC/js/stores/ConfigStore";

import { getContainerNameWithIcon } from "../../utils/ServiceConfigDisplayUtil";
import { FormReducer as volumeMounts } from "../../reducers/serviceForm/MultiContainerVolumes";
import { VolumeSelect } from "../VolumeSelect";

export default class MultiContainerVolumesFormSection extends React.Component {
  static configReducers = { volumeMounts };
  static defaultProps = {
    data: {},
    errors: {},
    handleTabChange() {},
    onAddItem() {},
    onRemoveItem() {},
  };
  static propTypes = {
    data: PropTypes.object,
    errors: PropTypes.object,
    handleTabChange: PropTypes.func,
    onAddItem: PropTypes.func,
    onRemoveItem: PropTypes.func,
  };
  getContainerMounts(volumeMountIndex) {
    const { volumeMounts } = this.props.data;

    return this.props.data.containers.map((container, containerIndex) => (
      <FormRow key={containerIndex}>
        <FormGroup className="column-3">
          {containerIndex === 0 ? (
            <FieldLabel>
              <FormGroupHeading>
                <FormGroupHeadingContent primary={true}>
                  <Trans render="span">Containers</Trans>
                </FormGroupHeadingContent>
              </FormGroupHeading>
            </FieldLabel>
          ) : null}
          <div className="form-control-input-height">
            {getContainerNameWithIcon(container)}
          </div>
        </FormGroup>
        <FormGroup className="column-9">
          {containerIndex === 0 ? (
            <FieldLabel>
              <FormGroupHeading>
                <FormGroupHeadingContent primary={true}>
                  <Trans render="span">Container Path</Trans>
                </FormGroupHeadingContent>
              </FormGroupHeading>
            </FieldLabel>
          ) : null}
          <FieldInput
            name={`volumeMounts.${volumeMountIndex}.mountPath.${containerIndex}`}
            type="text"
            value={volumeMounts[volumeMountIndex].mountPath[containerIndex]}
          />
        </FormGroup>
      </FormRow>
    ));
  }

  getDSSVolumeConfig(volumes, index) {
    return (
      <FormRow>
        <FormGroup className="column-4">
          <FieldLabel>
            <FormGroupHeading>
              <Trans render={<FormGroupHeadingContent primary={true} />}>
                Profile Name
              </Trans>
            </FormGroupHeading>
          </FieldLabel>
          <FieldAutofocus>
            <FieldInput
              name={`volumeMounts.${index}.profileName`}
              type="text"
              value={volumes.profileName}
            />
          </FieldAutofocus>
        </FormGroup>
        <FormGroup className="column-3">
          <FieldLabel>
            <FormGroupHeading>
              <Trans render={<FormGroupHeadingContent primary={true} />}>
                Size (GiB)
              </Trans>
            </FormGroupHeading>
          </FieldLabel>
          <FieldAutofocus>
            <FieldInput
              name={`volumeMounts.${index}.size`}
              type="number"
              value={volumes.size}
            />
          </FieldAutofocus>
        </FormGroup>
      </FormRow>
    );
  }

  /**
   * getExternalVolumesLines
   *
   * @param  {Object} data
   * @param  {Number} offset as we have two independent sections that are 0
   *   based we need to add an offset to the second one
   * @return {Array} elements
   */
  getVolumesMountLines(data, offset) {
    return data.map((volumes, key) => {
      const nameError = this.props.errors?.container?.volumes?.[key + offset]
        ?.volumes?.name;
      const removeHandler = this.props.onRemoveItem.bind(this, {
        value: key,
        path: "volumeMounts",
      });

      const { plugins } = ConfigStore.get("config").uiConfiguration;
      const dss = plugins.dss?.enabled ? [] : ["DSS"];
      const exclude = ["EXTERNAL", "EXTERNAL_CSI", ...dss];

      return (
        <FormGroupContainer onRemove={removeHandler} key={key}>
          <FormRow>
            <FormGroup className="column-5" showError={false}>
              <FieldLabel>
                <FormGroupHeading>
                  <FormGroupHeadingContent primary={true}>
                    <Trans render="span">Volume Type</Trans>
                  </FormGroupHeadingContent>
                </FormGroupHeading>
              </FieldLabel>

              <VolumeSelect
                prefix="volumeMounts"
                volume={volumes}
                exclude={exclude}
                index={key}
              />
            </FormGroup>
            <FormGroup className="column-6" showError={Boolean(nameError)}>
              <FieldLabel>
                <FormGroupHeading>
                  <FormGroupHeadingContent primary={true}>
                    <Trans render="span">Name</Trans>
                  </FormGroupHeadingContent>
                </FormGroupHeading>
              </FieldLabel>
              <FieldInput
                name={`volumeMounts.${key}.name`}
                type="text"
                value={volumes.name}
              />
              <FieldError>{nameError}</FieldError>
            </FormGroup>
          </FormRow>

          {volumes.type === "DSS"
            ? this.getDSSVolumeConfig(volumes, key)
            : volumes.type === "HOST"
            ? this.getHostPathInput(volumes, key)
            : volumes.type === "PERSISTENT"
            ? this.getLocalPersistentInput(volumes, key)
            : null}

          {this.getContainerMounts(key)}
        </FormGroupContainer>
      );
    });
  }

  getHostPathInput(volumes, key) {
    return (
      <FormRow>
        <FormGroup className="column-12">
          <FieldLabel>
            <FormGroupHeading>
              <FormGroupHeadingContent primary={true}>
                <Trans render="span">Host Path</Trans>
              </FormGroupHeadingContent>
            </FormGroupHeading>
          </FieldLabel>
          <FieldAutofocus>
            <FieldInput
              name={`volumeMounts.${key}.hostPath`}
              type="text"
              value={volumes.hostPath}
            />
          </FieldAutofocus>
        </FormGroup>
      </FormRow>
    );
  }

  getLocalPersistentInput(volumes, key) {
    return (
      <FormRow>
        <FormGroup className="column-3">
          <FieldLabel>
            <FormGroupHeading>
              <FormGroupHeadingContent primary={true}>
                <Trans render="span">Size (MiB)</Trans>
              </FormGroupHeadingContent>
            </FormGroupHeading>
          </FieldLabel>
          <FieldAutofocus>
            <FieldInput
              name={`volumeMounts.${key}.size`}
              type="number"
              value={volumes.size}
            />
          </FieldAutofocus>
        </FormGroup>
      </FormRow>
    );
  }

  getHeadline() {
    const tooltipContent = (
      <Trans render="span">
        DC/OS offers several storage options.{" "}
        <a href={MetadataStore.buildDocsURI("/storage/")} target="_blank">
          More information
        </a>
        .
      </Trans>
    );

    return (
      <h1 className="flush-top short-bottom">
        <FormGroupHeading>
          <FormGroupHeadingContent primary={true}>
            <Trans render="span">Volumes</Trans>
          </FormGroupHeadingContent>
          <FormGroupHeadingContent>
            <Tooltip
              content={tooltipContent}
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

  render() {
    const { data, handleTabChange } = this.props;

    if (!data.containers?.length) {
      return (
        <div>
          {this.getHeadline()}
          <Trans render="p">
            Please{" "}
            <a
              onClick={handleTabChange.bind(null, "services")}
              className="clickable"
            >
              add a container
            </a>{" "}
            before configuring Volumes.
          </Trans>
        </div>
      );
    }

    return (
      <div>
        {this.getHeadline()}
        <Trans render="p">
          Create a stateful service by configuring a persistent volume.
          Persistent volumes enable instances to be restarted without data loss.
        </Trans>
        {this.getVolumesMountLines(data.volumeMounts, data.volumeMounts)}
        <div>
          <AddButton
            onClick={this.props.onAddItem.bind(this, {
              path: "volumeMounts",
            })}
          >
            <Trans render="span">Add Volume</Trans>
          </AddButton>
        </div>
      </div>
    );
  }
}
