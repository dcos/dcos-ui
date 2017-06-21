import { Tooltip } from "reactjs-components";
import React, { Component } from "react";
import Objektiv from "objektiv";

import {
  FormReducer as externalVolumes
} from "../../reducers/serviceForm/ExternalVolumes";
import {
  FormReducer as localVolumes
} from "../../reducers/serviceForm/LocalVolumes";
import AddButton from "../../../../../../src/js/components/form/AddButton";
import FieldError from "../../../../../../src/js/components/form/FieldError";
import FieldInput from "../../../../../../src/js/components/form/FieldInput";
import FieldLabel from "../../../../../../src/js/components/form/FieldLabel";
import FieldSelect from "../../../../../../src/js/components/form/FieldSelect";
import {
  findNestedPropertyInObject
} from "../../../../../../src/js/utils/Util";
import FormGroup from "../../../../../../src/js/components/form/FormGroup";
import FormGroupContainer
  from "../../../../../../src/js/components/form/FormGroupContainer";
import FormGroupHeading
  from "../../../../../../src/js/components/form/FormGroupHeading";
import FormGroupHeadingContent
  from "../../../../../../src/js/components/form/FormGroupHeadingContent";
import FormRow from "../../../../../../src/js/components/form/FormRow";
import Icon from "../../../../../../src/js/components/Icon";
import MetadataStore from "../../../../../../src/js/stores/MetadataStore";

const errorsLens = Objektiv.attr("container", {}).attr("volumes", []);

class VolumesFormSection extends Component {
  getPersistentVolumeConfig(volume, key) {
    if (volume.type !== "PERSISTENT") {
      return null;
    }

    const sizeError = errorsLens
      .at(key, {})
      .attr("persistent", {})
      .get(this.props.errors).size;
    const containerPathError = errorsLens.at(key, {}).get(this.props.errors)
      .containerPath;
    const tooltipContent = (
      <span>
        {
          "The path where your application will read and write data. This must be a single-level path relative to the container. "
        }
        <a
          href={MetadataStore.buildDocsURI("/usage/storage/persistent-volume/")}
          target="_blank"
        >
          More information
        </a>.
      </span>
    );

    return (
      <FormRow>
        <FormGroup className="column-3" showError={Boolean(sizeError)}>
          <FieldLabel className="text-no-transform">
            <FormGroupHeading>
              <FormGroupHeadingContent primary={true}>
                SIZE (MiB)
              </FormGroupHeadingContent>
            </FormGroupHeading>
          </FieldLabel>
          <FieldInput
            name={`localVolumes.${key}.size`}
            type="number"
            value={volume.size}
          />
          <FieldError>{sizeError}</FieldError>
        </FormGroup>
        <FormGroup className="column-6" showError={Boolean(containerPathError)}>
          <FieldLabel>
            <FormGroupHeading>
              <FormGroupHeadingContent primary={true}>
                Container Path
              </FormGroupHeadingContent>
              <FormGroupHeadingContent>
                <Tooltip
                  content={tooltipContent}
                  interactive={true}
                  maxWidth={300}
                  scrollContainer=".gm-scroll-view"
                  wrapText={true}
                >
                  <Icon color="grey" id="circle-question" size="mini" />
                </Tooltip>
              </FormGroupHeadingContent>
            </FormGroupHeading>
          </FieldLabel>
          <FieldInput
            name={`localVolumes.${key}.containerPath`}
            type="text"
            value={volume.containerPath}
          />
          <FieldError>{containerPathError}</FieldError>
        </FormGroup>
      </FormRow>
    );
  }

