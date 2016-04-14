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
    it('should contain progress-bar (default)', function () {
      expect(
        this.container.querySelector('div')
          .classList.contains('progress-bar')
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
        this.container.querySelector('div')
          .classList.contains('test-bar')
      ).toBeTruthy();
    });
  });

  describe('rectangles', function () {
    it('should contain 2 divs', function () {
      expect(this.container.querySelectorAll('.progress-bar div').length)
        .toEqual(testData.length);
    });

    describe('First div', function () {
      it('should contain class name status', function () {
        expect(
          this.container.querySelector('.progress-bar div:first-child')
            .classList.contains('status')
        ).toBeTruthy();
      });

      it('should have the class element-{index} if no classname is provided',
        function () {
          this.instance = ReactDOM.render(
            <StatusBar data={[{
              value: 40
            }]}/>,
            this.container
          );
          expect(this.container.querySelector('.progress-bar div')
            .classList.contains('element-0')
          ).toBeTruthy();
        });

      it('should have a width of 40', function () {
        expect(
          this.container.querySelector('.progress-bar div:first-child')
            .style.width
        ).toEqual('40%');
      });
    });

    describe('Second div', function () {

      it('should contain class name failed', function () {
        expect(
          this.container.querySelector('.progress-bar div:nth-child(2)')
            .classList.contains('failed')
        ).toBeTruthy();
      });

      it('should have a width of 60', function () {
        expect(
          this.container.querySelector('.progress-bar div:nth-child(2)')
            .style.width
        ).toEqual('60%');
      });
    });
  });
});
