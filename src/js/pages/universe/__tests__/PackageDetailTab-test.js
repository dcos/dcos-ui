jest.dontMock('../PackageDetailTab');
jest.dontMock('../../../components/Panel');
jest.dontMock('../../../mixins/InternalStorageMixin');
jest.dontMock('../../../components/modals/InstallPackageModal');
jest.dontMock('../../../stores/CosmosPackagesStore');
jest.dontMock('../../../../../tests/_fixtures/cosmos/package-describe.json');

var JestUtil = require('../../../utils/JestUtil');

JestUtil.unMockStores(['CosmosPackagesStore']);

// Setting useFixtures for when we load StoreMixinConfig
var Config = require('../../../config/Config');
var configUseFixtures = Config.useFixtures;
Config.useFixtures = true;
require('../../../utils/StoreMixinConfig');
Config.useFixtures = configUseFixtures;
/* eslint-disable no-unused-vars */
var React = require('react');
/* eslint-enable no-unused-vars */
var ReactDOM = require('react-dom');
var TestUtils = require('react-addons-test-utils');

var PackageDetailTab = require('../PackageDetailTab');

describe('PackageDetailTab', function () {

  beforeEach(function () {
    this.container = document.createElement('div');
    this.instance = ReactDOM.render(
      <PackageDetailTab params={{packageName: 'marathon'}} />,
      this.container
    );
  });

  afterEach(function () {
    ReactDOM.unmountComponentAtNode(this.container);
  });

  describe('#handleInstallModalOpen', function () {

    beforeEach(function () {
      this.instance.handleInstallModalOpen =
        jasmine.createSpy('handleInstallModalOpen');
      jest.runAllTimers();
    });

    it('should call handler when install button is clicked', function () {
      var installButton = ReactDOM.findDOMNode(this.instance)
        .querySelector('.button.button-success');
      TestUtils.Simulate.click(installButton);

      expect(this.instance.handleInstallModalOpen).toHaveBeenCalled();
    });

  });

  describe('#getItems', function () {

    describe('#getItem', function () {

      it('returns empty array with null values provided', function () {
        expect(
          this.instance.getItems([
            {label: 'foo', value: null},
            {label: 'bar', value: null}
          ]),
          this.instance.getItem).toEqual([]);
      });

      it('returns only entries with defined values', function () {
        expect(
          this.instance.getItems([
            {label: 'foo', value: 'baz'},
            {label: 'bar', value: null}
          ], this.instance.getItem).length
        ).toEqual(1);
      });

      it('should render entries with keys and values', function () {
        var subItem = ReactDOM.render(
          this.instance.getItems([
            {label: 'foo', value: 'baz'},
            {label: 'bar', value: null}
          ],
          this.instance.getItem)[0],
          this.container
        );

        expect(subItem.textContent).toEqual('foobaz');
      });

    });

    describe('#getSubItem', function () {

      it('returns empty array with only null values provided', function () {
        expect(
          this.instance.getItems([
              {label: 'foo', value: null},
              {label: 'bar', value: null}
          ]),
          this.instance.getSubItem
        ).toEqual([]);
      });

      it('returns only entries with defined values', function () {
        expect(
          this.instance.getItems([
            {label: 'foo', value: 'baz'},
            {label: 'bar', value: null}
          ],
          this.instance.getSubItem).length
        ).toEqual(1);
      });

      it('should render entries with keys and values', function () {
        var subItem = ReactDOM.render(
          this.instance.getItems([
            {label: 'foo', value: 'baz'},
            {label: 'bar', value: null}
          ],
          this.instance.getSubItem)[0],
          this.container
        );

        expect(subItem.textContent).toEqual('foo: baz');
      });

    });

  });

  describe('#getSubItem', function () {

    it('should render link if url is defined', function () {
      var link = ReactDOM.render(
        this.instance.getSubItem('url', 'http://foo'),
        this.container
      );

      expect(link.textContent).toEqual('url: http://foo');
      expect(link.querySelector('a').href).toEqual('http://foo/');
      expect(link.querySelector('a').tagName).toEqual('A');
    });

    it('should render link with prefix if defined', function () {
      var link = ReactDOM.render(
        this.instance.getSubItem('email', 'foo@bar.com'),
        this.container
      );

      expect(link.textContent).toEqual('email: foo@bar.com');
      expect(link.querySelector('a').href).toEqual('mailto:foo@bar.com');
      expect(link.querySelector('a').tagName).toEqual('A');
    });

  });

  describe('#mapLicenses', function () {

    it('returns array for empty array', function () {
      expect(this.instance.mapLicenses([])).toEqual([]);
    });

    it('returns all entries of array', function () {
      var licenses = this.instance.mapLicenses([
        {name: 'foo', url: 'bar'},
        {name: 'baz', url: 'qux'},
        {name: 'quux', url: 'corge'}
      ]);

      expect(licenses.length).toEqual(3);
    });

    it('returns all entries even with undefined values', function () {
      var licenses = this.instance.mapLicenses([
        {name: 'foo', url: 'bar'},
        {name: 'baz', url: null},
        {name: 'quux', url: 'corge'}
      ]);

      expect(licenses.length).toEqual(3);
    });

  });

  describe('#render', function () {

    it('should call getErrorScreen when error occured', function () {
      this.instance.state.hasError = true;
      this.instance.getErrorScreen = jasmine.createSpy('getErrorScreen');

      this.instance.render();
      expect(this.instance.getErrorScreen).toHaveBeenCalled();
    });

    it('ignores getErrorScreen when error has not occured', function () {
      this.instance.state.hasError = false;
      this.instance.getErrorScreen = jasmine.createSpy('getErrorScreen');

      this.instance.render();
      expect(this.instance.getErrorScreen).not.toHaveBeenCalled();
    });

    it('should call getLoadingScreen when loading', function () {
      this.instance.state.isLoading = true;
      this.instance.getLoadingScreen = jasmine.createSpy('getLoadingScreen');

      this.instance.render();
      expect(this.instance.getLoadingScreen).toHaveBeenCalled();
    });

    it('ignores getLoadingScreen when not loading', function () {
      this.instance.state.isLoading = false;
      this.instance.getLoadingScreen = jasmine.createSpy('getLoadingScreen');

      this.instance.render();
      expect(this.instance.getLoadingScreen).not.toHaveBeenCalled();
    });

    it('ignores getLoadingScreen when error has occured', function () {
      this.instance.state.hasError = true;
      this.instance.state.isLoading = true;
      this.instance.getLoadingScreen = jasmine.createSpy('getLoadingScreen');

      this.instance.render();
      expect(this.instance.getLoadingScreen).not.toHaveBeenCalled();
    });

  });

});
