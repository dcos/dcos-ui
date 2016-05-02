import classNames from 'classnames';
import React from 'react';

import DialogSeverity from '../constants/DialogSeverity';
import {Modal} from 'reactjs-components';

class Dialog extends React.Component {
  getButtons() {
    return this.props.buttons.map(function (button, index) {
      let classSet = classNames('button', button.className);
      return (
        <div key={index}
          className={classSet}
          onClick={button.onClick}>
          {button.text}
        </div>
      )
    });
  }

  getCloseByBackdropClick() {
    return this.props.buttons.length === 1;
  }

  getFooter(buttons) {
    if (buttons.length === 0) {
      return null;
    }

    return (
      <div className="button-collection text-align-center">
        {buttons}
      </div>
    );
  }

  getModalClassSet() {
    let {severity} = this.props;

    return classNames('modal dialog', {
      'dialog-info': severity === DialogSeverity.INFO,
      'dialog-danger': severity === DialogSeverity.DANGER,
      'dialog-warning': severity === DialogSeverity.WARNING
    });
  }

  getOnClose() {
    if (this.buttons === 1) {
      return this.buttons[0].onClick;
    }
    return null;
  }

  render() {
    let {title, children} = this.props;

    let buttons = this.getButtons();

    return (
      <Modal
        open={true}
        modalClass={this.getModalClassSet()}
        footer={this.getFooter(buttons)}
        closeByBackdropClick={this.getCloseByBackdropClick()}
        showHeader={title != null}
        showFooter={buttons != null}
        onClose={this.getOnClose()}
        titleText={title}>
        {children}
      </Modal>
    );
  }
}

Dialog.defaultProps = {
  buttons: [],
  severity: DialogSeverity.INFO,
  title: null
};

Dialog.PropTypes = {
  buttons: React.PropTypes.arrayOf(
    React.PropTypes.shape({
      className: React.PropTypes.string,
      onClick: React.PropTypes.func,
      text: React.PropTypes.string
    })
  ),
  severity: React.PropTypes.string,
  title: React.PropTypes.string
};

module.exports = Dialog;
