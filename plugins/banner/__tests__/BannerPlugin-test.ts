import { shallow } from "enzyme";

import PluginTestUtils from "PluginTestUtils";

const SDK = PluginTestUtils.getSDK("banner", { enabled: true });
require("../SDK").default.setSDK(SDK);

const BannerPlugin = require("../hooks").default;

const defaultConfiguration = BannerPlugin.configuration;

let thisHooks, thisInstance, thisMockFn, thisIframe;
describe("BannerPlugin", () => {
  beforeEach(() => {
    BannerPlugin.configuration = {
      ...defaultConfiguration
    };
  });

  describe("#initialize", () => {
    beforeEach(() => {
      thisHooks = SDK.Hooks;

      SDK.Hooks = {
        addAction: jest.genMockFunction(),
        addFilter: jest.genMockFunction()
      };

      BannerPlugin.initialize();
    });

    afterEach(() => {
      SDK.Hooks = thisHooks;
    });

    it("adds one action and two filters", () => {
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

  describe("#configure", () => {
    it("changes the plugin's configuration", () => {
      expect(BannerPlugin.isEnabled()).toBeFalsy();
      BannerPlugin.configure({ headerTitle: "foo" });
      expect(BannerPlugin.isEnabled()).toBeTruthy();
    });
  });

  describe("#isEnabled", () => {
    it("returns true if headerTitle is defined", () => {
      BannerPlugin.configure({ headerTitle: "foo" });

      expect(BannerPlugin.isEnabled()).toBeTruthy();
    });

    it("returns true if headerContent is defined", () => {
      BannerPlugin.configure({ headerContent: "bar" });

      expect(BannerPlugin.isEnabled()).toBeTruthy();
    });

    it("returns true if footerContent is defined", () => {
      BannerPlugin.configure({ footerContent: "foo" });

      expect(BannerPlugin.isEnabled()).toBeTruthy();
    });

    it("returns false if no content is defined", () => {
      // None of these are defined: headerTitle, headerContent or footerContent
      BannerPlugin.configure({ foo: "bar" });

      expect(BannerPlugin.isEnabled()).toBeFalsy();
    });

    it("returns false if fields are initialized to null", () => {
      BannerPlugin.configure({
        headerTitle: null,
        headerContent: null,
        footerContent: null
      });

      expect(BannerPlugin.isEnabled()).toBeFalsy();
    });

    it("returns true with mixed initialization", () => {
      BannerPlugin.configure({
        headerTitle: null,
        headerContent: undefined,
        footerContent: "foo",
        imagePath: false
      });

      expect(BannerPlugin.isEnabled()).toBeTruthy();
    });
  });

  describe("#toggleFullContent", () => {
    beforeEach(() => {
      BannerPlugin.configure({ headerTitle: "foo" });
      spyOn(BannerPlugin, "toggleFullContent");
      thisInstance = shallow(BannerPlugin.applicationContents());
    });

    it("does not call before click", () => {
      expect(BannerPlugin.toggleFullContent).not.toHaveBeenCalled();
    });

    it("calls once with one click", () => {
      thisInstance.find(".banner-plugin-info-icon").simulate("click");
      expect(BannerPlugin.toggleFullContent.calls.count()).toEqual(1);
    });

    it("calls n times with n clicks", () => {
      const button = thisInstance.find(".banner-plugin-info-icon");
      button.simulate("click");
      button.simulate("click");
      button.simulate("click");
      button.simulate("click");

      expect(BannerPlugin.toggleFullContent.calls.count()).toEqual(4);
    });
  });

  describe("#applicationRendered", () => {
    beforeEach(() => {
      thisMockFn = jasmine.createSpy("ContentWindow Spy");
      thisIframe = global.document.createElement("iframe");
      const mockFn = thisMockFn;
      thisIframe.__defineGetter__("contentWindow", () => ({
        addEventListener: mockFn
      }));
      global.document.getElementById = jasmine
        .createSpy("HTML Element")
        .and.returnValue(thisIframe);
    });

    it("adds event listener to iframe when enabled", () => {
      BannerPlugin.configure({ headerTitle: "foo" });
      BannerPlugin.applicationRendered();
      expect(thisIframe.contentWindow.addEventListener).toHaveBeenCalled();
    });

    it("does not add event listener to iframe when not enabled", () => {
      BannerPlugin.applicationRendered();
      expect(thisIframe.contentWindow.addEventListener).not.toHaveBeenCalled();
    });
  });

  describe("#applicationContents", () => {
    it("returns content when enabled", () => {
      BannerPlugin.configure({ headerTitle: "foo" });
      const Element = BannerPlugin.applicationContents();
      expect(Element).not.toBe(null);
    });

    it("returns null when not enabled", () => {
      const Element = BannerPlugin.applicationContents();
      expect(Element).toBe(null);
    });

    it("renders an iframe when enabled", () => {
      BannerPlugin.configure({ headerTitle: "foo" });

      const dom = shallow(BannerPlugin.applicationContents());
      expect(dom.find("iframe").exists()).toBeTruthy();
    });
  });

  describe("#overlayNewWindowButton", () => {
    it("returns content when enabled", () => {
      BannerPlugin.configure({ headerTitle: "foo" });
      expect(BannerPlugin.overlayNewWindowButton("foo")).toBeNull();
    });

    it("returns null when not enabled", () => {
      expect(BannerPlugin.overlayNewWindowButton("foo")).toEqual("foo");
    });
  });

  describe("#getColorStyles", () => {
    it("returns default colors when nothing is changed", () => {
      expect(BannerPlugin.getColorStyles()).toEqual({
        backgroundColor: "#1E232F",
        color: "#FFFFFF"
      });
    });

    it("returns an object with provided colors", () => {
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

  describe("#getIcon", () => {
    it("returns null if imagePath is null", () => {
      BannerPlugin.configure({
        imagePath: null
      });

      expect(BannerPlugin.getIcon()).toBeNull();
    });

    it("returns null if imagePath is empty string", () => {
      BannerPlugin.configure({
        imagePath: ""
      });

      expect(BannerPlugin.getIcon()).toBeNull();
    });

    it("returns an element if imagePath is set", () => {
      BannerPlugin.configure({
        imagePath: "foo"
      });

      expect(BannerPlugin.getIcon()).not.toBe(null);
    });
  });

  describe("#getTitle", () => {
    it("returns null if headerTitle is null", () => {
      BannerPlugin.configure({
        headerTitle: null
      });

      expect(BannerPlugin.getTitle()).toBeNull();
    });

    it("returns null if headerTitle is empty string", () => {
      BannerPlugin.configure({
        headerTitle: ""
      });

      expect(BannerPlugin.getTitle()).toBeNull();
    });

    it("returns an element if headerTitle is set", () => {
      BannerPlugin.configure({
        headerTitle: "foo"
      });

      expect(BannerPlugin.getTitle()).not.toBe(null);
    });
  });

  describe("#getHeaderContent", () => {
    it("returns null if headerContent is null", () => {
      BannerPlugin.configure({
        headerContent: null
      });

      expect(BannerPlugin.getHeaderContent()).toBeNull();
    });

    it("returns null if headerContent is empty string", () => {
      BannerPlugin.configure({
        headerContent: ""
      });

      expect(BannerPlugin.getHeaderContent()).toBeNull();
    });

    it("returns an element if headerContent is set", () => {
      BannerPlugin.configure({
        headerContent: "foo"
      });

      expect(BannerPlugin.getHeaderContent()).not.toBe(null);
    });
  });

  describe("#getHeader", () => {
    beforeEach(() => {
      BannerPlugin.getIcon = () => null;
      BannerPlugin.getTitle = () => null;
      BannerPlugin.getHeaderContent = () => null;
    });

    it("returns null if depending functions returns null", () => {
      expect(BannerPlugin.getHeader()).toBeNull();
    });

    it("returns an element if getIcon return something", () => {
      BannerPlugin.getIcon = () => "foo";

      expect(BannerPlugin.getHeader()).not.toBe(null);
    });

    it("returns an element if getTitle return something", () => {
      BannerPlugin.getTitle = () => "foo";

      expect(BannerPlugin.getHeader()).not.toBe(null);
    });

    it("returns element when getHeaderContent does", () => {
      BannerPlugin.getHeaderContent = () => "foo";

      expect(BannerPlugin.getHeader()).not.toBe(null);
    });
  });

  describe("#getFooter", () => {
    it("returns null if footerContent is null", () => {
      BannerPlugin.configure({
        footerContent: null
      });

      expect(BannerPlugin.getFooter()).toBeNull();
    });

    it("returns null if footerContent is empty string", () => {
      BannerPlugin.configure({
        footerContent: ""
      });

      expect(BannerPlugin.getFooter()).toBeNull();
    });

    it("returns an element if footerContent is set", () => {
      BannerPlugin.configure({
        footerContent: "foo"
      });

      expect(BannerPlugin.getFooter()).not.toBe(null);
    });
  });
});
