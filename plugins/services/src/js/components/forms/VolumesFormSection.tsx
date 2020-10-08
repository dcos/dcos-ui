import { Trans } from "@lingui/macro";
import { Tooltip } from "reactjs-components";
import PropTypes from "prop-types";
import * as React from "react";
import { MountService } from "foundation-ui";
import {
  TextInput,
  FormSectionBody,
  FieldGroup,
  ToggleBox,
  SelectInput,
} from "@dcos/ui-kit";

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
import KVForm from "#SRC/js/components/form/KVForm";
import InfoTooltipIcon from "#SRC/js/components/form/InfoTooltipIcon";
import MetadataStore from "#SRC/js/stores/MetadataStore";
import dcosVersion$ from "#SRC/js/stores/dcos-version";
import ConfigStore from "#SRC/js/stores/ConfigStore";

import ContainerConstants from "../../constants/ContainerConstants";
import { FormReducer as volumes } from "../../reducers/serviceForm/FormReducers/Volumes";
import { VolumeSelect } from "../VolumeSelect";

const { DOCKER } = ContainerConstants.type;

const heading = <FormGroupHeadingContent primary={true} />;

const onInput = (fn) => (e) => {
  e.preventDefault();
  e.stopPropagation();
  fn(e?.currentTarget?.value);
};

export default class VolumesFormSection extends React.Component<{
  errors: Record<string, unknown>;
  onChange: (e: any) => void;
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
  state = { showCSI: false };

