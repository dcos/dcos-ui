import { Trans } from "@lingui/macro";
import { Tooltip, Select, SelectOption } from "reactjs-components";
import PropTypes from "prop-types";
import * as React from "react";
import { MountService } from "foundation-ui";

import AddButton from "#SRC/js/components/form/AddButton";
import FieldAutofocus from "#SRC/js/components/form/FieldAutofocus";
import FieldError from "#SRC/js/components/form/FieldError";
import FieldInput from "#SRC/js/components/form/FieldInput";
import FieldLabel from "#SRC/js/components/form/FieldLabel";
import FieldSelect from "#SRC/js/components/form/FieldSelect";
import { omit } from "#SRC/js/utils/Util";
import FormGroup from "#SRC/js/components/form/FormGroup";
import FormGroupContainer from "#SRC/js/components/form/FormGroupContainer";
import FormGroupHeading from "#SRC/js/components/form/FormGroupHeading";
import FormGroupHeadingContent from "#SRC/js/components/form/FormGroupHeadingContent";
import FormRow from "#SRC/js/components/form/FormRow";
import InfoTooltipIcon from "#SRC/js/components/form/InfoTooltipIcon";
import MetadataStore from "#SRC/js/stores/MetadataStore";

import VolumeDefinitions, {
  UNKNOWN,
} from "#PLUGINS/services/src/js/constants/VolumeDefinitions";

import ContainerConstants from "../../constants/ContainerConstants";

import { FormReducer as volumes } from "../../reducers/serviceForm/FormReducers/Volumes";

const { DOCKER } = ContainerConstants.type;

const heading = <FormGroupHeadingContent primary={true} />;

