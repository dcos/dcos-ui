jest.dontMock('../CliInstallModal');
jest.dontMock('../../../utils/DOMUtils');
/* eslint-disable no-unused-vars */
var React = require('react');
/* eslint-enable no-unused-vars */
var ReactDOM = require('react-dom');

var JestUtil = require('../../../utils/JestUtil');

JestUtil.unMockStores(['MetadataStore']);

var CliInstallModal = require('../CliInstallModal');

// Set a new Getter. Navigator doesn't have a Setter.
function setUserAgent(agent) {
  window.navigator.__defineGetter__('userAgent', function () {
    return agent;
  });
}

describe('CliInstallModal', function () {

  describe('#onClose', function () {
    beforeEach(function () {
      this.callback = jasmine.createSpy();
      this.container = document.createElement('div');
      this.instance = ReactDOM.render(
        <CliInstallModal
          onClose={this.callback}
          showFooter={false}
          title=""
          subHeaderContent="" />,
        this.container
      );
    });

    afterEach(function () {
      ReactDOM.unmountComponentAtNode(this.container);
    });

    it('shouldn\'t call the callback after initialization', function () {
      expect(this.callback).not.toHaveBeenCalled();
    });

    it('should call the callback when #onClose is called', function () {
      this.instance.onClose();
      expect(this.callback).toHaveBeenCalled();
    });

  });

  describe('#getCliInstructions', function () {
    beforeEach(function () {
      this.container = document.createElement('div');
      this.instance = ReactDOM.render(
        <CliInstallModal
          onClose={function () {}}
          showFooter={false}
          title=""
          subHeaderContent="" />,
        this.container
      );
    });

    afterEach(function () {
      ReactDOM.unmountComponentAtNode(this.container);
    });

    it('it returns different data depending on OS', function () {

      setUserAgent('Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; Trident/6.0)');
      var firstCall = this.instance.getCliInstructions();

      setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.63 Safari/537.36');
      var secondCall = this.instance.getCliInstructions();

      expect(firstCall).not.toEqual(secondCall);
    });

  });

});
