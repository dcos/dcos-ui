jest.dontMock('../ServiceOptions');

/* eslint-disable no-unused-vars */
var React = require('react');
/* eslint-enable no-unused-vars */
var ReactDOM = require('react-dom');
var TestUtils = require('react-addons-test-utils');

var Framework = require('../../structs/Framework');
var Service = require('../../structs/Service');
var ServiceOptions = require('../ServiceOptions');

describe('ServiceOptions', function () {

  beforeEach(function () {
    this.container = document.createElement('div');
  });

  afterEach(function () {
    ReactDOM.unmountComponentAtNode(this.container);
  });

  describe('#getServiceButtons', function () {

    it('renders the "Edit" button', function () {
      var foundEditButton = false;
      var service = new Service({});

      this.instance = ReactDOM.render(<ServiceOptions service={service} />,
        this.container);

      var buttons = TestUtils.scryRenderedDOMComponentsWithClass(this.instance,
        'button');
      buttons.forEach(function (button) {
        if (button.textContent === 'Edit') {
          foundEditButton = true;
        }
      });

      expect(foundEditButton).toBeTruthy();
    });

    it('does not render the "Open Service" button when there is no web URL',
      function () {
        var service = new Service({});

        this.instance = ReactDOM.render(<ServiceOptions service={service} />,
          this.container);

        var buttons = TestUtils.scryRenderedDOMComponentsWithClass(this.instance,
          'button');
        buttons.forEach(function (button) {
          expect(button.textContent).not.toEqual('Open Service')
        });
      }
    );

    it('renders the "Open Service" button when there is a web URL',
      function () {
        var foundServiceButton = false;
        var service = new Framework({webui_url: 'foo'});

        this.instance = ReactDOM.render(<ServiceOptions service={service} />,
          this.container);

        var buttons = TestUtils.scryRenderedDOMComponentsWithClass(this.instance,
          'button');
        buttons.forEach(function (button) {
          if (button.textContent === 'Open Service') {
            foundServiceButton = true;
          }
        });

        expect(foundServiceButton).toBeTruthy();
      }
    );

  });

});
