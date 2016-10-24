import {Confirm, Dropdown} from 'reactjs-components';
import mixin from 'reactjs-mixin';
import React from 'react';
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
    this.setState({
      requestsRemaining: this.props.selectedItems.length
    });
  }

  componentWillUpdate(nextProps, nextState) {
    let {requestsRemaining, requestErrors} = nextState;

    if (requestsRemaining === 0 && !requestErrors.length) {
      this.handleButtonCancel();
    }
  }

  componentDidUpdate() {
    let {requestsRemaining} = this.state;

    if (requestsRemaining === 0) {
      /* eslint-disable react/no-did-update-set-state */
      this.setState({
        pendingRequest: false,
        requestsRemaining: this.props.selectedItems.length
      });
      /* eslint-enable react/no-did-update-set-state */
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
    let {actionText, itemType} = this.props;
    let {requestErrors, validationError} = this.state;

    return (
      <div className="text-align-center">
        <h3 className="flush-top">{actionText.title}</h3>
        <p>{this.getActionsModalContentsText()}</p>
        {this.getDropdown(itemType)}
        {this.getErrorMessage(validationError)}
        {this.getRequestErrorMessage(requestErrors)}
      </div>
    );
  }

  getActionsModalContentsText() {
    let {actionText, itemID, selectedItems} = this.props;

    let selectedItemsString = '';
    if (selectedItems.length === 1) {
      selectedItemsString = selectedItems[0][itemID];
    } else {
      // Truncate list of selected user/groups for ease of reading
      let selectedItemsShown = selectedItems.slice(0, ITEMS_DISPLAYED + 1);

      // Create a string concatenating n-1 items
      let selectedItemsShownMinusOne = selectedItemsShown.slice(0, -1);
      let itemIDs = selectedItemsShownMinusOne.map(function (item) {
        return item[itemID];
      });
      itemIDs.forEach(function (_itemID) {
        selectedItemsString += `${_itemID}, `;
      });

      // Handle grammar for nth element and concatenate to list
      if (selectedItems.length <= ITEMS_DISPLAYED) {
        // SelectedItems may be 0 length and Util.last will retun null
        if (selectedItems.length > 0) {
          selectedItemsString += `and ${Util.last(selectedItems)[itemID]} `;
        }
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
      return `${actionText.actionPhrase} ${selectedItemsString}.`;
    } else {
      return `${selectedItemsString} ${actionText.actionPhrase}.`;
    }
  }

  getDropdown(itemType) {
    if (this.props.action === 'delete') {
      return null;
    }

    return (
      <Dropdown
        buttonClassName="button dropdown-toggle"
        dropdownMenuClassName="dropdown-menu"
        dropdownMenuListClassName="dropdown-menu-list"
        dropdownMenuListItemClassName="clickable"
        initialID={DEFAULT_ID}
        items={this.getDropdownItems(itemType)}
        onItemSelection={this.handleItemSelection}
        scrollContainer=".gm-scroll-view"
        scrollContainerParentSelector=".gm-prevented"
        transition={true}
        transitionName="dropdown-menu"
        wrapperClassName="dropdown text-align-left" />
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