  getHostVolumeConfig(volume, key) {
    if (volume.type !== "HOST") {
      return null;
    }

    const errors = errorsLens.at(key, {}).get(this.props.errors);
    const hostPathError = errors.hostPath;
    const containerPathError = errors.containerPath;
    const modeError = errors.mode;
    const tooltipContent = (
      <span>
        {
          "If you are using the Mesos containerizer, this must be a single-level path relative to the container. "
        }
        <a
          href={MetadataStore.buildDocsURI("/usage/storage/external-storage/")}
          target="_blank"
        >
          More information
        </a>.
      </span>
    );

    return (
      <FormRow>
        <FormGroup className="column-4" showError={Boolean(hostPathError)}>
          <FieldLabel>
            <FormGroupHeading>
              <FormGroupHeadingContent primary={true}>
                Host Path
              </FormGroupHeadingContent>
            </FormGroupHeading>
          </FieldLabel>
          <FieldInput
            name={`localVolumes.${key}.hostPath`}
            value={volume.hostPath}
          />
          <FieldError>{hostPathError}</FieldError>
        </FormGroup>
        <FormGroup className="column-4" showError={Boolean(containerPathError)}>
          <FieldLabel>
            <FormGroupHeading>
              <FormGroupHeadingContent primary={true}>
                Container Path
              </FormGroupHeadingContent>
              <FormGroupHeadingContent>
                <Tooltip
                  content={tooltipContent}
                  interactive={true}
                  maxWidth={300}
                  scrollContainer=".gm-scroll-view"
                  wrapText={true}
                >
                  <Icon color="grey" id="circle-question" size="mini" />
                </Tooltip>
              </FormGroupHeadingContent>
            </FormGroupHeading>
          </FieldLabel>
          <FieldInput
            name={`localVolumes.${key}.containerPath`}
            type="text"
            value={volume.containerPath}
          />
          <FieldError>{containerPathError}</FieldError>
        </FormGroup>
        <FormGroup className="column-4" showError={Boolean(modeError)}>
          <FieldLabel>
            <FormGroupHeading>
              <FormGroupHeadingContent primary={true}>
                Mode
              </FormGroupHeadingContent>
            </FormGroupHeading>
          </FieldLabel>
          <FieldSelect name={`localVolumes.${key}.mode`} value={volume.mode}>
            <option value="RW">Read and Write</option>
            <option value="RO">Read Only</option>
          </FieldSelect>
        </FormGroup>
      </FormRow>
    );
  }

  getHostOption(dockerImage) {
    if (dockerImage == null || dockerImage === "") {
      return null;
    }

    return (
      <option value="HOST">
        Host Volume

      </option>
    );
  }

  getLocalVolumesLines(data) {
    const dockerImage =
      this.props.data.container &&
      this.props.data.container.docker &&
      this.props.data.container.docker.image;

    return data.map((volume, key) => {
      if (
        volume.type === "HOST" &&
        (dockerImage == null || dockerImage === "")
      ) {
        return null;
      }

      const typeError = errorsLens.at(key, {}).get(this.props.errors).type;

      return (
        <FormGroupContainer
          key={key}
          onRemove={this.props.onRemoveItem.bind(this, {
            value: key,
            path: "localVolumes"
          })}
        >
          <FormRow>
            <FormGroup className="column-6" showError={Boolean(typeError)}>
              <FieldLabel>
                <FormGroupHeading>
                  <FormGroupHeadingContent primary={true}>
                    Volume Type
                  </FormGroupHeadingContent>
                </FormGroupHeading>
              </FieldLabel>
              <FieldSelect
                name={`localVolumes.${key}.type`}
                value={volume.type}
              >
                <option>Select...</option>
                {this.getHostOption(dockerImage)}
                <option value="PERSISTENT">Persistent Volume</option>
              </FieldSelect>
            </FormGroup>
          </FormRow>
          {this.getPersistentVolumeConfig(volume, key)}
          {this.getHostVolumeConfig(volume, key)}
        </FormGroupContainer>
      );
    });
  }

  /**
   * getExternalVolumesLines
   *
   * @param  {Object} data
   * @param  {Number} offset as we have two independent sections that are 0
   *                  based we need to add an offset to the second one
   * @return {Array} elements
   */
  getExternalVolumesLines(data, offset) {
    return data.map((volume, key) => {
      const nameError = errorsLens
        .at(key + offset, {})
        .attr("external", {})
        .get(this.props.errors).name;

      const sizeError = errorsLens
        .at(key, {})
        .attr("external", {})
        .get(this.props.errors).size;

      const containerPathError = errorsLens
        .at(key + offset, {})
        .get(this.props.errors).containerPath;

      const dockerType = findNestedPropertyInObject(
        this.props.data,
        "container.type"
      );

      let sizeField = (
        <Tooltip
          content="Docker Runtime only supports the default size for implicit volumes, please select Mesos Runtime if you want to modify the size."
          width={300}
          scrollContainer=".gm-scroll-view"
          wrapperClassName="tooltip-wrapper tooltip-block-wrapper text-align-center"
          wrapText={true}
        >
          <FieldInput
            name={`externalVolumes.${key}.size`}
            type="number"
            disabled={true}
            value={""}
          />
        </Tooltip>
      );

      if (dockerType !== "DOCKER") {
        sizeField = (
          <FieldInput
            name={`externalVolumes.${key}.size`}
            type="number"
            value={volume.size}
          />
        );
      }

      return (
        <FormGroupContainer
          key={key}
          onRemove={this.props.onRemoveItem.bind(this, {
            value: key,
            path: "externalVolumes"
          })}
        >
          <FormRow>
            <FormGroup className="column-6" showError={Boolean(nameError)}>
              <FieldLabel>
                <FormGroupHeading>
                  <FormGroupHeadingContent primary={true}>
                    Name
                  </FormGroupHeadingContent>
                </FormGroupHeading>
              </FieldLabel>
              <FieldInput
                name={`externalVolumes.${key}.name`}
                type="text"
                value={volume.name}
              />
              <FieldError>{nameError}</FieldError>
            </FormGroup>
          </FormRow>
          <FormRow>
            <FormGroup className="column-3" showError={Boolean(sizeError)}>
              <FieldLabel className="text-no-transform">
                <FormGroupHeading>
                  <FormGroupHeadingContent primary={true}>
                    SIZE (GiB)
                  </FormGroupHeadingContent>
                </FormGroupHeading>
              </FieldLabel>
              {sizeField}
              <FieldError>{sizeError}</FieldError>
            </FormGroup>
            <FormGroup
              className="column-9"
              showError={Boolean(containerPathError)}
            >
              <FieldLabel>
                <FormGroupHeading>
                  <FormGroupHeadingContent primary={true}>
                    Container Path
                  </FormGroupHeadingContent>
                </FormGroupHeading>
              </FieldLabel>
              <FieldInput
                name={`externalVolumes.${key}.containerPath`}
                type="text"
                value={volume.containerPath}
              />
              <FieldError>{containerPathError}</FieldError>
            </FormGroup>
          </FormRow>
        </FormGroupContainer>
      );
    });
  }

