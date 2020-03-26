import Item from "#SRC/js/structs/Item";
import * as SystemLogTypes from "#SRC/js/constants/SystemLogTypes";
import LogBuffer from "../../structs/LogBuffer";
import MesosLogStore from "../../stores/MesosLogStore";
import MesosLogContainer from "../MesosLogContainer";

import * as React from "react";
import ReactDOM from "react-dom";

const APPEND = SystemLogTypes.APPEND;

let thisStoreStartTailing,
  thisStoreStopTailing,
  thisContainer,
  thisInstance,
  thisMesosLogStoreGetLogBuffer;

describe("MesosLogContainer", () => {
  beforeEach(() => {
    // Store original versions
    thisStoreStartTailing = MesosLogStore.startTailing;
    thisStoreStopTailing = MesosLogStore.stopTailing;

    // Create spies
    MesosLogStore.startTailing = jasmine.createSpy("startTailing");
    MesosLogStore.stopTailing = jasmine.createSpy("stopTailing");

    thisContainer = window.document.createElement("div");
    thisInstance = ReactDOM.render(
      <MesosLogContainer
        filePath="/some/file/path"
        logName="bar"
        task={{ slave_id: "foo" }}
      />,
      thisContainer
    );

    const logBuffer = new LogBuffer();
    logBuffer.add(new Item({ data: "foo", offset: 100 }));
    MesosLogStore.getLogBuffer = jasmine
      .createSpy("MesosLogStore#getLogBuffer")
      .and.returnValue(logBuffer);
  });

  afterEach(() => {
    // Restore original functions
    MesosLogStore.startTailing = thisStoreStartTailing;
    MesosLogStore.stopTailing = thisStoreStopTailing;
    MesosLogStore.getLogBuffer = thisMesosLogStoreGetLogBuffer;

    ReactDOM.unmountComponentAtNode(thisContainer);
  });

  describe("#componentDidMount", () => {
    it("calls startTailing when component mounts", () => {
      expect(MesosLogStore.startTailing).toHaveBeenCalled();
    });
  });

  describe("#UNSAFE_componentWillReceiveProps", () => {
    it("calls startTailing when new path is provided", () => {
      thisInstance.UNSAFE_componentWillReceiveProps({
        filePath: "/other/file/path",
        task: { slave_id: "foo" },
      });
      expect(MesosLogStore.startTailing.calls.count()).toEqual(2);
    });

    it("calls stopTailing when new path is provided", () => {
      thisInstance.UNSAFE_componentWillReceiveProps({
        filePath: "/other/file/path",
        task: { slave_id: "foo" },
      });
      expect(MesosLogStore.stopTailing.calls.count()).toEqual(1);
    });

    it("doesn't call startTailing when same path is provided", () => {
      thisInstance.UNSAFE_componentWillReceiveProps({
        filePath: "/some/file/path",
        task: { slave_id: "foo" },
      });
      expect(MesosLogStore.startTailing.calls.count()).toEqual(1);
    });

    it("doesn't call stopTailing when same path is provided", () => {
      thisInstance.UNSAFE_componentWillReceiveProps({
        filePath: "/some/file/path",
        task: { slave_id: "foo" },
      });
      expect(MesosLogStore.stopTailing.calls.count()).toEqual(0);
    });
  });

  describe("#componentWillUnmount", () => {
    it("calls stopTailing when component unmounts", () => {
      thisInstance.componentWillUnmount();
      expect(MesosLogStore.stopTailing).toHaveBeenCalled();
    });
  });

  describe("#onMesosLogStoreError", () => {
    beforeEach(() => {
      thisInstance.setState = jasmine.createSpy("setState");
    });

    it("setStates when path matches", () => {
      thisInstance.onMesosLogStoreError("/some/file/path");
      expect(thisInstance.setState).toHaveBeenCalled();
    });

    it("doesn't setState when path doesn't match", () => {
      thisInstance.onMesosLogStoreError("/other/file/path");
      expect(thisInstance.setState).not.toHaveBeenCalled();
    });
  });

  describe("#onMesosLogStoreSuccess", () => {
    beforeEach(() => {
      thisInstance.setState = jasmine.createSpy("setState");
    });

    it("setStates when path matches", () => {
      thisInstance.onMesosLogStoreSuccess("/some/file/path", APPEND);
      expect(thisInstance.setState).toHaveBeenCalled();
    });

    it("doesn't setState when path doesn't match", () => {
      thisInstance.onMesosLogStoreSuccess("/other/file/path", APPEND);
      expect(thisInstance.setState).not.toHaveBeenCalled();
    });
  });

  describe("#render", () => {
    it("calls getErrorScreen when error occurred", () => {
      thisInstance.state.hasLoadingError = 3;
      thisInstance.getErrorScreen = jasmine.createSpy("getErrorScreen");

      thisInstance.render();
      expect(thisInstance.getErrorScreen).toHaveBeenCalled();
    });

    it("ignores getErrorScreen when error has not occurred", () => {
      thisInstance.state.hasLoadingError = 2;
      thisInstance.getErrorScreen = jasmine.createSpy("getErrorScreen");

      thisInstance.render();
      expect(thisInstance.getErrorScreen).not.toHaveBeenCalled();
    });

    it("doesn't call getLoadingScreen when fullLog is empty", () => {
      const logBuffer = new LogBuffer();
      logBuffer.add(new Item({ data: "", offset: 100 }));
      MesosLogStore.getLogBuffer = jasmine
        .createSpy("MesosLogStore#getLogBuffer")
        .and.returnValue(logBuffer);
      thisInstance.getLoadingScreen = jasmine.createSpy("getLoadingScreen");

      thisInstance.onMesosLogStoreSuccess("/some/file/path", APPEND);
      thisInstance.render();
      expect(thisInstance.getLoadingScreen).not.toHaveBeenCalled();
    });

    it("calls getLoadingScreen when filePath is null", () => {
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

    it("calls getEmptyDirectoryScreen when fullLog has data", () => {
      thisInstance = ReactDOM.render(
        <MesosLogContainer
          filePath="/some/file/path"
          logName={null}
          task={{ slave_id: "foo" }}
        />,
        thisContainer
      );

      const logBuffer = new LogBuffer();
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

    it("shows empty directory screen when logName is empty", () => {
      thisInstance = ReactDOM.render(
        <MesosLogContainer
          filePath="/some/file/path"
          logName={null}
          task={{ slave_id: "foo" }}
        />,
        thisContainer
      );

      const logBuffer = new LogBuffer();
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
