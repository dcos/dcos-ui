import {Modal} from 'reactjs-components';
import React from 'react';

import Util from '../../utils/Util';

class FullScreenModal extends React.Component {
  render() {
    let {props} = this;

    return (
      <Modal modalClass="modal modal-full-screen"
        showHeader={true}
        showFooter={false}
        transitionNameModal="modal-full-screen"
        {...Util.omit(props, Object.keys(FullScreenModal.propTypes))}>
        {props.children}
      </Modal>
    );
  }
}

FullScreenModal.propTypes = {
  children: React.PropTypes.node
};

module.exports = FullScreenModal;
