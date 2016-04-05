import {Dropdown, Form, Table} from 'reactjs-components';
import mixin from 'reactjs-mixin';
/* eslint-disable no-unused-vars */
import React from 'react';
/* eslint-enable no-unused-vars */

import BulkOptions from '../../constants/BulkOptions';
import FilterHeadline from '../../components/FilterHeadline';
import FilterInputText from '../../components/FilterInputText';
import InternalStorageMixin from '../../mixins/InternalStorageMixin';
import ResourceTableUtil from '../../utils/ResourceTableUtil';
import StringUtil from '../../utils/StringUtil';
import TableUtil from '../../utils/TableUtil';
import UsersActionsModal from '../../components/modals/UsersActionsModal';

const METHODS_TO_BIND = [
  'getTableRowOptions',
  'handleActionSelection',
  'handleActionSelectionClose',
  'handleCheckboxChange',
  'handleHeadingCheckboxChange',
  'handleSearchStringChange',
  'renderCheckbox',
  'renderFullName',
  'renderHeadingCheckbox',
  'renderUsername',
  'resetFilter'
];

class OrganizationTab extends mixin(InternalStorageMixin) {
  constructor() {
    super(arguments);

    this.state = {
      checkableCount: 0,
      checkedCount: 0,
      showActionDropdown: false,
      searchString: '',
      selectedAction: null
    };

    METHODS_TO_BIND.forEach(function (method) {
      this[method] = this[method].bind(this);
    }, this);

    this.internalStorage_update({selectedIDSet: {}});
  }

  componentWillMount() {
    super.componentWillMount();
    this.resetTablewideCheckboxTabulations();
  }

  componentWillReceiveProps(nextProps) {
    super.componentWillReceiveProps(...arguments);

    if (nextProps.items.length !== this.props.items.length) {
      this.resetTablewideCheckboxTabulations();
    }
  }

  componentDidUpdate(prevProps, prevState) {
    super.componentDidUpdate(...arguments);

    if (prevState.searchString !== this.state.searchString ||
        prevProps.items.length !== this.props.items.length) {
      this.resetTablewideCheckboxTabulations();
    }
  }

  handleActionSelection(dropdownItem) {
    this.setState({
      selectedAction: dropdownItem.id
    });
  }

  handleActionSelectionClose() {
    this.setState({
      selectedAction: null
    });
    this.bulkCheck(false);
  }

  handleCheckboxChange(prevCheckboxState, eventObject) {
    let isChecked = eventObject.fieldValue;
    let checkedCount = this.state.checkedCount + (isChecked || -1);
    let selectedIDSet = this.internalStorage_get().selectedIDSet;

    selectedIDSet[eventObject.fieldName] = isChecked;
    this.internalStorage_update({selectedIDSet});

    this.setState({
      checkedCount,
      showActionDropdown: (checkedCount > 0)
    });
  }

  handleHeadingCheckboxChange(prevCheckboxState, eventObject) {
    let isChecked = eventObject.fieldValue;
    this.bulkCheck(isChecked);
  }

  handleSearchStringChange(searchString) {
    this.setState({searchString});
    this.bulkCheck(false);
  }

  renderFullName(prop, subject) {
    return subject.get('description');
  }

  renderUsername(prop, subject) {
    return (
      <div className="row">
        <div className="column-small-12 column-large-12 column-x-large-12 text-overflow">
          {subject.get('uid')}
        </div>
      </div>
    );
  }

  renderCheckbox(prop, row) {
    let rowID = row[this.props.itemID];
    let remoteIDSet = this.internalStorage_get().remoteIDSet;
    let {checkableCount, checkedCount} = this.state;
    let disabled = (remoteIDSet[rowID] === true);
    let checked = null;

    if (disabled || checkedCount === 0) {
      checked = false;
    } else if (checkedCount === checkableCount) {
      checked = true;
    } else {
      checked = this.internalStorage_get().selectedIDSet[rowID];
    }

    return (
      <Form
        formGroupClass="form-group flush-bottom"
        definition={[{
          checked,
          disabled,
          value: checked,
          fieldType: 'checkbox',
          labelClass: 'form-row-element form-element-checkbox inverse',
          name: rowID,
          showLabel: false
        }]}
        onChange={this.handleCheckboxChange} />
    );
  }

