jest.dontMock('../StatusBar');

/* eslint-disable no-unused-vars */
var React = require('react');
/* eslint-enable no-unused-vars */
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
    it('should throw an error if no data prop is provided', function () {
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

    it('should throw an error if a data item is missing a value',
      function () {
        spyOn(console, 'error');
        this.instance = ReactDOM.render(
          <StatusBar data={[{
            className: 'status'
          }]}/>,
          this.container
        );
        expect(console.error)
          .toHaveBeenCalledWith(
            'Warning: Failed propType: Required prop `data[0].value` was not' +
            ' specified in `StatusBar`.'
          );
      });

    it('should throw an error if one data item is missing a value',
      function () {
        spyOn(console, 'error');
        this.instance = ReactDOM.render(
          <StatusBar data={[{
            className: 'status',
            value: 10
          }, {
            className: 'unknown'
          }]}/>,
          this.container
        );
        expect(console.error)
          .toHaveBeenCalledWith(
            'Warning: Failed propType: Required prop `data[1].value` was not' +
            ' specified in `StatusBar`.'
          );
      });

    it('should not throw an error if data does only contain a value field',
      function () {
        spyOn(console, 'error');
        this.instance = ReactDOM.render(
          <StatusBar data={[{
            value: 40
          }]}/>,
          this.container
        );
        expect(console.error).not.toHaveBeenCalled();
      });
  });

  describe('className', function () {
    it('should contain status-bar (default)', function () {
      expect(
        this.container.querySelector('svg')
          .classList.contains('status-bar')
      ).toBeTruthy();
    });

    it('should contain test-bar (custom)', function () {
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
    it('should have a viewBox of `0 0 100 10`', function () {
      expect(
        this.container.querySelector('svg')
          .getAttribute('viewBox')
      ).toEqual('0 0 100 10');
    });

    it('should be `0 0 100 10` if a height is provided',
      function () {
        this.instance = ReactDOM.render(
          <StatusBar
            data={testData}
            height={20}/>,
          this.container
        );
        expect(
          this.container.querySelector('svg')
            .getAttribute('viewBox')
        ).toEqual('0 0 100 10');
      });
  });

  describe('height', function () {
    it('should be 10 (default)', function () {
      expect(
        this.container.querySelector('svg')
          .getAttribute('height')
      ).toEqual('10');
    });

    it('should be 20 if 20 is provided', function () {
      this.instance = ReactDOM.render(
        <StatusBar
          data={testData}
          height={20}/>,
        this.container
      );
      expect(
        this.container.querySelector('svg')
          .getAttribute('height')
      ).toEqual('20');
    });
  });

  describe('rectangles', function () {
    it('should contain 2 rectangles', function () {
      expect(this.container.querySelectorAll('rect').length)
        .toEqual(testData.length);
    });

    describe('First rect', function () {
      it('should contain class name status', function () {
        expect(
          this.container.querySelector('rect:first-child')
            .classList.contains('status')
        ).toBeTruthy();
      });

      it('should have an offset of 0', function () {
        expect(
          this.container.querySelector('rect:first-child')
            .getAttribute('x')
        ).toEqual('0');
      });

      it('should have the class element-{index} if no classname is provided',
        function () {
          this.instance = ReactDOM.render(
            <StatusBar data={[{
              value: 40
            }]}/>,
            this.container
          );
          expect(this.container.querySelector('rect')
            .classList.contains('element-0')
          ).toBeTruthy();
        });

    });

    describe('Second rect', function () {

      it('should contain class name failed', function () {
        expect(
          this.container.querySelector('rect:nth-child(2)')
            .classList.contains('failed')
        ).toBeTruthy();
      });

      it('should have an offset of 30', function () {
        expect(
          this.container.querySelector('rect:nth-child(2)')
            .getAttribute('x')
        ).toEqual('40');
      });

      it('should have an offset of 60', function () {
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
});
