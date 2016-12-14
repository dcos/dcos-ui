import React, {Component} from 'react';
import Objektiv from 'objektiv';

import FieldError from '../../../../../../src/js/components/form/FieldError';
import FieldInput from '../../../../../../src/js/components/form/FieldInput';
import FieldLabel from '../../../../../../src/js/components/form/FieldLabel';
import FieldSelect from '../../../../../../src/js/components/form/FieldSelect';
import FormGroup from '../../../../../../src/js/components/form/FormGroup';
import {FormReducer as localVolumes} from '../../reducers/serviceForm/LocalVolumes';
import {FormReducer as externalVolumes} from '../../reducers/serviceForm/ExternalVolumes';
import FormGroupContainer from '../../../../../../src/js/components/form/FormGroupContainer';
import FormRow from '../../../../../../src/js/components/form/FormRow';
import Icon from '../../../../../../src/js/components/Icon';

const errorsLens = Objektiv.attr('container', {}).attr('volumes', []);

class VolumesFormSection extends Component {
  getPersistentVolumeConfig(volume, key) {
    if (volume.type !== 'PERSISTENT') {
      return null;
    }

    const sizeError = errorsLens
      .at(key, {})
      .attr('persistent', {})
      .get(this.props.errors)
      .size;

    const containerPathError = errorsLens
      .at(key, {})
      .get(this.props.errors)
      .containerPath;

    return (
      <FormRow>
        <FormGroup
          className="column-3"
          required={false}
          showError={Boolean(sizeError)}>
          <FieldLabel>Size (MiB)</FieldLabel>
          <FieldInput
            name={`localVolumes.${key}.size`}
            type="number"
            value={volume.size} />
          <FieldError>{sizeError}</FieldError>
        </FormGroup>
        <FormGroup
          className="column-6"
          required={false}
          showError={Boolean(containerPathError)}>
          <FieldLabel>Container Path</FieldLabel>
          <FieldInput
            name={`localVolumes.${key}.containerPath`}
            type="text"
            value={volume.containerPath}/>
          <FieldError>{containerPathError}</FieldError>
        </FormGroup>
      </FormRow>
    );
  }

  getHostVolumeConfig(volume, key) {
    if (volume.type !== 'HOST') {
      return null;
    }

    const errors = errorsLens.at(key, {}).get(this.props.errors);
    const hostPathError = errors.hostPath;
    const containerPathError = errors.containerPath;
    const modeError = errors.mode;

    return (
      <FormRow>
        <FormGroup
          className="column-4"
          required={false}
          showError={Boolean(hostPathError)}>
          <FieldLabel>HostPath</FieldLabel>
          <FieldInput
            name={`localVolumes.${key}.hostPath`}
            value={volume.hostPath} />
          <FieldError>{hostPathError}</FieldError>
        </FormGroup>
        <FormGroup
          className="column-4"
          required={false}
          showError={Boolean(containerPathError)}>
          <FieldLabel>Container Path</FieldLabel>
          <FieldInput
            name={`localVolumes.${key}.containerPath`}
            type="text"
            value={volume.containerPath}/>
          <FieldError>{containerPathError}</FieldError>
        </FormGroup>
        <FormGroup
          className="column-4"
          required={false}
          showError={Boolean(modeError)}>
          <FieldLabel>Mode</FieldLabel>
          <FieldSelect name={`localVolumes.${key}.mode`} value={volume.mode}>
            <option value="RW">READ and Write</option>
            <option value="RO">READ ONLY</option>
          </FieldSelect>
        </FormGroup>
      </FormRow>
    );
  }

  getHostOption(dockerImage) {
    if (dockerImage == null || dockerImage === '') {
      return null;
    }

    return <option value="HOST">Host Volume</option>;
  }

