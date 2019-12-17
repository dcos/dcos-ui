import * as React from "react";
import classNames from "classnames";
import Loader from "#SRC/js/components/Loader";

const JSONEditorLoading = ({ isSidePanel }: { isSidePanel?: boolean }) => (
  <div
    className={classNames("json-editor-loading", {
      "json-editor-loading--side-panel": isSidePanel,
      "json-editor-loading--inset": !isSidePanel
    })}
  >
    <Loader />
  </div>
);

export default JSONEditorLoading;