export default class VolumesFormSection extends React.Component<{
  errors: Record<string, unknown>;
}> {
  static configReducers = { volumes };
  static defaultProps = {
    data: {},
    errors: {},
    onAddItem() {},
    onRemoveItem() {},
  };
  static propTypes = {
    data: PropTypes.object,
    errors: PropTypes.object,
    onAddItem: PropTypes.func,
    onRemoveItem: PropTypes.func,
  };
  getPersistentVolumeConfig(volume, key) {
    const volumeErrors = this.props.errors?.container?.volumes?.[key]?.volumes;
    const sizeError = volumeErrors?.persistent?.size;
    const containerPathError = volumeErrors?.containerPath;
    const tooltipContent = (
      <Trans>
        The path where your application will read and write data. This must be a
        single-level path relative to the container.{" "}
        <a
          href={MetadataStore.buildDocsURI("/storage/persistent-volume/")}
          target="_blank"
        >
          More information
        </a>
        .
      </Trans>
    );

    return (
      <FormRow>
        <FormGroup className="column-4" showError={Boolean(containerPathError)}>
          <FieldLabel>
            <FormGroupHeading>
              <Trans render={heading}>Container Path</Trans>
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
          </FieldLabel>
          <FieldInput
            name={`volumes.${key}.containerPath`}
            type="text"
            value={volume.containerPath}
            autoFocus={Boolean(containerPathError)}
          />
          <FieldError>{containerPathError}</FieldError>
        </FormGroup>
        <FormGroup className="column-2" showError={Boolean(sizeError)}>
          <FieldLabel className="text-no-transform">
            <FormGroupHeading>
              <Trans render={heading}>Size (MiB)</Trans>
            </FormGroupHeading>
          </FieldLabel>
          <FieldAutofocus>
            <FieldInput
              name={`volumes.${key}.size`}
              type="number"
              value={volume.size}
            />
          </FieldAutofocus>
          <FieldError>{sizeError}</FieldError>
        </FormGroup>
      </FormRow>
    );
  }

  getHostVolumeConfig(volume, key) {
    const errors = this.props.errors?.container?.volumes?.[key];
    const hostPathError = errors?.hostPath;
    const containerPathError = errors?.containerPath;
    const tooltipContent = (
      <Trans>
        If you are using the Mesos containerizer, this must be a single-level{" "}
        path relative to the container.{" "}
        <a
          href={MetadataStore.buildDocsURI("/storage/external-storage/")}
          target="_blank"
        >
          More information
        </a>
        .
      </Trans>
    );

    return (
      <FormRow>
        <FormGroup className="column-4" showError={Boolean(hostPathError)}>
          <FieldLabel>
            <FormGroupHeading>
              <Trans render={heading}>Host Path</Trans>
            </FormGroupHeading>
          </FieldLabel>
          <FieldAutofocus>
            <FieldInput
              name={`volumes.${key}.hostPath`}
              value={volume.hostPath}
            />
          </FieldAutofocus>
          <FieldError>{hostPathError}</FieldError>
        </FormGroup>
        <FormGroup className="column-4" showError={Boolean(containerPathError)}>
          <FieldLabel>
            <FormGroupHeading>
              <Trans render={heading}>Container Path</Trans>
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
          </FieldLabel>
          <FieldInput
            name={`volumes.${key}.containerPath`}
            type="text"
            value={volume.containerPath}
            autoFocus={Boolean(containerPathError)}
          />
          <FieldError>{containerPathError}</FieldError>
        </FormGroup>
        <FormGroup className="column-4" showError={Boolean(errors?.mode)}>
          <FieldLabel>
            <FormGroupHeading>
              <Trans render={heading}>Mode</Trans>
            </FormGroupHeading>
          </FieldLabel>
          <FieldSelect name={`volumes.${key}.mode`} value={volume.mode}>
            <Trans render={<option value="RW" />}>Read and Write</Trans>\
            <Trans render={<option value="RO" />}>Read Only</Trans>
          </FieldSelect>
        </FormGroup>
      </FormRow>
    );
  }


  getExternalVolumeConfig(volume, key) {
    const volumeErrors = this.props.errors?.container?.volumes?.[key]?.volume;
    const nameError = volumeErrors?.external?.name;
    const sizeError = volumeErrors?.external?.size;
    const containerPathError = volumeErrors?.containerPath;

    const tooltipContent = (
      <Trans>
        Docker Runtime only supports the default size for implicit volumes,
        please select Universal Container Runtime (UCR) if you want to modify
        the size.
      </Trans>
    );

    let sizeField = (
      <Tooltip
        content={tooltipContent}
        width={300}
        wrapperClassName="tooltip-wrapper tooltip-block-wrapper text-align-center"
        wrapText={true}
      >
        <FieldInput
          name={`volumes.${key}.size`}
          type="number"
          disabled={true}
          value={""}
        />
      </Tooltip>
    );

    if (this.props.data?.container?.type !== DOCKER) {
      sizeField = (
        <FieldInput
          name={`volumes.${key}.size`}
          type="number"
          value={volume.size}
          autoFocus={Boolean(sizeError)}
        />
      );
    }

    return (
      <FormRow>
        <FormGroup className="column-4" showError={Boolean(nameError)}>
          <FieldLabel>
            <FormGroupHeading>
              <Trans render={heading} id="Name" />
            </FormGroupHeading>
          </FieldLabel>
          <FieldAutofocus>
            <FieldInput
              name={`volumes.${key}.name`}
              type="text"
              value={volume.name}
            />
          </FieldAutofocus>
          <FieldError>{nameError}</FieldError>
        </FormGroup>
        <FormGroup className="column-4" showError={Boolean(containerPathError)}>
          <FieldLabel>
            <FormGroupHeading>
              <Trans render={heading} id="Container Path" />
            </FormGroupHeading>
          </FieldLabel>
          <FieldInput
            name={`volumes.${key}.containerPath`}
            type="text"
            value={volume.containerPath}
            autoFocus={Boolean(containerPathError)}
          />
          <FieldError>{containerPathError}</FieldError>
        </FormGroup>
        <FormGroup className="column-2" showError={Boolean(sizeError)}>
          <FieldLabel className="text-no-transform">
            <FormGroupHeading>
              <Trans render={heading} id="Size (GiB)" />
            </FormGroupHeading>
          </FieldLabel>
          {sizeField}
          <FieldError>{sizeError}</FieldError>
        </FormGroup>
      </FormRow>
    );
  }


  getVolumesLines(data) {
    return data.map((volume, key) => {
      const typeError = this.props.errors?.container?.volumes?.[key]?.type;
      const onRemove = () =>
        void this.props.onRemoveItem({ value: key, path: "volumes" });

      if (volume.type && UNKNOWN.includes(volume.type)) {
        return (
          <FormGroupContainer key={key} onRemove={onRemove}>
            <MountService.Mount
              type="CreateService:SingleContainerVolumes:UnknownVolumes"
              volume={volume}
              index={key}
              errors={this.props.errors}
            >
              <FieldLabel>
                <Trans>Unable to edit this Volume</Trans>
              </FieldLabel>
              <pre>
                {JSON.stringify(
                  omit(volume, ["external", "size", "type"]),
                  null,
                  2
                )}
              </pre>
            </MountService.Mount>
          </FormGroupContainer>
        );
      }

      return (
        <FormGroupContainer key={key} onRemove={onRemove}>
          <FormRow>
            <FormGroup className="column-5" showError={Boolean(typeError)}>
              <FieldLabel>
                <FormGroupHeading>
                  <Trans render={heading}>Volume Type</Trans>
                </FormGroupHeading>
              </FieldLabel>
              <MountService.Mount
                type="CreateService:SingleContainerVolumes:Types"
                volume={volume}
                index={key}
              >
                <Select
                  name={`volumes.${key}.type`}
                  value={volume.type}
                  placeholder="Select ..."
                >
                  {Object.keys(VolumeDefinitions)
                    .filter((type) => !UNKNOWN.includes(type))
                    .map(toOption)}
                </Select>
              </MountService.Mount>
            </FormGroup>
          </FormRow>
          {volume.type === "PERSISTENT"
            ? this.getPersistentVolumeConfig(volume, key)
            : volume.type === "HOST"
            ? this.getHostVolumeConfig(volume, key)
            : volume.type === "EXTERNAL"
            ? this.getExternalVolumeConfig(volume, key)
            : null}
        </FormGroupContainer>
      );
    });
  }

  render() {
    const { data } = this.props;

    const tooltipContent = (
      <Trans>
        DC/OS offers several storage options.{" "}
        <a href={MetadataStore.buildDocsURI("/storage/")} target="_blank">
          More information
        </a>
        .
      </Trans>
    );

    return (
      <div>
        <h1 className="flush-top short-bottom">
          <FormGroupHeading>
            <Trans render={heading}>Volumes</Trans>
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
        <Trans render="p">
          Create a stateful service by configuring a persistent volume.
          Persistent volumes enable instances to be restarted without data loss.
        </Trans>
        {this.getVolumesLines(data.volumes)}
        <div>
          <AddButton
            onClick={this.props.onAddItem.bind(this, {
              path: "volumes",
            })}
          >
            <Trans>Add Volume</Trans>
          </AddButton>
        </div>
        <MountService.Mount
          type="CreateService:SingleContainerVolumes:VolumeConflicts"
          data={data}
        />
      </div>
    );
  }
}

const recommended = (
  <Trans className="dropdown-select-item-title__badge badge" id="Recommended" />
);

const toOption = (type: string) => (
  <SelectOption
    key={type}
    value={type}
    label={<Trans id={VolumeDefinitions[type].name} />}
  >
    <div className="dropdown-select-item-title">
      <Trans id={VolumeDefinitions[type].name} />
      {VolumeDefinitions[type].recommended ? recommended : null}
    </div>
    <Trans
      id={VolumeDefinitions[type].description}
      className="dropdown-select-item-description"
    />
  </SelectOption>
);
