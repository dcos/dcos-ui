import classNames from "classnames";
import { Modal } from "reactjs-components";
import React from "react";

import Util from "../../utils/Util";

const FullScreenModal = props => {
  const geminiClasses = classNames({
    "gm-scrollbar-container-flex": props.useGemini !== false
  });

  let modalHeight = null;

  if (props.useGemini) {
    modalHeight = "100%";
  }

  return (
    <Modal
      geminiClass={geminiClasses}
      isFullScreen={true}
      modalClass="modal modal-full-screen"
      modalHeight={modalHeight}
      showHeader={true}
      showFooter={false}
      transitionNameModal="modal-full-screen"
      {...Util.omit(props, ["children"])}
    >
      {props.children}
    </Modal>
  );
};

FullScreenModal.defaultProps = {
  useGemini: true
};

export default FullScreenModal;
