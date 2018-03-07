/* eslint-disable no-unused-vars */
const React = require("react");
/* eslint-enable no-unused-vars */
const ReactDOM = require("react-dom");

const Item = require("#SRC/js/structs/Item");
const LogBuffer = require("../../structs/LogBuffer");
const MesosLogStore = require("../../stores/MesosLogStore");
const MesosLogContainer = require("../MesosLogContainer");
const SystemLogTypes = require("#SRC/js/constants/SystemLogTypes");

const APPEND = SystemLogTypes.APPEND;

let thisStoreStartTailing,
  thisStoreStopTailing,
  thisContainer,
  thisInstance,
  thisMesosLogStoreGetLogBuffer;

describe("MesosLogContainer", function() {
  beforeEach(function() {
    // Store original versions
    thisStoreStartTailing = MesosLogStore.startTailing;
    thisStoreStopTailing = MesosLogStore.stopTailing;

    // Create spies
    MesosLogStore.startTailing = jasmine.createSpy("startTailing");
    MesosLogStore.stopTailing = jasmine.createSpy("stopTailing");

    thisContainer = global.document.createElement("div");
    thisInstance = ReactDOM.render(
      <MesosLogContainer
        filePath="/some/file/path"
        logName="bar"
        task={{ slave_id: "foo" }}
      />,
      thisContainer
    );

    var logBuffer = new LogBuffer();
    logBuffer.add(new Item({ data: "foo", offset: 100 }));
    MesosLogStore.getLogBuffer = jasmine
      .createSpy("MesosLogStore#getLogBuffer")
      .and.returnValue(logBuffer);
  });

  afterEach(function() {
    // Restore original functions
    MesosLogStore.startTailing = thisStoreStartTailing;
    MesosLogStore.stopTailing = thisStoreStopTailing;
    MesosLogStore.getLogBuffer = thisMesosLogStoreGetLogBuffer;

    ReactDOM.unmountComponentAtNode(thisContainer);
  });

  describe("#componentDidMount", function() {
    it("calls startTailing when component mounts", function() {
      expect(MesosLogStore.startTailing).toHaveBeenCalled();
    });
  });

  describe("#componentWillReceiveProps", function() {
    it("calls startTailing when new path is provided", function() {
      thisInstance.componentWillReceiveProps({
        filePath: "/other/file/path",
        task: { slave_id: "foo" }
      });
      expect(MesosLogStore.startTailing.calls.count()).toEqual(2);
    });

    it("calls stopTailing when new path is provided", function() {
      thisInstance.componentWillReceiveProps({
        filePath: "/other/file/path",
        task: { slave_id: "foo" }
      });
      expect(MesosLogStore.stopTailing.calls.count()).toEqual(1);
    });

    it("doesn't call startTailing when same path is provided", function() {
      thisInstance.componentWillReceiveProps({
        filePath: "/some/file/path",
        task: { slave_id: "foo" }
      });
      expect(MesosLogStore.startTailing.calls.count()).toEqual(1);
    });

    it("doesn't call stopTailing when same path is provided", function() {
      thisInstance.componentWillReceiveProps({
        filePath: "/some/file/path",
        task: { slave_id: "foo" }
      });
      expect(MesosLogStore.stopTailing.calls.count()).toEqual(0);
    });
  });

  describe("#componentWillUnmount", function() {
    it("calls stopTailing when component unmounts", function() {
      thisInstance.componentWillUnmount();
      expect(MesosLogStore.stopTailing).toHaveBeenCalled();
    });
  });

  describe("#onMesosLogStoreError", function() {
    beforeEach(function() {
      thisInstance.setState = jasmine.createSpy("setState");
    });

    it("setStates when path matches", function() {
      thisInstance.onMesosLogStoreError("/some/file/path");
      expect(thisInstance.setState).toHaveBeenCalled();
    });

    it("doesn't setState when path doesn't match", function() {
      thisInstance.onMesosLogStoreError("/other/file/path");
      expect(thisInstance.setState).not.toHaveBeenCalled();
    });
  });

  describe("#onMesosLogStoreSuccess", function() {
    beforeEach(function() {
      thisInstance.setState = jasmine.createSpy("setState");
    });

    it("setStates when path matches", function() {
      thisInstance.onMesosLogStoreSuccess("/some/file/path", APPEND);
      expect(thisInstance.setState).toHaveBeenCalled();
    });

    it("doesn't setState when path doesn't match", function() {
      thisInstance.onMesosLogStoreSuccess("/other/file/path", APPEND);
      expect(thisInstance.setState).not.toHaveBeenCalled();
    });
  });

  describe("#render", function() {
    it("calls getErrorScreen when error occurred", function() {
      thisInstance.state.hasLoadingError = 3;
      thisInstance.getErrorScreen = jasmine.createSpy("getErrorScreen");

      thisInstance.render();
      expect(thisInstance.getErrorScreen).toHaveBeenCalled();
    });

    it("ignores getErrorScreen when error has not occurred", function() {
      thisInstance.state.hasLoadingError = 2;
      thisInstance.getErrorScreen = jasmine.createSpy("getErrorScreen");

      thisInstance.render();
      expect(thisInstance.getErrorScreen).not.toHaveBeenCalled();
    });

    it("doesn't call getLoadingScreen when fullLog is empty", function() {
      var logBuffer = new LogBuffer();
      logBuffer.add(new Item({ data: "", offset: 100 }));
      MesosLogStore.getLogBuffer = jasmine
        .createSpy("MesosLogStore#getLogBuffer")
        .and.returnValue(logBuffer);
      thisInstance.getLoadingScreen = jasmine.createSpy("getLoadingScreen");

      thisInstance.onMesosLogStoreSuccess("/some/file/path", APPEND);
      thisInstance.render();
      expect(thisInstance.getLoadingScreen).not.toHaveBeenCalled();
    });

    it("calls getLoadingScreen when filePath is null", function() {
      thisInstance = ReactDOM.render(
        <MesosLogContainer
          filePath={null}
          logName="foo"
          task={{ slave_id: "foo" }}
        />,
        thisContainer
      );
      thisInstance.getLoadingScreen = jasmine
        .createSpy("getLoadingScreen")
        .and.returnValue(<noscript />);
      thisInstance.onMesosLogStoreSuccess(null, APPEND);
      thisInstance.render();
      expect(thisInstance.getLoadingScreen).toHaveBeenCalled();
    });

    it("calls getEmptyDirectoryScreen when fullLog has data", function() {
      thisInstance = ReactDOM.render(
        <MesosLogContainer
          filePath="/some/file/path"
          logName={null}
          task={{ slave_id: "foo" }}
        />,
        thisContainer
      );

      var logBuffer = new LogBuffer();
      logBuffer.add(new Item({ data: "", offset: 100 }));
      MesosLogStore.getLogBuffer = jasmine
        .createSpy("MesosLogStore#getLogBuffer")
        .and.returnValue(logBuffer);
      thisInstance.getEmptyDirectoryScreen = jasmine
        .createSpy("getEmptyDirectoryScreen")
        .and.returnValue(<noscript />);

      thisInstance.onMesosLogStoreSuccess("/some/file/path", APPEND);
      thisInstance.render();
      expect(thisInstance.getEmptyDirectoryScreen).toHaveBeenCalled();
    });

    it("shows empty directory screen when logName is empty", function() {
      thisInstance = ReactDOM.render(
        <MesosLogContainer
          filePath="/some/file/path"
          logName={null}
          task={{ slave_id: "foo" }}
        />,
        thisContainer
      );

      var logBuffer = new LogBuffer();
      MesosLogStore.getLogBuffer = jasmine
        .createSpy("MesosLogStore#getLogBuffer")
        .and.returnValue(logBuffer);
      thisInstance.getEmptyDirectoryScreen = jasmine
        .createSpy("getEmptyDirectoryScreen")
        .and.returnValue(<noscript />);

      thisInstance.onMesosLogStoreSuccess("/some/file/path", APPEND);
      thisInstance.render();
      expect(thisInstance.getEmptyDirectoryScreen).toHaveBeenCalled();
    });
  });
});
