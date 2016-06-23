jest.dontMock('../hooks');

/* eslint-disable no-unused-vars */
import React from 'react';
/* eslint-enable no-unused-vars */
var ReactDOM = require('react-dom');
var TestUtils = require('react-addons-test-utils');

import PluginTestUtils from 'PluginTestUtils';

PluginTestUtils.dontMock([
  'Icon',
  'DOMUtils'
]);

let SDK = PluginTestUtils.getSDK('banner', {enabled: true});
require('../SDK').setSDK(SDK);

var BannerPlugin = require('../hooks');
var defaultConfiguration = BannerPlugin.configuration;

describe('BannerPlugin', function () {

  beforeEach(function () {
    this.container = document.createElement('div');
    BannerPlugin.configuration = Object.assign({}, defaultConfiguration);
  });

  afterEach(function () {
    ReactDOM.unmountComponentAtNode(this.container);
  });

  describe('#initialize', function () {

    beforeEach(function () {
      this.Hooks = SDK.Hooks;

      SDK.Hooks = {
        addAction: jest.genMockFunction(),
        addFilter: jest.genMockFunction()
      };

      BannerPlugin.initialize();
    });

    afterEach(function () {
      SDK.Hooks = this.Hooks;
    });

    it('should add one action and two filters', function () {
      expect(SDK.Hooks.addAction.mock.calls[0][0])
        .toEqual('applicationRendered');
      expect(SDK.Hooks.addFilter.mock.calls[0][0])
        .toEqual('applicationContents');
      expect(SDK.Hooks.addFilter.mock.calls[1][0])
        .toEqual('overlayNewWindowButton');
    });
  });

  describe('#configure', function () {

    it('changes the plugin\'s configuration', function () {
      expect(BannerPlugin.isEnabled()).toBeFalsy();
      BannerPlugin.configure({headerTitle: 'foo'});
      expect(BannerPlugin.isEnabled()).toBeTruthy();
    });

  });

  describe('#isEnabled', function () {

    it('should return true if headerTitle is defined', function () {
      BannerPlugin.configure({headerTitle: 'foo'});

      expect(BannerPlugin.isEnabled()).toBeTruthy();
    });

    it('should return true if headerContent is defined', function () {
      BannerPlugin.configure({headerContent: 'bar'});

      expect(BannerPlugin.isEnabled()).toBeTruthy();
    });

    it('should return true if footerContent is defined', function () {
      BannerPlugin.configure({footerContent: 'foo'});

      expect(BannerPlugin.isEnabled()).toBeTruthy();
    });

    it('should return false if no content is defined', function () {
      // None of these are defined: headerTitle, headerContent or footerContent
      BannerPlugin.configure({foo: 'bar'});

      expect(BannerPlugin.isEnabled()).toBeFalsy();
    });

    it('should return false if fields are initialized to null', function () {
      BannerPlugin.configure({
        headerTitle: null,
        headerContent: null,
        footerContent: null
      });

      expect(BannerPlugin.isEnabled()).toBeFalsy();
    });

    it('should return true with mixed intialization', function () {
      BannerPlugin.configure({
        headerTitle: null,
        headerContent: undefined,
        footerContent: 'foo',
        imagePath: false
      });

      expect(BannerPlugin.isEnabled()).toBeTruthy();
    });

  });

  describe('#toggleFullContent', function () {

    beforeEach(function () {
      BannerPlugin.configure({headerTitle: 'foo'});
      spyOn(BannerPlugin, 'toggleFullContent');
      this.instance = ReactDOM.render(
        BannerPlugin.applicationContents(),
        this.container
      );
    });

    it('should not call before click', function () {
      expect(BannerPlugin.toggleFullContent).not.toHaveBeenCalled();
    });

    it('should call once with one click', function () {
      var node = ReactDOM.findDOMNode(this.instance);
      var el = node.querySelector('.banner-plugin-info-icon');

      TestUtils.Simulate.click(el);
      expect(BannerPlugin.toggleFullContent.calls.count()).toEqual(1);
    });

    it('should call n times with n clicks', function () {
      var node = ReactDOM.findDOMNode(this.instance);
      var el = node.querySelector('.banner-plugin-info-icon');

      TestUtils.Simulate.click(el);
      TestUtils.Simulate.click(el);
      TestUtils.Simulate.click(el);
      TestUtils.Simulate.click(el);
      expect(BannerPlugin.toggleFullContent.calls.count()).toEqual(4);
    });

  });

  describe('#applicationRendered', function () {
    beforeEach(function () {
      this.mockFn = jasmine.createSpy('ContentWindow Spy');
      this.iframe = document.createElement('iframe');
      var mockFn = this.mockFn;
      this.iframe.__defineGetter__('contentWindow', function () {
        return {addEventListener: mockFn};
      });
      document.getElementById = jasmine.createSpy('HTML Element')
        .and.returnValue(this.iframe);

    });

    it('should add event listener to iframe when enabled', function () {
      BannerPlugin.configure({headerTitle: 'foo'});
      BannerPlugin.applicationRendered();
      expect(this.iframe.contentWindow.addEventListener).toHaveBeenCalled();
    });

    it('should not add event listener to iframe when not enabled', function () {
      BannerPlugin.applicationRendered();
      expect(this.iframe.contentWindow.addEventListener).not.toHaveBeenCalled();
    });
  });

  describe('#applicationContents', function () {

    it('should return content when enabled', function () {
      BannerPlugin.configure({headerTitle: 'foo'});
      expect(TestUtils.isElement(BannerPlugin.applicationContents()))
        .toBeTruthy();
    });

    it('should return null when not enabled', function () {
      expect(TestUtils.isElement(BannerPlugin.applicationContents()))
        .toBeFalsy();
    });

    it('should render an iframe when enabled', function () {
      BannerPlugin.configure({headerTitle: 'foo'});

      var instance = ReactDOM.render(
        BannerPlugin.applicationContents(),
        this.container
      );

      var node = ReactDOM.findDOMNode(instance);
      var iframe = node.querySelector('iframe');

      expect(TestUtils.isDOMComponent(iframe)).toBeTruthy();
    });

  });

  describe('#overlayNewWindowButton', function () {

    it('should return content when enabled', function () {
      BannerPlugin.configure({headerTitle: 'foo'});
      expect(BannerPlugin.overlayNewWindowButton('foo')).toBeNull();
    });

    it('should return null when not enabled', function () {
      expect(BannerPlugin.overlayNewWindowButton('foo')).toEqual('foo');
    });
  });

  describe('#getColorStyles', function () {

    it('should return default colors when nothing is changed', function () {
      expect(BannerPlugin.getColorStyles()).toEqual({
        backgroundColor: '#1E232F',
        color: '#FFFFFF'
      });
    });

    it('should return an object with provided colors', function () {
      BannerPlugin.configure({
        backgroundColor: 'foo',
        foregroundColor: 'bar'
      });

      expect(BannerPlugin.getColorStyles()).toEqual({
        backgroundColor: 'foo',
        color: 'bar'
      });
    });
  });

  describe('#getIcon', function () {

    it('should return null if imagePath is null', function () {
      BannerPlugin.configure({
        imagePath: null
      });

      expect(BannerPlugin.getIcon()).toBeNull();
    });

    it('should return null if imagePath is empty string', function () {
      BannerPlugin.configure({
        imagePath: ''
      });

      expect(BannerPlugin.getIcon()).toBeNull();
    });

    it('should return an element if imagePath is set', function () {
      BannerPlugin.configure({
        imagePath: 'foo'
      });

      expect(TestUtils.isElement(BannerPlugin.getIcon())).toBeTruthy();
    });
  });

  describe('#getTitle', function () {

    it('should return null if headerTitle is null', function () {
      BannerPlugin.configure({
        headerTitle: null
      });

      expect(BannerPlugin.getTitle()).toBeNull();
    });

    it('should return null if headerTitle is empty string', function () {
      BannerPlugin.configure({
        headerTitle: ''
      });

      expect(BannerPlugin.getTitle()).toBeNull();
    });

    it('should return an element if headerTitle is set', function () {
      BannerPlugin.configure({
        headerTitle: 'foo'
      });

      expect(TestUtils.isElement(BannerPlugin.getTitle())).toBeTruthy();
    });
  });

  describe('#getHeaderContent', function () {

    it('should return null if headerContent is null', function () {
      BannerPlugin.configure({
        headerContent: null
      });

      expect(BannerPlugin.getHeaderContent()).toBeNull();
    });

    it('should return null if headerContent is empty string', function () {
      BannerPlugin.configure({
        headerContent: ''
      });

      expect(BannerPlugin.getHeaderContent()).toBeNull();
    });

    it('should return an element if headerContent is set', function () {
      BannerPlugin.configure({
        headerContent: 'foo'
      });

      expect(TestUtils.isElement(BannerPlugin.getHeaderContent()))
        .toBeTruthy();
    });
  });

  describe('#getHeader', function () {

    beforeEach(function () {
      BannerPlugin.getIcon = function () { return null; };
      BannerPlugin.getTitle = function () { return null; };
      BannerPlugin.getHeaderContent = function () { return null; };
    });

    it('should return null if depending functions returns null', function () {
      expect(BannerPlugin.getHeader()).toBeNull();
    });

    it('should return an element if getIcon return something', function () {
      BannerPlugin.getIcon = function () { return 'foo'; };

      expect(TestUtils.isElement(BannerPlugin.getHeader()))
        .toBeTruthy();
    });

    it('should return an element if getTitle return something', function () {
      BannerPlugin.getTitle = function () { return 'foo'; };

      expect(TestUtils.isElement(BannerPlugin.getHeader()))
        .toBeTruthy();
    });

    it('should return element when getHeaderContent does', function () {
      BannerPlugin.getHeaderContent = function () { return 'foo'; };

      expect(TestUtils.isElement(BannerPlugin.getHeader()))
        .toBeTruthy();
    });
  });

  describe('#getFooter', function () {

    it('should return null if footerContent is null', function () {
      BannerPlugin.configure({
        footerContent: null
      });

      expect(BannerPlugin.getFooter()).toBeNull();
    });

    it('should return null if footerContent is empty string', function () {
      BannerPlugin.configure({
        footerContent: ''
      });

      expect(BannerPlugin.getFooter()).toBeNull();
    });

    it('should return an element if footerContent is set', function () {
      BannerPlugin.configure({
        footerContent: 'foo'
      });

      expect(TestUtils.isElement(BannerPlugin.getFooter()))
        .toBeTruthy();
    });
  });

});
