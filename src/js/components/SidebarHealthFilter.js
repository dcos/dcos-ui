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
      }, this.props.handleFilterChange.bind(null, selectedNodes));
    }
  }

  getCountByHealth(key) {
    var count = this.props.countByHealth[HealthTypes[key]];

    if (count == null) {
      return 0;
    }

    return count;
  }

  getFormLabel(healthLabel, healthType) {
    let badge = null;
    let count = this.getCountByHealth(healthType);

    if (count) {
      badge = <span className="badge">{count}</span>;
    }

    return (
      <span className="row row-flex flush">
        <span className="label flex-grow">{healthLabel}</span>
        {badge}
      </span>
    );
  }

  getHealthNodes() {
    let state = this.state;
    return Object.keys(HealthTypes).map((healthType, index) => {
      let health = HealthTypes[healthType].toString();
      let checked = state.selectedNodes.indexOf(health) > -1;
      let definition = [{
        checked: checked,
        value: checked,
        fieldType: 'checkbox',
        name: healthType,
        label: this.getFormLabel(HealthLabels[healthType], healthType),
        labelClass: 'inverse row row-flex flush our-special-class'
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
      <div style={{width: '165px'}} className="container container-fluid flush-top flush-left">
        <div style={{justifyContent: 'flex-end'}} className="row row-flex flush">
          <h6 className="inverse flush flex-grow">HEALTH</h6>
          {this.getClearLinkForFilter(FilterTypes.HEALTH)}
        </div>
        {this.getHealthNodes()}
      </div>
    );
  }
}

SidebarHealthFilter.propTypes = {
  countByHealth: React.PropTypes.object.isRequired,
  handleFilterChange: React.PropTypes.func.isRequired
};

SidebarHealthFilter.defaultProps = {
};

module.exports = SidebarHealthFilter;
