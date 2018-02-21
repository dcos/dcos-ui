/* eslint-disable no-unused-vars */
const React = require("react");
/* eslint-enable no-unused-vars */
const ReactDOM = require("react-dom");
const TestUtils = require("react-addons-test-utils");
const PluginTestUtils = require("PluginTestUtils");

const SDK = PluginTestUtils.getSDK("banner", { enabled: true });
require("../SDK").setSDK(SDK);

const BannerPlugin = require("../hooks");

var defaultConfiguration = BannerPlugin.configuration;

let thisContainer, thisHooks, thisInstance, thisMockFn, thisIframe;

describe("BannerPlugin", function() {
  beforeEach(function() {
    thisContainer = global.document.createElement("div");
    BannerPlugin.configuration = Object.assign({}, defaultConfiguration);
  });

  afterEach(function() {
    ReactDOM.unmountComponentAtNode(thisContainer);
  });

  describe("#initialize", function() {
    beforeEach(function() {
      thisHooks = SDK.Hooks;

      SDK.Hooks = {
        addAction: jest.genMockFunction(),
        addFilter: jest.genMockFunction()
      };

      BannerPlugin.initialize();
    });

    afterEach(function() {
      SDK.Hooks = thisHooks;
    });

    it("adds one action and two filters", function() {
      expect(SDK.Hooks.addAction.mock.calls[0][0]).toEqual(
        "applicationRendered"
      );
      expect(SDK.Hooks.addFilter.mock.calls[0][0]).toEqual(
        "applicationContents"
      );
      expect(SDK.Hooks.addFilter.mock.calls[1][0]).toEqual(
        "overlayNewWindowButton"
      );
    });
  });

  describe("#configure", function() {
    it("changes the plugin's configuration", function() {
      expect(BannerPlugin.isEnabled()).toBeFalsy();
      BannerPlugin.configure({ headerTitle: "foo" });
      expect(BannerPlugin.isEnabled()).toBeTruthy();
    });
  });

  describe("#isEnabled", function() {
    it("returns true if headerTitle is defined", function() {
      BannerPlugin.configure({ headerTitle: "foo" });

      expect(BannerPlugin.isEnabled()).toBeTruthy();
    });

    it("returns true if headerContent is defined", function() {
      BannerPlugin.configure({ headerContent: "bar" });

      expect(BannerPlugin.isEnabled()).toBeTruthy();
    });

    it("returns true if footerContent is defined", function() {
      BannerPlugin.configure({ footerContent: "foo" });

      expect(BannerPlugin.isEnabled()).toBeTruthy();
    });

    it("returns false if no content is defined", function() {
      // None of these are defined: headerTitle, headerContent or footerContent
      BannerPlugin.configure({ foo: "bar" });

      expect(BannerPlugin.isEnabled()).toBeFalsy();
    });

    it("returns false if fields are initialized to null", function() {
      BannerPlugin.configure({
        headerTitle: null,
        headerContent: null,
        footerContent: null
      });

      expect(BannerPlugin.isEnabled()).toBeFalsy();
    });

    it("returns true with mixed initialization", function() {
      BannerPlugin.configure({
        headerTitle: null,
        headerContent: undefined,
        footerContent: "foo",
        imagePath: false
      });

      expect(BannerPlugin.isEnabled()).toBeTruthy();
    });
  });

  describe("#toggleFullContent", function() {
    beforeEach(function() {
      BannerPlugin.configure({ headerTitle: "foo" });
      spyOn(BannerPlugin, "toggleFullContent");
      thisInstance = ReactDOM.render(
        BannerPlugin.applicationContents(),
        thisContainer
      );
    });

    it("does not call before click", function() {
      expect(BannerPlugin.toggleFullContent).not.toHaveBeenCalled();
    });

    it("calls once with one click", function() {
      var node = ReactDOM.findDOMNode(thisInstance);
      var el = node.querySelector(".banner-plugin-info-icon");

      TestUtils.Simulate.click(el);
      expect(BannerPlugin.toggleFullContent.calls.count()).toEqual(1);
    });

    it("calls n times with n clicks", function() {
      var node = ReactDOM.findDOMNode(thisInstance);
      var el = node.querySelector(".banner-plugin-info-icon");

      TestUtils.Simulate.click(el);
      TestUtils.Simulate.click(el);
      TestUtils.Simulate.click(el);
      TestUtils.Simulate.click(el);
      expect(BannerPlugin.toggleFullContent.calls.count()).toEqual(4);
    });
  });

  describe("#applicationRendered", function() {
    beforeEach(function() {
      thisMockFn = jasmine.createSpy("ContentWindow Spy");
      thisIframe = global.document.createElement("iframe");
      var mockFn = thisMockFn;
      thisIframe.__defineGetter__("contentWindow", function() {
        return { addEventListener: mockFn };
      });
      global.document.getElementById = jasmine
        .createSpy("HTML Element")
        .and.returnValue(thisIframe);
    });

    it("adds event listener to iframe when enabled", function() {
      BannerPlugin.configure({ headerTitle: "foo" });
      BannerPlugin.applicationRendered();
      expect(thisIframe.contentWindow.addEventListener).toHaveBeenCalled();
    });

    it("does not add event listener to iframe when not enabled", function() {
      BannerPlugin.applicationRendered();
      expect(thisIframe.contentWindow.addEventListener).not.toHaveBeenCalled();
    });
  });

  describe("#applicationContents", function() {
    it("returns content when enabled", function() {
      BannerPlugin.configure({ headerTitle: "foo" });
      expect(
        TestUtils.isElement(BannerPlugin.applicationContents())
      ).toBeTruthy();
    });

    it("returns null when not enabled", function() {
      expect(
        TestUtils.isElement(BannerPlugin.applicationContents())
      ).toBeFalsy();
    });

    it("renders an iframe when enabled", function() {
      BannerPlugin.configure({ headerTitle: "foo" });

      var instance = ReactDOM.render(
        BannerPlugin.applicationContents(),
        thisContainer
      );

      var node = ReactDOM.findDOMNode(instance);
      var iframe = node.querySelector("iframe");

      expect(TestUtils.isDOMComponent(iframe)).toBeTruthy();
    });
  });

  describe("#overlayNewWindowButton", function() {
    it("returns content when enabled", function() {
      BannerPlugin.configure({ headerTitle: "foo" });
      expect(BannerPlugin.overlayNewWindowButton("foo")).toBeNull();
    });

    it("returns null when not enabled", function() {
      expect(BannerPlugin.overlayNewWindowButton("foo")).toEqual("foo");
    });
  });

  describe("#getColorStyles", function() {
    it("returns default colors when nothing is changed", function() {
      expect(BannerPlugin.getColorStyles()).toEqual({
        backgroundColor: "#1E232F",
        color: "#FFFFFF"
      });
    });

    it("returns an object with provided colors", function() {
      BannerPlugin.configure({
        backgroundColor: "foo",
        foregroundColor: "bar"
      });

      expect(BannerPlugin.getColorStyles()).toEqual({
        backgroundColor: "foo",
        color: "bar"
      });
    });
  });

  describe("#getIcon", function() {
    it("returns null if imagePath is null", function() {
      BannerPlugin.configure({
        imagePath: null
      });

      expect(BannerPlugin.getIcon()).toBeNull();
    });

    it("returns null if imagePath is empty string", function() {
      BannerPlugin.configure({
        imagePath: ""
      });

      expect(BannerPlugin.getIcon()).toBeNull();
    });

    it("returns an element if imagePath is set", function() {
      BannerPlugin.configure({
        imagePath: "foo"
      });

      expect(TestUtils.isElement(BannerPlugin.getIcon())).toBeTruthy();
    });
  });

  describe("#getTitle", function() {
    it("returns null if headerTitle is null", function() {
      BannerPlugin.configure({
        headerTitle: null
      });

      expect(BannerPlugin.getTitle()).toBeNull();
    });

    it("returns null if headerTitle is empty string", function() {
      BannerPlugin.configure({
        headerTitle: ""
      });

      expect(BannerPlugin.getTitle()).toBeNull();
    });

    it("returns an element if headerTitle is set", function() {
      BannerPlugin.configure({
        headerTitle: "foo"
      });

      expect(TestUtils.isElement(BannerPlugin.getTitle())).toBeTruthy();
    });
  });

  describe("#getHeaderContent", function() {
    it("returns null if headerContent is null", function() {
      BannerPlugin.configure({
        headerContent: null
      });

      expect(BannerPlugin.getHeaderContent()).toBeNull();
    });

    it("returns null if headerContent is empty string", function() {
      BannerPlugin.configure({
        headerContent: ""
      });

      expect(BannerPlugin.getHeaderContent()).toBeNull();
    });

    it("returns an element if headerContent is set", function() {
      BannerPlugin.configure({
        headerContent: "foo"
      });

      expect(TestUtils.isElement(BannerPlugin.getHeaderContent())).toBeTruthy();
    });
  });

  describe("#getHeader", function() {
    beforeEach(function() {
      BannerPlugin.getIcon = function() {
        return null;
      };
      BannerPlugin.getTitle = function() {
        return null;
      };
      BannerPlugin.getHeaderContent = function() {
        return null;
      };
    });

    it("returns null if depending functions returns null", function() {
      expect(BannerPlugin.getHeader()).toBeNull();
    });

    it("returns an element if getIcon return something", function() {
      BannerPlugin.getIcon = function() {
        return "foo";
      };

      expect(TestUtils.isElement(BannerPlugin.getHeader())).toBeTruthy();
    });

    it("returns an element if getTitle return something", function() {
      BannerPlugin.getTitle = function() {
        return "foo";
      };

      expect(TestUtils.isElement(BannerPlugin.getHeader())).toBeTruthy();
    });

    it("returns element when getHeaderContent does", function() {
      BannerPlugin.getHeaderContent = function() {
        return "foo";
      };

      expect(TestUtils.isElement(BannerPlugin.getHeader())).toBeTruthy();
    });
  });

  describe("#getFooter", function() {
    it("returns null if footerContent is null", function() {
      BannerPlugin.configure({
        footerContent: null
      });

      expect(BannerPlugin.getFooter()).toBeNull();
    });

    it("returns null if footerContent is empty string", function() {
      BannerPlugin.configure({
        footerContent: ""
      });

      expect(BannerPlugin.getFooter()).toBeNull();
    });

    it("returns an element if footerContent is set", function() {
      BannerPlugin.configure({
        footerContent: "foo"
      });

      expect(TestUtils.isElement(BannerPlugin.getFooter())).toBeTruthy();
    });
  });
});
