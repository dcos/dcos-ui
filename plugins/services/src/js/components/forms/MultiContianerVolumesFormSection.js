import React, {Component} from 'react';
import Objektiv from 'objektiv';

import {getContainerNameWithIcon} from '../../utils/ServiceConfigDisplayUtil';
import FieldError from '../../../../../../src/js/components/form/FieldError';
import FieldInput from '../../../../../../src/js/components/form/FieldInput';
import FieldLabel from '../../../../../../src/js/components/form/FieldLabel';
import FormGroup from '../../../../../../src/js/components/form/FormGroup';
import FormGroupContainer from '../../../../../../src/js/components/form/FormGroupContainer';
import {FormReducer as volumeMounts} from '../../reducers/serviceForm/MultiContainerVolumes';

const errorsLens = Objektiv.attr('container', {}).attr('volumes', []);

class MultiContainerVolumesFormSection extends Component {

  getContainerMounts(containers, volumeMountIndex) {
    const {volumeMounts} = this.props.data;

    return containers.map((container, containerIndex) => {
      let containersLabel = null;
      let pathLabel = null;
      if (containerIndex === 0) {
        containersLabel = <FieldLabel>Containers</FieldLabel>;
        pathLabel = <FieldLabel>Container Mount Path</FieldLabel>;
      }

      return (
        <div className="flex row" key={containerIndex}>
          <div className="column-3">
            {containersLabel}
            {getContainerNameWithIcon(container)}
          </div>
          <FormGroup
            className="column-9"
            required={false}>
            {pathLabel}
            <FieldInput
              name={`volumeMounts.${volumeMountIndex}.mountPath.${containerIndex}`}
              type="text"
              value={volumeMounts[volumeMountIndex].mountPath[containerIndex]}/>
          </FormGroup>
        </div>
      );
    });
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
    const {containers} = this.props.data;

    return data.map((volumes, key) => {
      const nameError = errorsLens
        .at(key + offset, {})
        .attr('volumes', {})
        .get(this.props.errors)
        .name;
      const removeHandler = this.props.onRemoveItem.bind(
        this, {value: key, path: 'volumeMounts'}
      );

      return (
        <FormGroupContainer onRemove={removeHandler} key={key}>
          <div className="flex row">
            <FormGroup
              className="column-6"
              required={false}
              showError={Boolean(nameError)}>
              <FieldLabel>Name</FieldLabel>
              <FieldInput
                name={`volumeMounts.${key}.name`}
                type="text"
                value={volumes.name}/>
              <FieldError>{nameError}</FieldError>
            </FormGroup>
          </div>
          {this.getContainerMounts(containers, key)}
        </FormGroupContainer>
      );
    });
  }

  render() {
    const {data} = this.props;

    if (data.containers && data.containers.length === 0) {
      return null;
    }

    return (
      <div className="form flush-bottom">
        <h2 className="flush-top short-bottom">
          Ephemeral Volumes
        </h2>
        <p>
          Set up volumes variables for each task your service launches.
        </p>
        {this.getVolumesMountLines(data.volumeMounts, data.volumeMounts)}
        <div>
          <a
            className="button button-primary-link button-flush"
            onClick={this.props.onAddItem.bind(this,
              {value: data.volumeMounts.length, path: 'volumeMounts'})}>
            + Add Ephemeral Volume
          </a>
        </div>
      </div>
    );
  }
}

MultiContainerVolumesFormSection.defaultProps = {
  data: {},
  errors: {},
  onAddItem() {},
  onRemoveItem() {}
};

MultiContainerVolumesFormSection.propTypes = {
  data: React.PropTypes.object,
  errors: React.PropTypes.object,
  onAddItem: React.PropTypes.func,
  onRemoveItem: React.PropTypes.func
};

MultiContainerVolumesFormSection.configReducers = {
  volumeMounts
};

module.exports = MultiContainerVolumesFormSection;
