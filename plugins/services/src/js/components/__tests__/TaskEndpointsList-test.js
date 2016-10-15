jest.dontMock('../TaskEndpointsList');
/* eslint-disable no-unused-vars */
const React = require('react');
/* eslint-enable no-unused-vars */
const ReactDOM = require('react-dom');
const TestUtils = require('react-addons-test-utils');

const Node = require('../../../../../../src/js/structs/Node');
const TaskEndpointsList = require('../TaskEndpointsList');

describe('TaskEndpointsList', function () {

  beforeEach(function () {
    this.container = document.createElement('div');
  });

  afterEach(function () {
    ReactDOM.unmountComponentAtNode(this.container);
  });

  describe('#getTaskEndpoints', function () {

    it('returns N/A if ipAddresses, ports and host is not set', function () {
      let instance = ReactDOM.render(
        <TaskEndpointsList task={{}} />,
        this.container
      );
      expect(ReactDOM.findDOMNode(instance).textContent).toEqual('N/A');
    });

    it('returns N/A if task is undefined', function () {
      let instance = ReactDOM.render(
        <TaskEndpointsList />,
        this.container
      );
      expect(ReactDOM.findDOMNode(instance).textContent).toEqual('N/A');
    });

    it('returns a list of linked ipAddresses if ports is not defined', function () {
      let instance = ReactDOM.render(
        <TaskEndpointsList task={{
          statuses: [{container_status: {network_infos: [
            {ip_addresses: [{ip_address: 'foo'}, {ip_address: 'bar'}]}]}}
          ],
          container: {type: 'FOO', foo: {network: 'BRIDGE'}}
        }} />,
        this.container
      );
      let links = ReactDOM.findDOMNode(instance).querySelectorAll('a');

      expect(links[0].textContent).toEqual('foo');
      expect(links[0].attributes.href.value).toEqual('//foo');
      expect(links[1].textContent).toEqual('bar');
      expect(links[1].attributes.href.value).toEqual('//bar');
    });

    it('returns a list of linked hosts ports and ipAddresses are not defined', function () {
      let instance = ReactDOM.render(
        <TaskEndpointsList task={{}} node={new Node({hostname: 'foo'})} />,
        this.container
      );
      let links = ReactDOM.findDOMNode(instance).querySelectorAll('a');

      expect(links[0].textContent).toEqual('foo');
      expect(links[0].attributes.href.value).toEqual('//foo');
    });

    it('returns host with ports if ipAddresses are not defined', function () {
      let instance = ReactDOM.render(
        <TaskEndpointsList task={{ports: [1, 2]}} node={new Node({hostname: 'foo'})} />,
        this.container
      );
      let links = ReactDOM.findDOMNode(instance).querySelectorAll('a');

      expect(ReactDOM.findDOMNode(instance).textContent).toEqual('foo: [1, 2]');
      expect(links[0].textContent).toEqual('1');
      expect(links[0].attributes.href.value).toEqual('//foo:1');
      expect(links[1].textContent).toEqual('2');
      expect(links[1].attributes.href.value).toEqual('//foo:2');
    });

    it('returns truncated list if more than 3 ports are provided', function () {
      let instance = ReactDOM.render(
        <TaskEndpointsList task={{ports: [1, 2, 3, 4, 5]}} node={new Node({hostname: 'foo'})} />,
        this.container
      );
      let links = ReactDOM.findDOMNode(instance).querySelectorAll('a');
      let moreLink = links[3];

      expect(ReactDOM.findDOMNode(instance).textContent).toEqual('foo: [1, 2, 3, 2 more...]');
      expect(moreLink.textContent).toEqual('2 more...');
    });

    it('expands truncated list when "more" is clicked', function () {
      let instance = ReactDOM.render(
        <TaskEndpointsList task={{ports: [1, 2, 3, 4, 5]}} node={new Node({hostname: 'foo'})} />,
        this.container
      );
      let links = ReactDOM.findDOMNode(instance).querySelectorAll('a');
      let moreLink = links[3];
      TestUtils.Simulate.click(moreLink);
      links = ReactDOM.findDOMNode(instance).querySelectorAll('a');
      let lessLink = links[5];

      expect(ReactDOM.findDOMNode(instance).textContent).toEqual('foo: [1, 2, 3, 4, 5, less]');
      expect(lessLink.textContent).toEqual('less');
    });

    it('collapses truncated list when "less" is clicked', function () {
      let instance = ReactDOM.render(
        <TaskEndpointsList task={{ports: [1, 2, 3, 4, 5]}} node={new Node({hostname: 'foo'})} />,
        this.container
      );
      let links = ReactDOM.findDOMNode(instance).querySelectorAll('a');
      let moreLink = links[3];
      TestUtils.Simulate.click(moreLink);
      // Make sure it actually expanded the list.
      expect(ReactDOM.findDOMNode(instance).textContent).toEqual('foo: [1, 2, 3, 4, 5, less]');
      links = ReactDOM.findDOMNode(instance).querySelectorAll('a');
      let lessLink = links[5];
      TestUtils.Simulate.click(lessLink);

      expect(ReactDOM.findDOMNode(instance).textContent).toEqual('foo: [1, 2, 3, 2 more...]');
    });

  });

});
