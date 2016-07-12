jest.dontMock('../MarathonTaskDetailsList');
/* eslint-disable no-unused-vars */
var React = require('react');
/* eslint-enable no-unused-vars */
var ReactDOM = require('react-dom');
var TestUtils = require('react-addons-test-utils');

let MarathonStore = require('../../stores/MarathonStore');
let MarathonTaskDetailsList = require('../MarathonTaskDetailsList');
let Service = require('../../structs/Service');

describe('MarathonTaskDetailsList', function () {

  beforeEach(function () {
    this.getServiceFromTaskID = MarathonStore.getServiceFromTaskID;
    MarathonStore.getServiceFromTaskID = function () {
      return new Service();
    };
    this.container = document.createElement('div');
  });

  afterEach(function () {
    MarathonStore.getServiceFromTaskID = this.getServiceFromTaskID;
    ReactDOM.unmountComponentAtNode(this.container);
  });

  describe('#getTaskEndpoints', function () {

    it('returns None if ipAddresses, ports and host is not set', function () {
      let instance = ReactDOM.render(
        <MarathonTaskDetailsList taskID="foo" />,
        this.container
      );
      expect(instance.getTaskEndpoints({})).toEqual('None');
    });

    it('returns a list of ipAddresses if ports is not defined', function () {
      let instance = ReactDOM.render(
        <MarathonTaskDetailsList taskID="foo" />,
        this.container
      );
      expect(instance.getTaskEndpoints({
        ipAddresses: [
          new Service({ipAddress: 'foo'}),
          new Service({ipAddress: 'bar'})
        ]
      })).toEqual('foo, bar');
    });

    it('returns host if ports and ipAddresses are not defined', function () {
      let instance = ReactDOM.render(
        <MarathonTaskDetailsList taskID="foo" />,
        this.container
      );
      expect(instance.getTaskEndpoints({host: 'foo'}))
        .toEqual('foo');
    });

    it('returns host with ports if ipAddresses are not defined', function () {
      let instance = ReactDOM.render(
        <MarathonTaskDetailsList taskID="foo" />,
        this.container
      );
      let result = instance.getTaskEndpoints({host: 'foo', ports: [1, 2]});

      expect(result.length).toEqual(2);
      expect(result[0].props.children).toEqual('foo:1');
    });

    it('uses service ports if available', function () {
      MarathonStore.getServiceFromTaskID = function () {
        return new Service({
          ipAddress: {discovery : {ports: [{number: 3}]}}
        });
      };
      let instance = ReactDOM.render(
        <MarathonTaskDetailsList taskID="foo" />,
        this.container
      );
      let result = instance.getTaskEndpoints({host: 'foo', ports: [1, 2]});

      expect(result.length).toEqual(1);
      expect(result[0].props.children).toEqual('foo:3');
    });

    it('defaults to ipAddresses and service ports', function () {
      MarathonStore.getServiceFromTaskID = function () {
        return new Service({
          ipAddress: {discovery : {ports: [{number: 3}]}}
        });
      };
      let instance = ReactDOM.render(
        <MarathonTaskDetailsList taskID="foo" />,
        this.container
      );
      let result = instance.getTaskEndpoints({
        host: 'foo',
        ipAddresses: [
          new Service({ipAddress: 'foo'}),
          new Service({ipAddress: 'bar'})
        ],
        ports: [1, 2]
      });

      expect(result.length).toEqual(2);
      expect(result[0].props.children).toEqual('foo:3');
      expect(result[1].props.children).toEqual('bar:3');
    });

  })

});
