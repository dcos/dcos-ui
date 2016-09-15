jest.dontMock('../../structs/Pod');
jest.dontMock('../../structs/PodInstanceList');
jest.dontMock('../../structs/PodInstance');
jest.dontMock('../../structs/PodContainer');
jest.dontMock('./fixtures/PodFixture');
jest.dontMock('../CheckboxTable');
jest.dontMock('../CollapsingString');
jest.dontMock('../ExpandingTable');
jest.dontMock('../PodInstancesTable');
jest.dontMock('../TimeAgo');

const JestUtil = require('../../utils/JestUtil');
/* eslint-disable no-unused-vars */
const React = require('react');
/* eslint-enable no-unused-vars */
const ReactDOMServer = require('react-dom/server');
const TestUtils = require('react-addons-test-utils');

const PodInstancesTable = require('../PodInstancesTable');
const Pod = require('../../structs/Pod');
const Util = require('../../utils/Util');

const PodFixture = require('./fixtures/PodFixture');

describe('PodInstancesTable', function () {

  let fixture = Util.deepCopy(PodFixture);

  // Fix the dates in order to test the relative date field
  fixture.instances[0].lastUpdated = new Date(Date.now() - (86400000 * 1)).toString();
  fixture.instances[0].lastChanged = new Date(Date.now() - (86400000 * 2)).toString();
  fixture.instances[0].containers[0].lastUpdated = new Date(Date.now() - (86400000 * 3)).toString();
  fixture.instances[0].containers[0].lastChanged = new Date(Date.now() - (86400000 * 4)).toString();
  fixture.instances[0].containers[1].lastUpdated = new Date(Date.now() - (86400000 * 5)).toString();
  fixture.instances[0].containers[1].lastChanged = new Date(Date.now() - (86400000 * 6)).toString();

  const pod = new Pod(fixture);

  describe('#render (collapsed)', function () {

    beforeEach(function () {
      this.instance = TestUtils.renderIntoDocument(
        <PodInstancesTable pod={pod} />
      );
    });

    it('should properly render the name column', function () {
      var names = TestUtils.scryRenderedDOMComponentsWithClass(
          this.instance, 'column-name')
          .reduce(JestUtil.reduceTextContentOfSelector(
            '.collapsing-string-full-string'), []);

      expect(names).toEqual([
        'instance-1'
      ]);
    });

    it('should properly render the address column', function () {
      var names = TestUtils.scryRenderedDOMComponentsWithClass(
          this.instance, 'column-address')
          .reduce(JestUtil.reduceTextContentOfSelector(
            '.collapsing-string-full-string'), []);

      expect(names).toEqual([
        'agent-1'
      ]);
    });

    it('should properly render the status column', function () {
      var names = TestUtils.scryRenderedDOMComponentsWithClass(
          this.instance, 'column-status')
          .reduce(JestUtil.reduceTextContentOfSelector('.status-text'),
            []);

      expect(names).toEqual([
        'Running'
      ]);
    });

    it('should properly render the cpu column', function () {
      var names = TestUtils.scryRenderedDOMComponentsWithClass(
          this.instance, 'column-cpus')
          .filter(JestUtil.filterByTagName('TD'))
          .map(JestUtil.mapTextContent);

      expect(names).toEqual([
        '1'
      ]);
    });

    it('should properly render the mem column', function () {
      var names = TestUtils.scryRenderedDOMComponentsWithClass(
          this.instance, 'column-mem')
          .filter(JestUtil.filterByTagName('TD'))
          .map(JestUtil.mapTextContent);

      expect(names).toEqual([
        '128 MiB'
      ]);
    });

    it('should properly render the updated column', function () {
      var names = TestUtils.scryRenderedDOMComponentsWithClass(
          this.instance, 'column-updated')
          .filter(JestUtil.filterByTagName('TD'))
          .map(JestUtil.mapTextContent);

      expect(names).toEqual([
        'a day ago'
      ]);
    });

    it('should properly render the version column', function () {
      var names = TestUtils.scryRenderedDOMComponentsWithClass(
          this.instance, 'column-version')
          .filter(JestUtil.filterByTagName('TD'))
          .map(JestUtil.mapTextContent);

      expect(names).toEqual([
        '2016-08-29T01:01:01.0012016-08-29T01:01:01.001'
      ]);
    });

  });

  describe('#render (expanded)', function () {

    beforeEach(function () {

      // Create a stub router context because when the items are expanded
      // the are creating <Link /> instances.
      let component = JestUtil.stubRouterContext(PodInstancesTable,
        {pod}, {service: pod});
      this.instance = TestUtils.renderIntoDocument(component);

      // Expand all table rows by clicking on them
      TestUtils.scryRenderedDOMComponentsWithClass(
          this.instance, 'column-name'
      ).forEach(function (element) {
        let target = element.querySelector('.is-expandable');
        if (target) {
          TestUtils.Simulate.click(target);
        }
      });
    });

    it('should properly render the name column', function () {
      var names = TestUtils.scryRenderedDOMComponentsWithClass(
          this.instance, 'column-name')
          .reduce(JestUtil.reduceTextContentOfSelector(
            '.collapsing-string-full-string'), []);

      expect(names).toEqual([
        'instance-1',
        'container-1',
        'container-2'
      ]);
    });

    it('should properly render the address column', function () {
      var columns = TestUtils.scryRenderedDOMComponentsWithClass(
          this.instance, 'column-address');
      let agents = columns.reduce(JestUtil.reduceTextContentOfSelector(
          '.collapsing-string-full-string'), []);
      let ports = columns.reduce(JestUtil.reduceTextContentOfSelector('a'), []);

      expect(agents).toEqual([
        'agent-1'
      ]);
      expect(ports).toEqual([
        ':31001',
        ':31002'
      ]);
    });

    it('should properly render the status column', function () {
      var names = TestUtils.scryRenderedDOMComponentsWithClass(
          this.instance, 'column-status')
          .reduce(JestUtil.reduceTextContentOfSelector('.status-text'), []);

      expect(names).toEqual([
        'Running',
        'Running',
        'Running'
      ]);
    });

    it('should properly render the cpu column', function () {
      var names = TestUtils.scryRenderedDOMComponentsWithClass(
          this.instance, 'column-cpus')
          .filter(JestUtil.filterByTagName('TD'))
          .reduce(JestUtil.reduceTextContentOfSelector('div > div > span'), []);

      expect(names).toEqual([
        '1',
        '0.5',
        '0.5'
      ]);
    });

    it('should properly render the mem column', function () {
      var names = TestUtils.scryRenderedDOMComponentsWithClass(
          this.instance, 'column-mem')
          .filter(JestUtil.filterByTagName('TD'))
          .reduce(JestUtil.reduceTextContentOfSelector('div > div > span'), []);

      expect(names).toEqual([
        '128 MiB',
        '64 MiB',
        '64 MiB'
      ]);
    });

    it('should properly render the updated column', function () {
      var names = TestUtils.scryRenderedDOMComponentsWithClass(
          this.instance, 'column-updated')
          .filter(JestUtil.filterByTagName('TD'))
          .reduce(JestUtil.reduceTextContentOfSelector('time'), []);

      expect(names).toEqual([
        'a day ago',
        '3 days ago',
        '5 days ago'
      ]);
    });

    it('should properly render the version column', function () {
      var names = TestUtils.scryRenderedDOMComponentsWithClass(
          this.instance, 'column-version')
          .filter(JestUtil.filterByTagName('TD'))
          .map(JestUtil.mapTextContent);

      expect(names).toEqual([
        '2016-08-29T01:01:01.0012016-08-29T01:01:01.001'
      ]);
    });

  });
});
