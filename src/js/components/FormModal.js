import classNames from "classnames/dedupe";
import { Form, Modal } from "reactjs-components";
import React from "react";

const METHODS_TO_BIND = [
  "getTriggerSubmit",
  "handleTriggerSubmit",
  "handleError"
];

class FormModal extends React.Component {
  constructor() {
    super();
    this.triggerSubmit = function() {};

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  componentDidMount() {
    this.focusOnField();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.open === false && this.props.open === true) {
      this.focusOnField();
    }
  }

  handleTriggerSubmit() {
    this.triggerSubmit();
  }

  getTriggerSubmit(trigger) {
    this.triggerSubmit = trigger;
    this.forceUpdate();
  }

  handleNewButtonClick() {
    this.triggerSubmit();
  }

  handleError() {
    this.forceUpdate();
  }

  focusOnField() {
    // Gotta account for animation
    setTimeout(() => {
      const el = this.refs["form-wrapper"];
      if (el) {
        const input = el.querySelector("form input");
        if (input) {
          input.focus();
        }
      }
    }, 100);
  }

  getButtons() {
    return this.props.buttonDefinition.map((buttonDefinition, i) => {
      let buttonClassSet = {
        disabled: this.props.disabled
      };
      buttonClassSet[buttonDefinition.className] = true;
      buttonClassSet = classNames(buttonClassSet);

      let handleOnClick = function() {};
      if (buttonDefinition.isClose) {
        handleOnClick = this.props.onClose;
      }

      if (buttonDefinition.isSubmit) {
        handleOnClick = this.handleTriggerSubmit;
      }

      if (buttonDefinition.onClick) {
        handleOnClick = buttonDefinition.onClick;
      }

      return (
        <button
          className={buttonClassSet}
          disabled={this.props.disabled}
          key={i}
          onClick={handleOnClick}
        >
          {buttonDefinition.text}
        </button>
      );
    });
  }

  getFooter() {
    return (
      <div className="button-collection text-align-center flush">
        {this.getButtons()}
        {this.props.extraFooterContent}
      </div>
    );
  }

  getClassName(hasContentFooter) {
    if (hasContentFooter) {
      return "form";
    }

    return "form flush-bottom";
  }

  getContent() {
    return (
      <div ref="form-wrapper" className={classNames(this.props.contentClasses)}>
        {this.props.children}
        <Form
          className={this.getClassName(!!this.props.contentFooter)}
          definition={this.props.definition}
          triggerSubmit={this.getTriggerSubmit}
          onSubmit={this.props.onSubmit}
          onChange={this.props.onChange}
          onError={this.handleError}
        />
        {this.props.contentFooter}
      </div>
    );
  }

  render() {
    return (
      <Modal
        closeByBackdropClick={!this.props.disabled}
        modalClass="modal form-modal"
        onClose={this.props.onClose}
        open={this.props.open}
        showHeader={false}
        showFooter={true}
        footer={this.getFooter()}
        titleClass="text-align-center flush"
        {...this.props.modalProps}
      >
        {this.getContent()}
      </Modal>
    );
  }
}

FormModal.defaultProps = {
  buttonDefinition: [
    {
      text: "Cancel",
      className: "button button-medium",
      isClose: true
    },
    {
      text: "Create",
      className: "button button-success button-medium",
      isSubmit: true
    }
  ],
  disabled: false,
  extraFooterContent: null,
  onChange() {},
  onClose() {},
  open: false,
  modalProps: {}
};

FormModal.propTypes = {
  buttonDefinition: React.PropTypes.array,
  children: React.PropTypes.node,
  contentClasses: React.PropTypes.oneOfType([
    React.PropTypes.array,
    React.PropTypes.object,
    React.PropTypes.string
  ]),
  contentFooter: React.PropTypes.node,
  definition: React.PropTypes.array,
  disabled: React.PropTypes.bool,
  extraFooterContent: React.PropTypes.node,
  modalProps: React.PropTypes.object,
  onChange: React.PropTypes.func,
  onClose: React.PropTypes.func.isRequired,
  onSubmit: React.PropTypes.func,
  open: React.PropTypes.bool
};

module.exports = FormModal;
