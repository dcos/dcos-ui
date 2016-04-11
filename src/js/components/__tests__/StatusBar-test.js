jest.dontMock('../StatusBar');

let React = require('react');
let ReactDOM = require('react-dom');

let StatusBar = require('../StatusBar');

const testData = [
  {
    key: '#FFF',
    value: 40,
    className: 'status'
  }, {
    key: '#000',
    value: 60,
    className: 'failed'
  }
];

describe('#StatusBar', function () {
  beforeEach(function () {
    this.container = document.createElement('div');
    this.instance = ReactDOM.render(
      <StatusBar
        data={testData}/>,
      this.container
    );
  });

  afterEach(function () {
    ReactDOM.unmountComponentAtNode(this.container);
  });

  describe('PropTypes', function () {
    it('Should throw an error if no data prop is provided', function () {
      spyOn(console, 'error');
      this.instance = ReactDOM.render(
        <StatusBar />,
        this.container
      );
      expect(console.error)
        .toHaveBeenCalledWith(
          'Warning: Failed propType: Required prop `data` was not' +
          ' specified in `StatusBar`.'
        );
    });

    it('Should throw an error if data is not in the right shape', function () {
      spyOn(console, 'error');
      this.instance = ReactDOM.render(
        <StatusBar data={[{
          value: 40,
          className: 'status'
        }]}/>,
        this.container
      );
      expect(console.error)
        .toHaveBeenCalledWith(
          'Warning: Each child in an array or iterator should have a unique' +
          ' "key" prop. Check the render method of `StatusBar`. See' +
          ' https://fb.me/react-warning-keys for more information.'
        );
    });
  });

  describe('className', function () {
    it('class name of the svg should contain status-bar (default)', function () {
      expect(
        this.container.querySelector('svg')
          .classList.contains('status-bar')
      ).toBeTruthy();
    });

    it('class name of the svg should contain test-bar (custom)', function () {
      this.instance = ReactDOM.render(
        <StatusBar
          data={testData}
          className="test-bar"/>,
        this.container
      );
      expect(
        this.container.querySelector('svg')
          .classList.contains('test-bar')
      ).toBeTruthy();
    });
  });

  describe('viewBox', function () {
    it('viewBox of the svg should be `0 0 100 10` (default)', function () {
      expect(
        this.container.querySelector('svg')
          .getAttribute('viewBox')
      ).toEqual('0 0 100 10');
    });

    it('viewBox of the svg should be `0 0 100 20`', function () {
      this.instance = ReactDOM.render(
        <StatusBar
          data={testData}
          height={20}/>,
        this.container
      );
      expect(
        this.container.querySelector('svg')
          .getAttribute('viewBox')
      ).toEqual('0 0 100 20');
    });
  });
  describe('rectangles', function () {
    it('should contain 2 Rectangles', function () {
      expect(this.container.querySelectorAll('rect').length)
        .toEqual(testData.length);
    });

    it('first rect should contain class name status', function () {
      expect(
        this.container.querySelector('rect:first-child')
          .classList.contains('status')
      ).toBeTruthy();
    });

    it('second rect should contain class name failed', function () {
      expect(
        this.container.querySelector('rect:nth-child(2)')
          .classList.contains('failed')
      ).toBeTruthy();
    });

    it('first rect should have an offset of 0', function () {
      expect(
        this.container.querySelector('rect:first-child')
          .getAttribute('x')
      ).toEqual('0');
    });

    it('second rect should have an offset of 30', function () {
      expect(
        this.container.querySelector('rect:nth-child(2)')
          .getAttribute('x')
      ).toEqual('40');
    });

    it('second rect should have an offset of 60', function () {
      let data = [
        {
          key: '#FFF',
          value: 3,
          className: 'status'
        }, {
          key: '#000',
          value: 2,
          className: 'failed'
        }
      ];
      this.instance = ReactDOM.render(
        <StatusBar
          data={data}/>,
        this.container
      );
      expect(
        this.container.querySelector('rect:nth-child(2)')
          .getAttribute('x')
      ).toEqual('60');
    });
  });
});
