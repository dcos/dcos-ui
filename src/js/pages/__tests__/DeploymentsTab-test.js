jest.unmock('moment');
jest.unmock('../services/DeploymentsTab');
jest.unmock('../../structs/DeploymentsList');
jest.unmock('../../structs/Deployment');
jest.unmock('../../mixins/GetSetMixin');

import JestUtil from '../../utils/JestUtil';
/* eslint-disable no-unused-vars */
import React from 'react';
/* eslint-enable no-unused-vars */
import ReactDOM from 'react-dom';

import DCOSStore from '../../stores/DCOSStore';
import Deployment from '../../structs/Deployment';
import DeploymentsTab from '../services/DeploymentsTab';
import DeploymentsList from '../../structs/DeploymentsList';
import Service from '../../structs/Service';

describe('DeploymentsTab', function () {

  beforeEach(function () {
    // Clean up application timers.
    jasmine.clock().uninstall();
    // Install our custom jasmine timers.
    jasmine.clock().install();
    jasmine.clock().mockDate(new Date(2016, 3, 19));
    let deployments = new DeploymentsList({
      items: [
        {
          id: 'deployment-id',
          version: '2001-01-01T01:01:01.001Z',
          currentStep: 2,
          totalSteps: 3,
          affectedApps: ['service-1', 'service-2'],
          affectedServices: [
            new Service({name: 'service-1', deployments: []}),
            new Service({name: 'service-2', deployments: []})
          ]
        }
      ]
    });
    DCOSStore.deploymentsList = deployments;
    this.container = document.createElement('div');
    this.instance = ReactDOM.render(
      JestUtil.stubRouterContext(DeploymentsTab, {}),
      this.container
    );
    this.node = ReactDOM.findDOMNode(this.instance);
    this.tbody = this.node.querySelector('tbody');
    this.trs = this.tbody.querySelectorAll('tr');
    this.tds = this.tbody.querySelectorAll('td');
  });

  afterEach(function () {
    ReactDOM.unmountComponentAtNode(this.container);
  });

  describe('#getRollbackModalText', function () {

    it('should return a removal message when passed a starting deployment', function () {
      let text = DeploymentsTab.prototype.getRollbackModalText(new Deployment({
        id: 'deployment-id',
        affectedApps: ['app1'],
        affectedServices: [new Service({name: 'app1'})],
        steps: [{actions: [{type: 'StartApplication'}]}]
      }));
      expect(text).toContain('remove the affected service');
    });

    it('should return a revert message when passed a non-starting deployment', function () {
      let text = DeploymentsTab.prototype.getRollbackModalText(new Deployment({
        id: 'deployment-id',
        affectedApps: ['app1'],
        affectedServices: [new Service({name: 'app1'})],
        steps: [{actions: [{type: 'ScaleApplication'}]}]
      }));
      expect(text).toContain('revert the affected service');
    });

  });

  describe('#render', function () {

    it('should render the deployments count', function () {
      let h4 = this.container.querySelector('h4');
      expect(h4.textContent).toEqual('1 Active Deployment');
    });

    it('should render one row per deployment', function () {
      expect(this.trs.length).toEqual(1);
    });

    describe('affected services column', function () {
      it('should render the deployment ID', function () {
        let dt = this.tds[0].querySelector('dt');
        expect(dt.textContent).toEqual('deployment-id');
      });
      it('should render each affected application', function () {
        let dds = this.tds[0].querySelectorAll('dd');
        expect(dds.length).toEqual(2);
      });
    });

    describe('location column', function () {
      it('should render a location for each service', function () {
        let lis = this.tds[1].querySelectorAll('li');
        expect(lis.length).toEqual(2);
      });
    });

    describe('timing column', function () {
      it('should render the deployment start time', function () {
        expect(this.tds[2].textContent).toEqual('15 years ago');
      });
      it('should render a `time` element', function () {
        let time = this.tds[2].querySelector('time');
        expect(time.getAttribute('dateTime')).toEqual('2001-01-01T01:01:01.001Z');
      });
    });

    describe('status column', function () {
      it('should render the deployment progress', function () {
        let deploymentStep = this.tds[3].querySelector('.deployment-step');
        expect(deploymentStep.textContent).toEqual('Step 2 of 3');
      });
      it('should render the status of each application', function () {
        let lis = this.tds[3].querySelectorAll('li');
        expect(lis.length).toEqual(2);
      });
    });

    describe('action column', function () {
      it('should render a rollback button', function () {
        let rollbackButton = this.tds[4].querySelector('.deployment-rollback');
        expect(rollbackButton).not.toBeNull();
      });
    });

  });

});