  renderHeadingCheckbox() {
    let checked = false;
    let indeterminate = false;

    switch (this.state.checkedCount) {
      case 0:
        checked = false;
        break;
      case this.state.checkableCount:
        checked = true;
        break;
      default:
        indeterminate = true;
        break;
    }

    return (
      <Form
        formGroupClass="form-group flush-bottom"
        definition={[
          {
            checked,
            value: checked,
            fieldType: 'checkbox',
            indeterminate,
            labelClass: 'form-row-element form-element-checkbox inverse',
            name: 'headingCheckbox',
            showLabel: false
          }
        ]}
        onChange={this.handleHeadingCheckboxChange} />
    );
  }

  getColGroup() {
    return (
      <colgroup>
        <col style={{width: '40px'}} />
        <col />
      </colgroup>
    );
  }

  getClassName(prop, sortBy, row) {
    return classNames({
      'clickable': row == null // this is a header
    });
  }

  getColumns() {
    let {getClassName} = this;

    return [
      {
        className: getClassName,
        headerClassName: getClassName,
        prop: 'selected',
        render: this.renderCheckbox,
        sortable: false,
        heading: this.renderHeadingCheckbox
      },
      {
        cacheCell: true,
        className: getClassName,
        headerClassName: getClassName,
        prop: 'uid',
        render: this.renderUsername,
        sortable: true,
        sortFunction: TableUtil.getSortFunction(
          this.props.itemID,
          function (item, prop) {
            return item.get(prop);
          }
        ),
        heading: ResourceTableUtil.renderHeading({uid: 'USERNAME'})
      }
    ];
  }

  getActionDropdown(itemName) {
    if (!this.state.showActionDropdown) {
      return null;
    }

    let actionPhrases = BulkOptions[itemName];
    let initialID = null;

    // Get first Action to set as initially selected option in dropdown.
    initialID = Object.keys(actionPhrases)[0] || null;

    let dropdownItems = this.getActionsDropdownItems(actionPhrases);
    if (dropdownItems.length === 1) {
      return (
        <li>
          <button
            className="button button-inverse"
            onClick={this.handleActionSelection.bind(this, dropdownItems[0])}>
            {dropdownItems[0].html}
          </button>
        </li>
      );
    }

    return (
      <li>
        <Dropdown
          buttonClassName="button button-inverse dropdown-toggle"
          dropdownMenuClassName="dropdown-menu inverse"
          dropdownMenuListClassName="dropdown-menu-list"
          dropdownMenuListItemClassName="clickable"
          initialID={initialID}
          items={dropdownItems}
          onItemSelection={this.handleActionSelection}
          transition={true}
          transitionName="dropdown-menu"
          wrapperClassName="dropdown" />
      </li>
    );
  }

  getActionsDropdownItems(actionPhrases) {
    return Object.keys(actionPhrases).map(function (action) {
      return {
        html: actionPhrases[action].dropdownOption,
        id: action,
        selectedHtml: 'Actions'
      };
    });
  }

  getCheckedItemObjects(items, itemIDName) {
    if (this.state.selectedAction) {
      let checkboxStates = this.internalStorage_get().selectedIDSet;
      let selectedItems = {};

      Object.keys(checkboxStates).forEach(function (id) {
        if (checkboxStates[id] === true) {
          selectedItems[id] = true;
        }
      });

      return items.filter(function (item) {
        let itemID = item[itemIDName];
        return selectedItems[itemID] || false;
      });
    } else {
      return null;
    }
  }

  getVisibleItems(items) {
    let {searchString} = this.state;
    searchString = searchString.toLowerCase();

    if (searchString !== '') {
      return items.filter((item) => {
        let description = item.get('description').toLowerCase();
        let id = item.get(this.props.itemID).toLowerCase();

        return description.indexOf(searchString) > -1
          || id.indexOf(searchString) > -1;
      });
    }

    return items;
  }

