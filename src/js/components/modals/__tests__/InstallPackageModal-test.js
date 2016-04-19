jest.dontMock('../InstallPackageModal');
jest.dontMock('../../ReviewConfig');
jest.dontMock('../../../stores/CosmosPackagesStore');
jest.dontMock('../../../mixins/InternalStorageMixin');
jest.dontMock('../../../mixins/TabsMixin');

var _ = require('underscore');
var React = require('react');
var ReactDOM = require('react-dom');
var TestUtils = require('react-addons-test-utils');

var InstallPackageModal = require('../InstallPackageModal');
var JestUtil = require('../../../utils/JestUtil');
var JestUtil = require('../../../utils/JestUtil');
var packageDescribeFixture =
  require('../../../../../tests/_fixtures/cosmos/package-describe.json');
var RequestUtil = require('../../../utils/RequestUtil');
var UniversePackage = require('../../../structs/UniversePackage');

JestUtil.unMockStores(['CosmosPackagesStore']);
require('../../../utils/StoreMixinConfig');

describe('InstallPackageModal', function () {

  beforeEach(function () {
    this.requestFn = RequestUtil.json;
    RequestUtil.json = function (handlers) {
      handlers.success(packageDescribeFixture);
    };
    this.packageDescribeFixture = _.clone(packageDescribeFixture);

    this.container = document.createElement('div');
    this.instance = ReactDOM.render(
      <InstallPackageModal
        open={true}
        packageName="marathon"
        packageVersion="0.11.1"
        onClose={function () {}} />,
      this.container
    );
  });

  afterEach(function () {
    RequestUtil.json = this.requestFn;
    ReactDOM.unmountComponentAtNode(this.container);
  });

  describe('#getModalContents', function () {

    it('should display package to install', function () {
      var node = ReactDOM.findDOMNode(ReactDOM.render(
        this.instance.getModalContents(),
        this.container
      ));
      var result = node.querySelector('p.flush-bottom');
      expect(result.textContent).toEqual('marathon 0.11.1');
    });

    it('should display package appId', function () {
      var node = ReactDOM.findDOMNode(ReactDOM.render(
        this.instance.getModalContents(),
        this.container
      ));
      var result = node.querySelector('form .form-element-inline-text');
      expect(result.textContent).toEqual('marathon-user');
    });

    it('should find the default service ID', function () {
      var modifiedPackageDescribeFixture = _.clone(packageDescribeFixture);
      modifiedPackageDescribeFixture.config.properties.service = {
        properties: {name: {default: 'foo-bar'}}
      };
      RequestUtil.json = function (handlers) {
        handlers.success(modifiedPackageDescribeFixture);
      };

      this.container = document.createElement('div');
      this.instance = ReactDOM.render(
        <InstallPackageModal
          open={true}
          packageName="marathon"
          packageVersion="0.11.1"
          onClose={function () {}} />,
        this.container
      );
      var node = ReactDOM.findDOMNode(ReactDOM.render(
        this.instance.getModalContents(),
        this.container
      ));
      var result = node.querySelector('form .form-element-inline-text');
      expect(result.textContent).toEqual('foo-bar');
      delete modifiedPackageDescribeFixture.config.properties.service;
    });

    it('should display default package appId', function () {
      var modifiedPackageDescribeFixture = _.clone(packageDescribeFixture);
      modifiedPackageDescribeFixture.config.properties
        .marathon.properties['framework-name'].default = null;
      RequestUtil.json = function (handlers) {
        handlers.success(modifiedPackageDescribeFixture);
      };

      this.container = document.createElement('div');
      this.instance = ReactDOM.render(
        <InstallPackageModal
          open={true}
          packageName="marathon"
          packageVersion="0.11.1"
          onClose={function () {}} />,
        this.container
      );
      var node = ReactDOM.findDOMNode(ReactDOM.render(
        this.instance.getModalContents(),
        this.container
      ));
      var result = node.querySelector('form .form-element-inline-text');
      expect(result.textContent).toEqual('marathon');
    });

    it('should display loader', function () {
      RequestUtil.json = function () {
        // Do nothing
      };
      this.container = document.createElement('div');
      this.instance = ReactDOM.render(
        <InstallPackageModal
          open={true}
          packageName="marathon"
          packageVersion="0.11.1"
          onClose={function () {}} />,
        this.container
      );

      var node = ReactDOM.findDOMNode(ReactDOM.render(
        this.instance.getModalContents(),
        this.container
      ));
      var result = node.querySelector('.ball-scale');
      expect(TestUtils.isDOMComponent(result)).toEqual(true);
    });

    it('should display install error', function () {
      RequestUtil.json = function (handlers) {
        handlers.error({responseJSON: {type: 'PackageAlreadyInstalled'}});
      };
      // Fire install error
      this.instance.handleInstallPackage(
        new UniversePackage({package: {name: 'marathon', version: '0.11.1'}})
      );

      var node = ReactDOM.findDOMNode(ReactDOM.render(
        this.instance.getModalContents(),
        this.container
      ));
      var result = node.querySelector('h4.text-danger');
      expect(result.textContent).toEqual('Name Already Exists');
    });

    it('should display install success', function () {
      // Fire install success
      this.instance.handleInstallPackage(
        new UniversePackage({package: {name: 'marathon', version: '0.11.1'}})
      );

      var node = ReactDOM.findDOMNode(ReactDOM.render(
        this.instance.getModalContents(),
        this.container
      ));
      var result = node.querySelector('h2.flush-top.short-bottom');
      expect(result.textContent).toEqual('Success!');
    });

    it('shouldn\'t display install error after appId change', function () {
      RequestUtil.json = function (handlers) {
        handlers.error({responseJSON: {type: 'PackageAlreadyInstalled'}});
      };
      // Fire install error
      this.instance.handleInstallPackage(
        new UniversePackage({package: {name: 'marathon', version: '0.11.1'}})
      );
      // Change appId
      this.instance.handleChangeAppId({appId: 'marathon-user'});

      var node = ReactDOM.findDOMNode(ReactDOM.render(
        this.instance.getModalContents(),
        this.container
      ));
      var result = node.querySelector('h4.text-danger');
      expect(TestUtils.isDOMComponent(result)).toEqual(false);
    });

  });

});
