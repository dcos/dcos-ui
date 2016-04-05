import {Confirm, Dropdown} from 'reactjs-components';
import mixin from 'reactjs-mixin';
/* eslint-disable no-unused-vars */
import React from 'react';
/* eslint-enable no-unused-vars */
import {StoreMixin} from 'mesosphere-shared-reactjs';

import StringUtil from '../../utils/StringUtil';
import Util from '../../utils/Util';

const METHODS_TO_BIND = [
  'handleButtonCancel',
  'handleButtonConfirm',
  'handleItemSelection',
  'onActionError',
  'onActionSuccess'
];

const DEFAULT_ID = 'DEFAULT';
const ITEMS_DISPLAYED = 3;

class ActionsModal extends mixin(StoreMixin) {
  constructor() {
    super(...arguments);

    this.state = {
      pendingRequest: false,
      requestErrors: [],
      requestsRemaining: 0,
      selectedItem: null,
      validationError: null
    };

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  componentWillMount() {
    super.componentWillMount();

    this.setState({
      requestsRemaining: this.props.selectedItems.length
    });
  }

  componentWillUpdate(nextProps, nextState) {
    super.componentWillUpdate(...arguments);
    let {requestsRemaining, requestErrors} = nextState;
    if (requestsRemaining === 0 && !requestErrors.length) {
      this.handleButtonCancel();
    }
  }

  componentDidUpdate() {
    super.componentDidUpdate(...arguments);
    let {requestsRemaining} = this.state;

    if (requestsRemaining === 0) {
      this.setState({
        pendingRequest: false,
        requestsRemaining: this.props.selectedItems.length
      });
    }
  }

  handleButtonCancel() {
    this.setState({
      pendingRequest: false,
      requestErrors: [],
      requestsRemaining: 0,
      selectedItem: null,
      validationError: null
    });
    this.props.onClose();
  }

  handleItemSelection(item) {
    this.setState({
      requestErrors: [],
      selectedItem: item,
      validationError: null
    });
  }

  onActionError(error) {
    this.state.requestErrors.push(error);

    this.setState({
      requestErrors: this.state.requestErrors,
      requestsRemaining: this.state.requestsRemaining - 1
    });
  }

  onActionSuccess() {
    this.setState({
      requestsRemaining: this.state.requestsRemaining - 1
    });
  }

  getActionsModalContents() {
    let {actionText, itemType, selectedItems} = this.props;
    let {requestErrors, validationError} = this.state;

    let selectedItemsString = '';
    let actionContent = '';
    if (selectedItems.length === 1) {
      selectedItemsString = selectedItems[0].description;
    } else {
      // Truncate list of selected user/groups for ease of reading
      let selectedItemsShown = selectedItems.slice(0, ITEMS_DISPLAYED);

      // Create a string concatenating n-1 items
      let selectedItemsShownMinusOne = selectedItemsShown.slice(0, -1);
      let descriptions = selectedItemsShownMinusOne.map(function (item) {
        return item.description;
      });
      descriptions.forEach(function (description) {
        selectedItemsString += `${description}, `;
      });

      // Handle grammar for nth element and concatenate to list
      if (selectedItems.length <= ITEMS_DISPLAYED) {
        selectedItemsString += `and ${Util.last(selectedItems).description} `;
      } else if (selectedItems.length === ITEMS_DISPLAYED + 1) {
        selectedItemsString += 'and 1 other ';
      } else {
        let overflow = selectedItems.length - ITEMS_DISPLAYED;
        selectedItemsString += `and ${overflow} others `;
      }
      if (actionText.phraseFirst) {
        selectedItemsString = selectedItemsString.slice(
          0, selectedItemsString.length - 1
        );
      }
    }
    if (actionText.phraseFirst) {
      actionContent = `${actionText.actionPhrase} ${selectedItemsString}.`;
    } else {
      actionContent = `${selectedItemsString} ${actionText.actionPhrase}.`;
    }

    return (
      <div className="container-pod container-pod-short text-align-center">
        <h3 className="flush-top">{actionText.title}</h3>
        <p>{actionContent}</p>
        {this.getDropdown(itemType)}
        {this.getErrorMessage(validationError)}
        {this.getRequestErrorMessage(requestErrors)}
      </div>
    );
  }

  getDropdown(itemType) {
    if (this.props.action === 'delete') {
      return null;
    }

    return (
      <div className="container container-pod container-pod-super-short">
        <Dropdown
          buttonClassName="button dropdown-toggle"
          dropdownMenuClassName="dropdown-menu"
          dropdownMenuListClassName="dropdown-menu-list"
          dropdownMenuListItemClassName="clickable"
          initialID={DEFAULT_ID}
          items={this.getDropdownItems(itemType)}
          onItemSelection={this.handleItemSelection}
          transition={true}
          transitionName="dropdown-menu"
          wrapperClassName="dropdown text-align-left" />
      </div>
    );
  }

  getErrorMessage(error) {
    if (error != null) {
      return (
        <p className="text-error-state">{error}</p>
      );
    }
  }

  getRequestErrorMessage(errors) {
    if (errors.length > 0) {
      // Only show 5 first errors
      let errorMessages = errors.slice(0, 5).map(function (error, index) {
        return (
          <p className="text-error-state" key={index}>{error}</p>
        );
      });

      return (
        <div>
          {errorMessages}
        </div>
      );
    }
  }

  render() {
    let action = this.props.action;
    let props = this.props;
    if (action === null) {
      return null;
    }

    return (
      <Confirm
        disabled={this.state.pendingRequest}
        dynamicHeight={false}
        footerContainerClass="container container-pod container-pod-short
          container-pod-fluid flush-top flush-bottom"
        open={!!action}
        onClose={this.handleButtonCancel}
        leftButtonCallback={this.handleButtonCancel}
        rightButtonCallback={this.handleButtonConfirm}
        rightButtonText={StringUtil.capitalize(action)}
        useGemini={false}
        {...props}>
        {this.getActionsModalContents()}
      </Confirm>
    );
  }
}

ActionsModal.propTypes = {
  action: React.PropTypes.string.isRequired,
  actionText: React.PropTypes.object.isRequired,
  itemID: React.PropTypes.string.isRequired,
  itemType: React.PropTypes.string.isRequired,
  onClose: React.PropTypes.func.isRequired,
  selectedItems: React.PropTypes.array.isRequired
};

module.exports = ActionsModal;
