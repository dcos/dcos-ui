import { Trans } from "@lingui/macro";
import { i18nMark } from "@lingui/react";
import classNames from "classnames/dedupe";
import { Form, Modal } from "reactjs-components";
import PropTypes from "prop-types";
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

    this.formWrapperRef = React.createRef();

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
      if (this.formWrapperRef && this.formWrapperRef.current) {
        const input = this.formWrapperRef.current.querySelector("form input");
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
        <Trans
          id={buttonDefinition.text}
          render={
            <button
              className={buttonClassSet}
              disabled={this.props.disabled}
              key={i}
              onClick={handleOnClick}
            />
          }
        />
      );
    });
  }

  getFooter() {
    return (
      <div className="flush-bottom flex flex-direction-top-to-bottom flex-align-items-stretch-screen-small flex-direction-left-to-right-screen-small flex-justify-items-space-between-screen-small">
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
      <div
        ref={this.formWrapperRef}
        className={classNames(this.props.contentClasses)}
      >
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
        modalClass="modal modal-small"
        onClose={this.props.onClose}
        open={this.props.open}
        showHeader={false}
        showFooter={true}
        footer={this.getFooter()}
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
      text: i18nMark("Cancel"),
      className: "button button-primary-link flush-left",
      isClose: true
    },
    {
      text: i18nMark("Create"),
      className: "button button-primary",
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
  buttonDefinition: PropTypes.array,
  children: PropTypes.node,
  contentClasses: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object,
    PropTypes.string
  ]),
  contentFooter: PropTypes.node,
  definition: PropTypes.array,
  disabled: PropTypes.bool,
  extraFooterContent: PropTypes.node,
  modalProps: PropTypes.object,
  onChange: PropTypes.func,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func,
  open: PropTypes.bool
};

module.exports = FormModal;