  render() {
    const { data } = this.props;

    const tooltipContent = (
      <span>
        {"DC/OS offers several storage options. "}
        <a href={MetadataStore.buildDocsURI("/usage/storage/")} target="_blank">
          More information
        </a>.
      </span>
    );

    return (
      <div>
        <h2 className="flush-top short-bottom">
          <FormGroupHeading>
            <FormGroupHeadingContent primary={true}>
              Volumes
            </FormGroupHeadingContent>
            <FormGroupHeadingContent>
              <Tooltip
                content={tooltipContent}
                interactive={true}
                maxWidth={300}
                scrollContainer=".gm-scroll-view"
                wrapText={true}
              >
                <Icon color="grey" id="circle-question" size="mini" />
              </Tooltip>
            </FormGroupHeadingContent>
          </FormGroupHeading>
        </h2>
        <p>
          Create a stateful service by configuring a persistent volume. Persistent volumes enable instances to be restarted without data loss.
        </p>
        <h3 className="short-bottom">
          <FormGroupHeading>
            <FormGroupHeadingContent primary={true}>
              Local Volumes
            </FormGroupHeadingContent>
          </FormGroupHeading>
        </h3>
        <p>
          {
            "Choose a local persistent volume if you need quick access to stored data. "
          }
          <a
            href={MetadataStore.buildDocsURI(
              "/usage/storage/persistent-volume/"
            )}
            target="_blank"
          >
            More information
          </a>.
        </p>
        {this.getLocalVolumesLines(data.localVolumes)}
        <div>
          <AddButton
            onClick={this.props.onAddItem.bind(this, {
              value: data.localVolumes.length,
              path: "localVolumes"
            })}
          >
            Add Local Volume
          </AddButton>
        </div>
        <h3 className="short-bottom">
          <FormGroupHeading>
            <FormGroupHeadingContent primary={true}>
              External Volumes
            </FormGroupHeadingContent>
          </FormGroupHeading>
        </h3>
        <p>
          {
            "Choose an external persistent volume if fault-tolerance is crucial for your service. "
          }
          <a
            href={MetadataStore.buildDocsURI(
              "/usage/storage/external-storage/"
            )}
            target="_blank"
          >
            More information
          </a>.
        </p>
        {this.getExternalVolumesLines(
          data.externalVolumes,
          data.localVolumes.length
        )}
        <FormRow>
          <FormGroup className="column-12">
            <AddButton
              onClick={this.props.onAddItem.bind(this, {
                value: data.localVolumes.length,
                path: "externalVolumes"
              })}
            >
              Add External Volume
            </AddButton>
          </FormGroup>
        </FormRow>
      </div>
    );
  }
}

VolumesFormSection.defaultProps = {
  data: {},
  errors: {},
  onAddItem() {},
  onRemoveItem() {}
};

VolumesFormSection.propTypes = {
  data: React.PropTypes.object,
  errors: React.PropTypes.object,
  onAddItem: React.PropTypes.func,
  onRemoveItem: React.PropTypes.func
};

VolumesFormSection.configReducers = {
  externalVolumes,
  localVolumes
};

VolumesFormSection.validationReducers = {
  localVolumes() {
    return [];
  },
  externalVolumes() {
    return [];
  }
};

module.exports = VolumesFormSection;
