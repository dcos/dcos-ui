jest.unmock('moment');
jest.unmock('../services/DeploymentsTab');
jest.unmock('../../structs/DeploymentsList');
jest.unmock('../../structs/Deployment');
jest.unmock('../../mixins/GetSetMixin');

/* eslint-disable no-unused-vars */
import React from 'react';
/* eslint-enable no-unused-vars */
import ReactDOM from 'react-dom';

import DCOSStore from '../../stores/DCOSStore';
import DeploymentsTab from '../services/DeploymentsTab';
import DeploymentsList from '../../structs/DeploymentsList';

describe('DeploymentsTab', function () {

  beforeEach(function () {
    jasmine.clock().mockDate(new Date(2016, 3, 19));
    let deployments = new DeploymentsList({
      items: [
        {
          id: 'deployment-id',
          version: '2001-01-01T01:01:01.001Z',
          currentStep: 2,
          totalSteps: 3
        }
      ]
    });
    DCOSStore.deploymentsList = deployments;
    this.container = document.createElement('div');
    this.instance = ReactDOM.render(
      <DeploymentsTab />,
      this.container
    );
    this.node = ReactDOM.findDOMNode(this.instance);
    this.tbody = this.node.querySelector('tbody');
    this.tds = this.tbody.querySelectorAll('td');
  });

  afterEach(function () {
    jasmine.clock().uninstall();
    ReactDOM.unmountComponentAtNode(this.container);
  });

  describe('#render', function () {

    it('should render the deployments count', function () {
      let h4 = this.container.querySelector('h4');
      expect(h4.textContent).toEqual('1 Active Deployment');
    });

    it('should render one row per deployment', function () {
      let trs = this.tbody.querySelectorAll('tr');
      expect(trs.length).toEqual(1);
    });

    it('should render the deployment ID', function () {
      expect(this.tds[0].textContent).toEqual('deployment-id');
    });

    it('should render the deployment start time', function () {
      expect(this.tds[1].textContent).toEqual('15 years ago');
    });

    it('should render the deployment progress', function () {
      expect(this.tds[2].textContent).toEqual('Step 2 of 3');
    });

  });

});
