import {Form} from 'reactjs-components';
import mixin from 'reactjs-mixin';
import React from 'react';
import update from 'react-addons-update';

import FilterTypes from '../constants/FilterTypes';
import HealthTypes from '../constants/HealthTypes';
import HealthLabels from '../constants/HealthLabels';
import QueryParamsMixin from '../mixins/QueryParamsMixin';

/*
{
    fieldType: 'text',
    formParent,
    name: fieldName,
    placeholder: '',
    isRequired,
    required: false,
    showError: false,
    showLabel: label,
    writeType: 'input',
    validation: function () { return true; },
    value,
    valueType: fieldProps.type
  }

  {
        fieldType: 'checkbox',
        name: 'use-ldaps',
        required: false,
        showLabel: false,
        label: fieldDefinitions['use-ldaps'],
        writeType: 'input',
        checked: this.state.fieldUseLDAPs.checked,
        disabled: this.state.fieldUseLDAPs.disabled,
        validation: function () { return true; }
      }
*/
class SidebarHealthFilter extends mixin(QueryParamsMixin) {
  constructor() {
    super();

    this.state = {
      selectedNodes: []
    };
  }

  componentDidMount() {
    this.updateFilterStatus();
  }

  componentWillReceiveProps() {
    this.updateFilterStatus();
  }

  handleFormChange(model, eventObj) {
    var selectedNodes = [];
    var state = this.state;

    if (eventObj.fieldValue) {
      selectedNodes = update(state.selectedNodes, {
        $push: [HealthTypes[eventObj.fieldName]]
      });
    } else {
      let index =
        state.selectedNodes.indexOf(HealthTypes[eventObj.fieldName].toString());
      if (index !== -1) {
        selectedNodes = update(state.selectedNodes, {
          $splice: [[index, 1]]
        });
      }
      console.log("index", index, selectedNodes);
    }

    this.setQueryParam(FilterTypes.HEALTH, selectedNodes);
  }

  updateFilterStatus() {
    var state = this.state;
    var selectedNodes = this.getQueryParamValue(FilterTypes.HEALTH);
    var stringify = JSON.stringify;

    if (selectedNodes == null) {
      selectedNodes = [];
    } else {
      selectedNodes = decodeURIComponent(selectedNodes)
        .split(',')
        .filter(function (healthKey) {
          let existingNode =
            Object.values(HealthTypes).indexOf(parseInt(healthKey, 10));
          return existingNode !== -1;
        });
    }

    if (stringify(selectedNodes) !== stringify(state.selectedNodes)) {
      this.setState({
        selectedNodes: selectedNodes
      });
    }
  }

  getHealthNodes() {
    let state = this.state;
    console.log(state);
    return Object.keys(HealthTypes).map((healthType, index) => {
      console.log(state.selectedNodes.indexOf(HealthTypes[healthType]) > -1,
        HealthTypes[healthType], healthType);
      let health = HealthTypes[healthType].toString();
      let definition = [{
        checked: state.selectedNodes.indexOf(health) > -1,
        fieldType: 'checkbox',
        name: healthType,
        label: HealthLabels[healthType],
        labelClass: 'inverse'
      }];

      return (
        <Form
          formGroupClass="form-group flush"
          key={index}
          definition={definition}
          onChange={this.handleFormChange.bind(this)} />
      );
    });
  }

  render() {
    return (
      <div className="container container-fluid flush-top flush-left">
        <h6 className="inverse flush">HEALTH</h6>
        {this.getHealthNodes()}
      </div>
    );
  }
}

SidebarHealthFilter.propTypes = {
};

SidebarHealthFilter.defaultProps = {
};

module.exports = SidebarHealthFilter;
