jest.dontMock('../ConfigurationView');
jest.dontMock('../DescriptionList');

/* eslint-disable no-unused-vars */
var React = require('react');
/* eslint-enable no-unused-vars */
var ReactDOM = require('react-dom');
var TestUtils = require('react-addons-test-utils');

var Service = require('../../structs/Service');
var DCOSStore = require('../../stores/DCOSStore');
var ConfigurationView = require('../ConfigurationView');
var DescriptionList = require('../DescriptionList');

describe('ConfigurationView', function () {

  const versionID = '2016-05-02T16:07:32.583Z';
  const service = new Service({
    id: '/test',
    healthChecks: [{path: '', protocol: 'HTTP'}],
    cpus: 1,
    mem: 2048,
    version: versionID,
    versionInfo: {
      lastConfigChangeAt: '2016-03-22T10:46:07.354Z',
      lastScalingAt: '2016-03-22T10:46:07.354Z'
    },
    versions: new Map([[versionID, {id: '/test'}]])
  });

  beforeEach(function () {
    this.container = document.createElement('div');
    this.instance = ReactDOM.render(
      <ConfigurationView service={service}
        versionID={versionID} />,
      this.container
    );
  });

  afterEach(function () {
    ReactDOM.unmountComponentAtNode(this.container);
  });

  describe('#fetchVersion', function () {

    beforeEach(function () {
      spyOn(DCOSStore, 'fetchServiceVersion');
    });

    it('should fetch the version if its undefined', function () {
      let versionID = '2016-05-02T17:07:32.583Z';

      this.instance = ReactDOM.render(
        <ConfigurationView service={service}
          versionID={versionID} />,
        this.container
      );
      expect(DCOSStore.fetchServiceVersion)
        .toHaveBeenCalledWith(service.getId(), versionID);
    });

    it('should not fetch the version if its already loaded', function () {
      this.instance = ReactDOM.render(
        <ConfigurationView service={service}
          versionID={versionID} />,
        this.container
      );
      expect(DCOSStore.fetchServiceVersion.calls.count()).toEqual(0);
    });

  });

  describe('#getPortDefinitionsSection', function () {
    const portDefinitions = [
      {
        port: 0,
        protocol: 'tcp',
        name: 'alpha',
      },
      {
        port: 0,
        protocol: 'tcp'
      }
    ];

    it('renders correct number of (description) lists', function () {
      let node = ReactDOM.render(this.instance
          .getPortDefinitionsSection({portDefinitions}),
        this.container
      );
      let lists = node.querySelectorAll('.nested-description-list');

      expect(lists.length).toEqual(2);
    });

    it('renders correct sub list headings', function () {

      let node = ReactDOM.render(this.instance
          .getPortDefinitionsSection({portDefinitions}),
        this.container
      );
      let headlines = node.querySelectorAll('.nested-description-list h5');

      expect(headlines[0].textContent).toEqual('Port Definition 1 (alpha)');
      expect(headlines[1].textContent).toEqual('Port Definition 2');
    });

  });

  describe('#getHealthChecksSection', function () {
    const healthChecks = [
      {
        protocol: 'COMMAND',
        command: {
          value: 'exit 0;'
        },
        gracePeriodSeconds: 300,
        intervalSeconds: 60,
        timeoutSeconds: 20,
        maxConsecutiveFailures: 3,
        ignoreHttp1xx: false
      },
      {
        path: '/test',
        protocol: 'HTTP',
        portIndex: 0,
        gracePeriodSeconds: 300,
        intervalSeconds: 60,
        timeoutSeconds: 20,
        maxConsecutiveFailures: 3,
        ignoreHttp1xx: false,
        port: 0
      },
      {
        protocol: 'TCP',
        portIndex: 0,
        gracePeriodSeconds: 300,
        intervalSeconds: 60,
        timeoutSeconds: 20,
        maxConsecutiveFailures: 3,
        ignoreHttp1xx: false,
        port: 0
      }
    ];

    it('renders correct number of (description) lists', function () {
      let node = ReactDOM.render(this.instance
          .getHealthChecksSection({healthChecks}),
        this.container
      );
      let lists = node.querySelectorAll('.nested-description-list');

      expect(lists.length).toEqual(3);
    });

    it('renders correct sub list headings', function () {
      let node = ReactDOM.render(this.instance
          .getHealthChecksSection({healthChecks}),
        this.container
      );
      let headlines = node.querySelectorAll('.nested-description-list h5');

      expect(headlines[0].textContent).toEqual('Health Check 1 (COMMAND)');
      expect(headlines[1].textContent).toEqual('Health Check 2 (HTTP)');
      expect(headlines[2].textContent).toEqual('Health Check 3 (TCP)');
    });

  });

  describe('#render', function () {

    it('renders configuration (description) lists', function () {
      var descriptionLists = TestUtils
        .scryRenderedComponentsWithType(this.instance, DescriptionList);

      expect(descriptionLists).toBeDefined();
    });

  });

});
