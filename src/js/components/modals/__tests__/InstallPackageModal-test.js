jest.dontMock('../InstallPackageModal');
jest.dontMock('../../CosmosErrorMessage');
jest.dontMock('../../ReviewConfig');
jest.dontMock('../../SchemaForm');
jest.dontMock('../../../stores/CosmosPackagesStore');
jest.dontMock('../../../mixins/InternalStorageMixin');
jest.dontMock('../../../mixins/TabsMixin');
jest.dontMock('../../../utils/FormUtil');
jest.dontMock('../../../utils/GeminiUtil');
jest.dontMock('../../../utils/SchemaFormUtil');
jest.dontMock('../../../utils/SchemaUtil');
jest.dontMock('../../TabForm');
jest.dontMock('../../../utils/Util');

/* eslint-disable no-unused-vars */
var React = require('react');
/* eslint-enable no-unused-vars */
var ReactDOM = require('react-dom');
import {RequestUtil} from 'mesosphere-shared-reactjs';
var TestUtils = require('react-addons-test-utils');

var InstallPackageModal = require('../InstallPackageModal');
var JestUtil = require('../../../utils/JestUtil');
var JestUtil = require('../../../utils/JestUtil');
var packageDescribeFixture =
  require('../../../../../tests/_fixtures/cosmos/package-describe.json');
var UniversePackage = require('../../../structs/UniversePackage');

JestUtil.unMockStores(['CosmosPackagesStore']);
require('../../../utils/StoreMixinConfig');

describe('InstallPackageModal', function () {

  beforeEach(function () {
    this.requestFn = RequestUtil.json;
    RequestUtil.json = function (handlers) {
      handlers.success(packageDescribeFixture);
    };
    this.packageDescribeFixture = Object.assign({}, packageDescribeFixture);

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

    it('should display package name to install', function () {
      var node = ReactDOM.findDOMNode(ReactDOM.render(
        this.instance.getModalContents(),
        this.container
      ));
      var name = node.querySelector('.h2');
      expect(name.textContent).toEqual('marathon');
    });

    it('should display version to install', function () {
      var node = ReactDOM.findDOMNode(ReactDOM.render(
        this.instance.getModalContents(),
        this.container
      ));
      var result = node.querySelectorAll('p')[4];
      expect(result.textContent).toEqual('0.11.1');
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

      var result = node.querySelector('.h3.text-align-center.flush-top');
      expect(result.textContent).toEqual('An Error Occured');
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
      var result = node.querySelector('h2.short-top.short-bottom');
      expect(result.textContent).toEqual('Success!');
    });

  });

});