  getLocalVolumesLines(data) {
    const dockerImage = this.props.data.container &&
      this.props.data.container.docker &&
      this.props.data.container.docker.image;

    return data.map((volume, key) => {
      if (volume.type === 'HOST' &&
        (dockerImage == null || dockerImage === '')) {
        return null;
      }

      const typeError = errorsLens
        .at(key, {})
        .get(this.props.errors)
        .type;

      return (
        <FormGroupContainer
          key={key}
          onRemove={this.props.onRemoveItem.bind(
            this,
            {value: key, path: 'localVolumes'}
          )}>
          <FormRow>
            <FormGroup
              className="column-6"
              required={false}
              showError={Boolean(typeError)}>
              <FieldLabel>Volume Type</FieldLabel>
              <FieldSelect name={`localVolumes.${key}.type`} value={volume.type}>
                <option>Select...</option>
                <option value="PERSISTENT">Persistent Volume</option>
                {this.getHostOption(dockerImage)}
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
   * @param  {Number} offset as we have two independent sections that are 0 based we need to add an offset to the second one
   * @return {Array} elements
   */
  getExternalVolumesLines(data, offset) {
    return data.map((volume, key) => {
      const nameError = errorsLens
        .at(key + offset, {})
        .attr('external', {})
        .get(this.props.errors)
        .name;

      const sizeError = errorsLens
      .at(key, {})
      .attr('external', {})
      .get(this.props.errors)
        .size;

      const containerPathError = errorsLens
        .at(key + offset, {})
        .get(this.props.errors)
        .containerPath;

      return (
        <FormGroupContainer
          key={key}
          onRemove={this.props.onRemoveItem.bind(
            this,
            {value: key, path: 'externalVolumes'}
          )}>
          <FormRow>
            <FormGroup
              className="column-6"
              required={false}
              showError={Boolean(nameError)}>
              <FieldLabel>Name</FieldLabel>
              <FieldInput
                name={`externalVolumes.${key}.name`}
                type="text"
                value={volume.name}/>
              <FieldError>{nameError}</FieldError>
            </FormGroup>
          </FormRow>
          <FormRow>
            <FormGroup
              className="column-3"
              required={false}
              showError={Boolean(sizeError)}>
              <FieldLabel>Size (MiB)</FieldLabel>
              <FieldInput
                name={`externalVolumes.${key}.size`}
                type="number"
                value={volume.size} />
              <FieldError>{sizeError}</FieldError>
            </FormGroup>
            <FormGroup
              className="column-9"
              required={false}
              showError={Boolean(containerPathError)}>
              <FieldLabel>Container Mount Path</FieldLabel>
              <FieldInput
                name={`externalVolumes.${key}.containerPath`}
                type="text"
                value={volume.containerPath}/>
              <FieldError>{containerPathError}</FieldError>
            </FormGroup>
          </FormRow>
        </FormGroupContainer>
      );
    });
  }

  render() {
    let {data} = this.props;

    return (
      <div>
        <h2 className="flush-top short-bottom">
          Local Volumes Variables
        </h2>
        <p>
          Set up volumes variables for each task your service launches.
        </p>
        {this.getLocalVolumesLines(data.localVolumes)}
        <div>
          <a
            className="button button-primary-link button-flush"
            onClick={this.props.onAddItem.bind(this, {value: data.localVolumes.length, path: 'localVolumes'})}>
            <Icon color="purple" id="plus" size="tiny" /> Add Local Volumes
          </a>
        </div>
        <h2 className="short-bottom">
          External Volumes Variables
        </h2>
        <p>
          Set up volumes variables for each task your service launches.
        </p>
        {this.getExternalVolumesLines(data.externalVolumes, data.localVolumes.length)}
        <FormRow>
          <FormGroup className="column-12">
            <a
              className="button button-primary-link button-flush"
              onClick={this.props.onAddItem.bind(this, {value: data.localVolumes.length, path: 'externalVolumes'})}>
              <Icon color="purple" id="plus" size="tiny" /> Add External Volumes
            </a>
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