  componentDidMount() {
    dcosVersion$.subscribe(({ hasCSI }) => {
      this.setState({ showCSI: hasCSI });
    });
  }
  getPersistentVolumeConfig(volume, key) {
    const volumeErrors = this.props.errors?.container?.volumes?.[key]?.volumes;
    const sizeError = volumeErrors?.persistent?.size;
    const containerPathError = volumeErrors?.containerPath;

    return (
      <FormRow>
        <FormGroup className="column-4" showError={Boolean(containerPathError)}>
          <FieldLabel>
            <FormGroupHeading>
              <Trans render={heading}>Container Path</Trans>
              <FormGroupHeadingContent>
                <Tooltip
                  content={containerPathTooltip}
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

  getExternalCSIVolumeConfig(volume, key) {
    const updateVolume = (v) => {
      this.props.onChange({
        target: { name: `volumes.${key}`, value: { ...volume, ...v } },
      });
    };
    const updateExternal = (value) =>
      updateVolume({ externalCSI: { ...volume.externalCSI, ...value } });
    const options = volume?.externalCSI?.options || {};
    const updateOptions = (value) =>
      updateExternal({ options: { ...options, ...value } });
    const updateCapability = (value) =>
      updateOptions({ capability: { ...options.capability, ...value } });

    // yes, inline styling is not a good practice. but time is short and we want to use ui-kit-components here!
    return (
      <div style={{ marginTop: "16px" }}>
        <FormSectionBody>
          <FieldGroup direction="row">
            <TextInput
              inputLabel="Name"
              value={volume.externalCSI.name}
              tooltipContent={<Trans>A unique identifier for the volume</Trans>}
              onChange={onInput((x) => updateExternal({ name: x }))}
            />
            <TextInput
              inputLabel="Plugin Name"
              value={options?.pluginName}
              required={true}
              tooltipContent={<Trans>The name of the CSI plugin</Trans>}
              onChange={onInput((x) => updateOptions({ pluginName: x }))}
            />
          </FieldGroup>
          <TextInput
            inputLabel="Container Path"
            value={volume.containerPath}
            tooltipContent={containerPathTooltip}
            onChange={onInput((x) => updateVolume({ containerPath: x }))}
          />
          <SelectInput
            options={accessModes}
            inputLabel="Access Mode"
            value={options?.capability?.accessMode}
            onChange={onInput((x) => updateCapability({ accessMode: x }))}
          />
          <FieldGroup direction="row">
            <ToggleBox
              id="block"
              isActive={options?.capability?.accessType === "block"}
              onChange={() =>
                updateCapability({ accessType: "block", fsType: undefined })
              }
            >
              Block
            </ToggleBox>
            <ToggleBox
              id="mount"
              isActive={options?.capability?.accessType === "mount"}
              onChange={() => updateCapability({ accessType: "mount" })}
            >
              Mount
            </ToggleBox>
          </FieldGroup>

          {options?.capability?.accessType === "mount" ? (
            <div>
              <TextInput
                inputLabel="Filesystem Type"
                placeholder="xfs"
                value={options?.capability?.fsType}
                onChange={onInput((x) => updateCapability({ fsType: x }))}
              />
            </div>
          ) : null}
          <KVForm
            data={options?.nodeStageSecret || {}}
            onChange={(x) => updateOptions({ nodeStageSecret: x })}
            label={<Trans id="Node Stage Secret" />}
          />
          <KVForm
            data={options?.nodePublishSecret || {}}
            onChange={(x) => updateOptions({ nodePublishSecret: x })}
            label={<Trans id="Node Publish Secret" />}
          />
          <KVForm
            data={options?.volumeContext || {}}
            onChange={(x) => updateOptions({ volumeContext: x })}
            label={<Trans id="Volume Context" />}
          />
        </FormSectionBody>
      </div>
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
          <FieldInput
            name={`volumes.${key}.name`}
            type="text"
            value={volume.name}
          />
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

      if (volume.type && ["DSS", "EPHEMERAL"].includes(volume.type)) {
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
                  omit(volume, ["external", "externalCSI", "size", "type"]),
                  null,
                  2
                )}
              </pre>
            </MountService.Mount>
          </FormGroupContainer>
        );
      }

      const { plugins } = ConfigStore.get("config").uiConfiguration;
      const dss = plugins.dss?.enabled ? [] : ["DSS"];
      const csi = this.state.showCSI ? [] : ["EXTERNAL_CSI"];
      const exclude = ["EPHEMERAL", ...dss, ...csi];

      return (
        <FormGroupContainer key={key} onRemove={onRemove}>
          <FormRow>
            <FormGroup className="column-5" showError={Boolean(typeError)}>
              <FieldLabel>
                <FormGroupHeading>
                  <Trans render={heading}>Volume Type</Trans>
                </FormGroupHeading>
              </FieldLabel>
              <VolumeSelect volume={volume} index={key} exclude={exclude} />
            </FormGroup>
          </FormRow>
          {volume.type === "PERSISTENT"
            ? this.getPersistentVolumeConfig(volume, key)
            : volume.type === "HOST"
            ? this.getHostVolumeConfig(volume, key)
            : volume.type === "EXTERNAL"
            ? this.getExternalVolumeConfig(volume, key)
            : volume.type === "EXTERNAL_CSI"
            ? this.getExternalCSIVolumeConfig(volume, key)
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

// prettier-ignore
const accessModes = [
  { value: "SINGLE_NODE_WRITER",       label: "SINGLE_NODE_WRITER - Can only be published once as read/write on a single node, at any given time." },
  { value: "SINGLE_NODE_READER_ONLY",  label: "SINGLE_NODE_READER_ONLY - Can only be published once as readonly on a single node, at any given time" },
  { value: "MULTI_NODE_READER_ONLY",   label: "MULTI_NODE_READER_ONLY - Can be published as readonly at multiple nodes simultaneously" },
  { value: "MULTI_NODE_SINGLE_WRITER", label: "MULTI_NODE_SINGLE_WRITER - Can be published at multiple nodes simultaneously. Only one of the node can be used as read/write. The rest will be readonly" },
  { value: "MULTI_NODE_MULTI_WRITER",  label: "MULTI_NODE_MULTI_WRITER - Can be published as read/write at multiple nodes simultaneously" },
];

const containerPathTooltip = (
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