  getActionsModal(action, items, itemID, itemName) {
    if (action === null) {
      return null;
    }

    let checkedItemObjects = this.getCheckedItemObjects(items, itemID) || [];

    return (
      <UsersActionsModal
        action={action}
        actionText={BulkOptions[itemName][action]}
        bodyClass="modal-content allow-overflow"
        itemID={itemID}
        itemType={itemName}
        onClose={this.handleActionSelectionClose}
        selectedItems={checkedItemObjects} />
    );
  }

  getStringFilter() {
    return (
      <li>
        <FilterInputText
          searchString={this.state.searchString}
          handleFilterChange={this.handleSearchStringChange}
          inverseStyle={true} />
      </li>
    );
  }

  getTableRowOptions(row) {
    let selectedIDSet = this.internalStorage_get().selectedIDSet;
    if (selectedIDSet[row[this.props.itemID]]) {
      return {className: 'selected'};
    }
    return {};
  }

  bulkCheck(isChecked) {
    let checkedCount = 0;
    let selectedIDSet = this.internalStorage_get().selectedIDSet;

    Object.keys(selectedIDSet).forEach(function (id) {
      selectedIDSet[id] = isChecked;
    });
    this.internalStorage_update({selectedIDSet});

    if (isChecked) {
      checkedCount = this.state.checkableCount;
    }

    this.setState({
      checkedCount,
      showActionDropdown: checkedCount > 0
    });
  }

  resetTablewideCheckboxTabulations() {
    let {items, itemID} = this.props;
    items = this.getVisibleItems(items);
    let selectedIDSet = {};
    let remoteIDSet = {};
    let checkableCount = 0;

    // Initializing hash of items' IDs and corresponding checkbox state.
    items.forEach(function (item) {
      let id = item.get(itemID);
      checkableCount += 1;
      selectedIDSet[id] = false;
    });

    this.internalStorage_update({selectedIDSet, remoteIDSet});
    this.setState({checkableCount});
  }

  resetFilter() {
    this.setState({searchString: ''});
  }

  render() {
    let {items, itemID, itemName, handleNewItemClick} = this.props;
    let state = this.state;
    let action = state.selectedAction;
    let capitalizedItemName = StringUtil.capitalize(itemName);
    let visibleItems = this.getVisibleItems(items);
    let filterInputText = this.getStringFilter();
    let actionDropdown = this.getActionDropdown(itemName);
    let actionsModal = this.getActionsModal(action, items, itemID, itemName);
    let sortProp = itemID;

    return (
      <div className="flex-container-col">
        <div className={`${itemName}s-table-header`}>
          <FilterHeadline
            inverseStyle={true}
            onReset={this.resetFilter}
            name={`${StringUtil.pluralize(capitalizedItemName)}`}
            currentLength={visibleItems.length}
            totalLength={items.length} />
          <ul className="list list-unstyled list-inline flush-bottom">
            {filterInputText}
            {actionDropdown}
            {actionsModal}
            <li className="button-collection list-item-aligned-right">
              <a
                className="button button-success"
                onClick={handleNewItemClick}>
                {`+ New ${capitalizedItemName}`}
              </a>
            </li>
          </ul>
        </div>
        <div className="page-content-fill flex-grow flex-container-col">
          <Table
            buildRowOptions={this.getTableRowOptions}
            className="table inverse table-borderless-outer
              table-borderless-inner-columns flush-bottom"
            columns={this.getColumns()}
            colGroup={this.getColGroup()}
            containerSelector=".gm-scroll-view"
            data={visibleItems}
            itemHeight={TableUtil.getRowHeight()}
            sortBy={{prop: sortProp, order: 'asc'}} />
        </div>
      </div>
    );
  }
}

OrganizationTab.propTypes = {
  items: React.PropTypes.array.isRequired,
  itemID: React.PropTypes.string.isRequired,
  itemName: React.PropTypes.string.isRequired,
  handleNewItemClick: React.PropTypes.func.isRequired
};

module.exports = OrganizationTab;
