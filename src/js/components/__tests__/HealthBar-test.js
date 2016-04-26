jest.dontMock('../HealthBar');
jest.dontMock('../StatusBar');

/* eslint-disable no-unused-vars */
let React = require('react');
/* eslint-enable no-unused-vars */
let ReactDOM = require('react-dom');
let ReactTestUtils = require('react-addons-test-utils');
let Tooltip = require('reactjs-components').Tooltip;

let HealthBar = require('../HealthBar');
let StatusBar = require('../StatusBar');

const testData = {
  tasksRunning: 3,
  tasksHealthy: 1,
  tasksUnhealthy: 1,
  tasksUnknown: 1,
  tasksStaged: 1
};

const testInstanceCount = 4;
describe('#HealthBar', function () {
  beforeEach(function () {
    this.container = document.createElement('div');
    this.instance = ReactDOM.render(
      <HealthBar
        tasks={testData}
        instancesCount={testInstanceCount} />,
      this.container
    );
  });

  afterEach(function () {
    ReactDOM.unmountComponentAtNode(this.container);
  });

  describe('PropTypes', function () {
    it('should throw an error if no tasks prop is provided', function () {
      spyOn(console, 'error');
      this.instance = ReactDOM.render(
        <HealthBar />,
        this.container
      );
      expect(console.error)
        .toHaveBeenCalledWith(
          'Warning: Failed propType: Required prop `tasks` was not' +
          ' specified in `HealthBar`.'
        );
    });
  });

  describe('StatusBar', function () {
    it('should contain StatusBar Component', function () {
      expect(
        ReactTestUtils.findRenderedComponentWithType(this.instance, StatusBar)
      ).toBeTruthy();
    });
  });

  describe('Tooltip', function () {
    it('should contain Tooltip Component', function () {
      expect(
        ReactTestUtils.findRenderedComponentWithType(this.instance, Tooltip)
      ).toBeTruthy();
    });
  });

  describe('Empty tooltip', function () {
    it('should have an empty tooltip', function () {
      this.instance = ReactDOM.render(
        <HealthBar tasks={{}}/>,
        this.container
      );

      expect(
        ReactTestUtils.findRenderedComponentWithType(this.instance, Tooltip)
          .props.content
      ).toEqual('No Running Tasks');
    });
  });
});
