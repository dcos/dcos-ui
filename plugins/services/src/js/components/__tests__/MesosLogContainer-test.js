jest.dontMock("../Highlight");
jest.dontMock("../MesosLogContainer");
jest.dontMock("../LogView");
jest.dontMock("../../../../../../src/js/structs/Item");
jest.dontMock("../../../../../../src/js/components/Loader");
jest.dontMock("../../structs/LogBuffer");

/* eslint-disable no-unused-vars */
const React = require("react");
/* eslint-enable no-unused-vars */
const ReactDOM = require("react-dom");

const Item = require("../../../../../../src/js/structs/Item");
const LogBuffer = require("../../structs/LogBuffer");
const MesosLogStore = require("../../stores/MesosLogStore");
const MesosLogContainer = require("../MesosLogContainer");
const SystemLogTypes = require("../../../../../../src/js/constants/SystemLogTypes");

const APPEND = SystemLogTypes.APPEND;

describe("MesosLogContainer", function() {
  beforeEach(function() {
    // Store original versions
    this.storeStartTailing = MesosLogStore.startTailing;
    this.storeStopTailing = MesosLogStore.stopTailing;
    this.mesosLogStoreGet = MesosLogStore.get;

    // Create spies
    MesosLogStore.startTailing = jasmine.createSpy("startTailing");
    MesosLogStore.stopTailing = jasmine.createSpy("stopTailing");

    this.container = global.document.createElement("div");
    this.instance = ReactDOM.render(
      <MesosLogContainer
        filePath="/some/file/path"
        logName="bar"
        task={{ slave_id: "foo" }}
      />,
      this.container
    );

    var logBuffer = new LogBuffer();
    logBuffer.add(new Item({ data: "foo", offset: 100 }));
    MesosLogStore.getLogBuffer = jasmine
      .createSpy("MesosLogStore#getLogBuffer")
      .and.returnValue(logBuffer);
  });

  afterEach(function() {
    // Restore original functions
    MesosLogStore.startTailing = this.storeStartTailing;
    MesosLogStore.stopTailing = this.storeStopTailing;
    MesosLogStore.getLogBuffer = this.mesosLogStoreGetLogBuffer;

    ReactDOM.unmountComponentAtNode(this.container);
  });

  describe("#componentDidMount", function() {
    it("should call startTailing when component mounts", function() {
      expect(MesosLogStore.startTailing).toHaveBeenCalled();
    });
  });

  describe("#componentWillReceiveProps", function() {
    it("should call startTailing when new path is provided", function() {
      this.instance.componentWillReceiveProps({
        filePath: "/other/file/path",
        task: { slave_id: "foo" }
      });
      expect(MesosLogStore.startTailing.calls.count()).toEqual(2);
    });

    it("should call stopTailing when new path is provided", function() {
      this.instance.componentWillReceiveProps({
        filePath: "/other/file/path",
        task: { slave_id: "foo" }
      });
      expect(MesosLogStore.stopTailing.calls.count()).toEqual(1);
    });

    it("shouldn't call startTailing when same path is provided", function() {
      this.instance.componentWillReceiveProps({
        filePath: "/some/file/path",
        task: { slave_id: "foo" }
      });
      expect(MesosLogStore.startTailing.calls.count()).toEqual(1);
    });

    it("shouldn't call stopTailing when same path is provided", function() {
      this.instance.componentWillReceiveProps({
        filePath: "/some/file/path",
        task: { slave_id: "foo" }
      });
      expect(MesosLogStore.stopTailing.calls.count()).toEqual(0);
    });
  });

  describe("#componentWillUnmount", function() {
    it("should call stopTailing when component unmounts", function() {
      this.instance.componentWillUnmount();
      expect(MesosLogStore.stopTailing).toHaveBeenCalled();
    });
  });

  describe("#onMesosLogStoreError", function() {
    beforeEach(function() {
      this.instance.setState = jasmine.createSpy("setState");
    });

    it("should setState when path matches", function() {
      this.instance.onMesosLogStoreError("/some/file/path");
      expect(this.instance.setState).toHaveBeenCalled();
    });

    it("shouldn't setState when path doesn't match", function() {
      this.instance.onMesosLogStoreError("/other/file/path");
      expect(this.instance.setState).not.toHaveBeenCalled();
    });
  });

  describe("#onMesosLogStoreSuccess", function() {
    beforeEach(function() {
      this.instance.setState = jasmine.createSpy("setState");
    });

    it("should setState when path matches", function() {
      this.instance.onMesosLogStoreSuccess("/some/file/path", APPEND);
      expect(this.instance.setState).toHaveBeenCalled();
    });

    it("shouldn't setState when path doesn't match", function() {
      this.instance.onMesosLogStoreSuccess("/other/file/path", APPEND);
      expect(this.instance.setState).not.toHaveBeenCalled();
    });
  });

  describe("#render", function() {
    it("should call getErrorScreen when error occurred", function() {
      this.instance.state.hasLoadingError = 3;
      this.instance.getErrorScreen = jasmine.createSpy("getErrorScreen");

      this.instance.render();
      expect(this.instance.getErrorScreen).toHaveBeenCalled();
    });

    it("ignores getErrorScreen when error has not occurred", function() {
      this.instance.state.hasLoadingError = 2;
      this.instance.getErrorScreen = jasmine.createSpy("getErrorScreen");

      this.instance.render();
      expect(this.instance.getErrorScreen).not.toHaveBeenCalled();
    });

    it("shouldn't call getLoadingScreen when fullLog is empty", function() {
      var logBuffer = new LogBuffer();
      logBuffer.add(new Item({ data: "", offset: 100 }));
      MesosLogStore.getLogBuffer = jasmine
        .createSpy("MesosLogStore#getLogBuffer")
        .and.returnValue(logBuffer);
      this.instance.getLoadingScreen = jasmine.createSpy("getLoadingScreen");

      this.instance.onMesosLogStoreSuccess("/some/file/path", APPEND);
      this.instance.render();
      expect(this.instance.getLoadingScreen).not.toHaveBeenCalled();
    });

    it("calls getLoadingScreen when filePath is null", function() {
      this.instance = ReactDOM.render(
        <MesosLogContainer
          filePath={null}
          logName="foo"
          task={{ slave_id: "foo" }}
        />,
        this.container
      );
      this.instance.getLoadingScreen = jasmine
        .createSpy("getLoadingScreen")
        .and.returnValue(<noscript />);
      this.instance.onMesosLogStoreSuccess(null, APPEND);
      this.instance.render();
      expect(this.instance.getLoadingScreen).toHaveBeenCalled();
    });

    it("calls getEmptyDirectoryScreen when fullLog has data", function() {
      this.instance = ReactDOM.render(
        <MesosLogContainer
          filePath="/some/file/path"
          logName={null}
          task={{ slave_id: "foo" }}
        />,
        this.container
      );

      var logBuffer = new LogBuffer();
      logBuffer.add(new Item({ data: "", offset: 100 }));
      MesosLogStore.getLogBuffer = jasmine
        .createSpy("MesosLogStore#getLogBuffer")
        .and.returnValue(logBuffer);
      this.instance.getEmptyDirectoryScreen = jasmine
        .createSpy("getEmptyDirectoryScreen")
        .and.returnValue(<noscript />);

      this.instance.onMesosLogStoreSuccess("/some/file/path", APPEND);
      this.instance.render();
      expect(this.instance.getEmptyDirectoryScreen).toHaveBeenCalled();
    });

    it("shows empty directory screen when logName is empty", function() {
      this.instance = ReactDOM.render(
        <MesosLogContainer
          filePath="/some/file/path"
          logName={null}
          task={{ slave_id: "foo" }}
        />,
        this.container
      );

      var logBuffer = new LogBuffer();
      MesosLogStore.getLogBuffer = jasmine
        .createSpy("MesosLogStore#getLogBuffer")
        .and.returnValue(logBuffer);
      this.instance.getEmptyDirectoryScreen = jasmine
        .createSpy("getEmptyDirectoryScreen")
        .and.returnValue(<noscript />);

      this.instance.onMesosLogStoreSuccess("/some/file/path", APPEND);
      this.instance.render();
      expect(this.instance.getEmptyDirectoryScreen).toHaveBeenCalled();
    });
  });
});
