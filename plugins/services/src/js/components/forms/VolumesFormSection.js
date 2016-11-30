import React, {Component} from 'react';

import FieldError from '../../../../../../src/js/components/form/FieldError';
import FieldInput from '../../../../../../src/js/components/form/FieldInput';
import FieldLabel from '../../../../../../src/js/components/form/FieldLabel';
import FieldSelect from '../../../../../../src/js/components/form/FieldSelect';
import FormGroup from '../../../../../../src/js/components/form/FormGroup';
import Icon from '../../../../../../src/js/components/Icon';
import {FormReducer as localVolumes} from '../../reducers/serviceForm/LocalVolumes';
import {FormReducer as externalVolumes} from '../../reducers/serviceForm/ExternalVolumes';

class VolumesFormSection extends Component {

  getPersistentVolumeConfig(volume, key) {
    if (volume.type !== 'PERSISTENT') {
      return null;
    }
    const {errors} = this.props;

    return (
      <div className="flex row">
        <FormGroup
          className="column-3"
          required={false}
          showError={Boolean(errors.localVolumes[key])}>
          <FieldLabel>Size (MiB)</FieldLabel>
          <FieldInput
            name={`localVolumes.${key}.size`}
            type="number"
            value={volume.size} />
          <FieldError>{errors.localVolumes[key]}</FieldError>
        </FormGroup>
        <FormGroup
          className="column-6"
          required={false}
          showError={Boolean(errors.localVolumes[key])}>
          <FieldLabel>Container Path</FieldLabel>
          <FieldInput
            name={`localVolumes.${key}.containerPath`}
            type="text"
            value={volume.containerPath}/>
          <FieldError>{errors.localVolumes[key]}</FieldError>
        </FormGroup>
      </div>
    );
  }

  getHostVolumeConfig(volume, key) {
    if (volume.type !== 'HOST') {
      return null;
    }
    const {errors} = this.props;

    return (
      <div className="flex row">
        <FormGroup
          className="column-4"
          required={false}
          showError={Boolean(errors.localVolumes[key])}>
          <FieldLabel>HostPath</FieldLabel>
          <FieldInput
            name={`localVolumes.${key}.hostPath`}
            value={volume.hostPath} />
          <FieldError>{errors.localVolumes[key]}</FieldError>
        </FormGroup>
        <FormGroup
          className="column-4"
          required={false}
          showError={Boolean(errors.localVolumes[key])}>
          <FieldLabel>Container Path</FieldLabel>
          <FieldInput
            name={`localVolumes.${key}.containerPath`}
            type="text"
            value={volume.containerPath}/>
          <FieldError>{errors.localVolumes[key]}</FieldError>
        </FormGroup>
        <FormGroup
          className="column-4"
          required={false}
          showError={Boolean(errors.localVolumes[key])}>
          <FieldLabel>Mode</FieldLabel>
          <FieldSelect name={`localVolumes.${key}.mode`} value={volume.mode}>
            <option value="RW">READ and Write</option>
            <option value="RO">READ ONLY</option>
          </FieldSelect>
        </FormGroup>
      </div>
    );
  }

  getHostOption(dockerImage) {
    if (dockerImage == null || dockerImage === '') {
      return null;
    }
    return <option value="HOST">Host Volume</option>;
  }

  getLocalVolumesLines(data) {
    const {errors} = this.props;

    const dockerImage = this.props.data.container &&
      this.props.data.container.docker &&
      this.props.data.container.docker.image;

    return data.map((volume, key) => {
      if (volume.type === 'HOST' &&
        (dockerImage == null || dockerImage === '')) {
        return null;
      }

      return (
        <div key={key} className="panel pod-short">
          <div className="pod-narrow pod-short">
            <div className="flex row">
              <FormGroup
                className="column-6"
                required={false}
                showError={Boolean(errors.localVolumes[key])}>
                <FieldLabel>Volume Type</FieldLabel>
                <FieldSelect name={`localVolumes.${key}.type`} value={volume.type}>
                  <option>Select...</option>
                  <option value="PERSISTENT">Persistent Volume</option>
                  {this.getHostOption(dockerImage)}
                </FieldSelect>
              </FormGroup>
              <div className="form-remove">
                <a className="button button-primary-link"
                  onClick={this.props.onRemoveItem.bind(this,
                    {value: key, path: 'localVolumes'})}>
                  <Icon id="close" color="grey" size="tiny"/>
                </a>
              </div>
            </div>
            {this.getPersistentVolumeConfig(volume, key)}
            {this.getHostVolumeConfig(volume, key)}
          </div>
        </div>
      );
    });
  }

  getExternalVolumesLines(data) {
    const {errors} = this.props;

    return data.map((volumes, key) => {
      return (
        <div key={key} className="panel pod-short">
          <div className="pod-narrow pod-short">
            <div className="flex row">
              <FormGroup
                className="column-6"
                required={false}
                showError={Boolean(errors.externalVolumes[key])}>
                <FieldLabel>Name</FieldLabel>
                <FieldInput
                  name={`externalVolumes.${key}.name`}
                  type="text"
                  value={volumes.name}/>
                <FieldError>{errors.externalVolumes[key]}</FieldError>
              </FormGroup>
              <FormGroup
                className="column-9"
                required={false}
                showError={Boolean(errors.externalVolumes[key])}>
                <FieldLabel>Container Mount Path</FieldLabel>
                <FieldInput
                  name={`externalVolumes.${key}.containerPath`}
                  type="text"
                  value={volumes.containerPath}/>
                <FieldError>{errors.externalVolumes[key]}</FieldError>
              </FormGroup>
              <div className="form-remove">
                <a className="button button-primary-link"
                  onClick={this.props.onRemoveItem.bind(this,
                    {value: key, path: 'externalVolumes'})}>
                  <Icon id="close" color="grey" size="tiny"/>
                </a>
              </div>
            </div>
          </div>
        </div>
      );
    });
  }

  render() {
    let {data} = this.props;

    return (
      <div className="form flush-bottom">
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
            + Add Local Volumes
          </a>
        </div>
        <h2 className="flush-top short-bottom">
          External Volumes Variables
        </h2>
        <p>
          Set up volumes variables for each task your service launches.
        </p>
        {this.getExternalVolumesLines(data.externalVolumes)}
        <div>
          <a
            className="button button-primary-link button-flush"
            onClick={this.props.onAddItem.bind(this, {value: data.localVolumes.length, path: 'externalVolumes'})}>
            + Add External Volumes
          </a>
        </div>
      </div>
    );
  }
}

VolumesFormSection.defaultProps = {
  data: {},
  errors: {
    localVolumes: [],
    externalVolumes: []
  },
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
  localVolumes,
  externalVolumes
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
