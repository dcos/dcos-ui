import classNames from "classnames";
import { Dropdown, Form, Table } from "reactjs-components";
import { Hooks } from "PluginSDK";
import { Link } from "react-router";
import mixin from "reactjs-mixin";
/* eslint-disable no-unused-vars */
import React from "react";
/* eslint-enable no-unused-vars */
import { ResourceTableUtil } from "foundation-ui";
import { StoreMixin } from "mesosphere-shared-reactjs";

import Breadcrumb from "../../components/Breadcrumb";
import BreadcrumbTextContent from "../../components/BreadcrumbTextContent";
import BulkOptions from "../../constants/BulkOptions";
import FilterBar from "../../components/FilterBar";
import FilterHeadline from "../../components/FilterHeadline";
import FilterInputText from "../../components/FilterInputText";
import InternalStorageMixin from "../../mixins/InternalStorageMixin";
import Page from "../../components/Page";
import StringUtil from "../../utils/StringUtil";
import TableUtil from "../../utils/TableUtil";
import UsersActionsModal from "../../components/modals/UsersActionsModal";
import UserFormModal from "../../components/modals/UserFormModal";
import UsersStore from "../../stores/UsersStore";

const USERS_CHANGE_EVENTS = [
  "onUserStoreCreateSuccess",
  "onUserStoreDeleteSuccess"
];

const METHODS_TO_BIND = [
  "getTableRowOptions",
  "handleActionSelection",
  "handleActionSelectionClose",
  "handleCheckboxChange",
  "handleHeadingCheckboxChange",
  "handleNewUserClick",
  "handleNewUserClose",
  "handleSearchStringChange",
  "renderCheckbox",
  "renderFullName",
  "renderHeadingCheckbox",
  "renderUsername",
  "resetFilter"
];

const UsersBreadcrumbs = () => {
  const crumbs = [
    <Breadcrumb key={0} title="Users">
      <BreadcrumbTextContent>
        <Link to="/organization/users">Users</Link>
      </BreadcrumbTextContent>
    </Breadcrumb>
  ];

  return <Page.Header.Breadcrumbs iconID="users" breadcrumbs={crumbs} />;
};

class OrganizationTab extends mixin(StoreMixin, InternalStorageMixin) {
  constructor() {
    super(arguments);

    this.store_listeners = [
      {
        name: "user",
        events: ["createSuccess", "deleteSuccess"],
        suppressUpdate: true
      }
    ];

    this.state = {
      checkableCount: 0,
      checkedCount: 0,
      openNewUserModal: false,
      showActionDropdown: false,
      searchString: "",
      selectedAction: null,
      usersStoreError: false,
      usersStoreSuccess: false
    };

    METHODS_TO_BIND.forEach(function(method) {
      this[method] = this[method].bind(this);
    }, this);

    Hooks.applyFilter(
      "organizationTabChangeEvents",
      USERS_CHANGE_EVENTS
    ).forEach(event => {
      this[event] = this.onUsersChange;
    });

    this.internalStorage_update({ selectedIDSet: {} });
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

    if (
      prevState.searchString !== this.state.searchString ||
      prevProps.items.length !== this.props.items.length
    ) {
      this.resetTablewideCheckboxTabulations();
    }
  }

  onUsersChange() {
    UsersStore.fetchUsers();
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
    const isChecked = eventObject.fieldValue;
    const checkedCount = this.state.checkedCount + (isChecked || -1);
    const selectedIDSet = this.internalStorage_get().selectedIDSet;

    selectedIDSet[eventObject.fieldName] = isChecked;
    this.internalStorage_update({ selectedIDSet });

    this.setState({
      checkedCount,
      showActionDropdown: checkedCount > 0
    });
  }

  handleHeadingCheckboxChange(prevCheckboxState, eventObject) {
    const isChecked = eventObject.fieldValue;
    this.bulkCheck(isChecked);
  }

  handleSearchStringChange(searchString = "") {
    this.setState({ searchString });
    this.bulkCheck(false);
  }

  handleNewUserClick() {
    this.setState({ openNewUserModal: true });
  }

  handleNewUserClose() {
    this.setState({ openNewUserModal: false });
  }

  renderFullName(prop, subject) {
    return subject.get("description");
  }

  renderUsername(prop, subject) {
    return (
      <div className="row">
        <div className="column-small-12 column-large-12 column-x-large-12 text-overflow">
          {subject.get("uid")}
        </div>
      </div>
    );
  }

  renderCheckbox(prop, row) {
    const rowID = row[this.props.itemID];
    const remoteIDSet = this.internalStorage_get().remoteIDSet;
    const { checkableCount, checkedCount } = this.state;
    const disabled = remoteIDSet[rowID] === true;
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
        definition={[
          {
            checked,
            disabled,
            value: checked,
            fieldType: "checkbox",
            labelClass: "form-row-element form-element-checkbox",
            name: rowID,
            showLabel: false
          }
        ]}
        onChange={this.handleCheckboxChange}
      />
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
            fieldType: "checkbox",
            indeterminate,
            labelClass: "form-row-element form-element-checkbox",
            name: "headingCheckbox",
            showLabel: false
          }
        ]}
        onChange={this.handleHeadingCheckboxChange}
      />
    );
  }

  getColGroup() {
    return (
      <colgroup>
        <col style={{ width: "40px" }} />
        <col />
      </colgroup>
    );
  }

  getClassName(prop, sortBy, row) {
    return classNames({
      clickable: row == null // this is a header
    });
  }

  getColumns() {
    const { getClassName } = this;

    return [
      {
        className: getClassName,
        headerClassName: getClassName,
        prop: "selected",
        render: this.renderCheckbox,
        sortable: false,
        heading: this.renderHeadingCheckbox
      },
      {
        cacheCell: true,
        className: getClassName,
        headerClassName: getClassName,
        prop: "uid",
        render: this.renderUsername,
        sortable: true,
        sortFunction: TableUtil.getSortFunction(this.props.itemID, function(
          item,
          prop
        ) {
          return item.get(prop);
        }),
        heading: ResourceTableUtil.renderHeading({ uid: "USERNAME" })
      }
    ];
  }

  getActionDropdown(itemName) {
    if (!this.state.showActionDropdown) {
      return null;
    }

    const actionPhrases = BulkOptions[itemName];
    let initialID = null;

    // Get first Action to set as initially selected option in dropdown.
    initialID = Object.keys(actionPhrases)[0] || null;

    const dropdownItems = this.getActionsDropdownItems(actionPhrases);
    if (dropdownItems.length === 1) {
      return (
        <button
          className="button"
          onClick={this.handleActionSelection.bind(this, dropdownItems[0])}
        >
          {dropdownItems[0].html}
        </button>
      );
    }

    return (
      <li>
        <Dropdown
          buttonClassName="button dropdown-toggle"
          dropdownMenuClassName="dropdown-menu"
          dropdownMenuListClassName="dropdown-menu-list"
          dropdownMenuListItemClassName="clickable"
          initialID={initialID}
          items={dropdownItems}
          onItemSelection={this.handleActionSelection}
          scrollContainer=".gm-scroll-view"
          scrollContainerParentSelector=".gm-prevented"
          transition={true}
          transitionName="dropdown-menu"
          wrapperClassName="dropdown"
        />
      </li>
    );
  }

  getActionsDropdownItems(actionPhrases) {
    return Object.keys(actionPhrases).map(function(action) {
      return {
        html: actionPhrases[action].dropdownOption,
        id: action,
        selectedHtml: "Actions"
      };
    });
  }

  getCheckedItemObjects(items, itemIDName) {
    if (this.state.selectedAction) {
      const checkboxStates = this.internalStorage_get().selectedIDSet;
      const selectedItems = {};

      Object.keys(checkboxStates).forEach(function(id) {
        if (checkboxStates[id] === true) {
          selectedItems[id] = true;
        }
      });

      return items.filter(function(item) {
        const itemID = item[itemIDName];

        return selectedItems[itemID] || false;
      });
    } else {
      return null;
    }
  }

  getVisibleItems(items) {
    let { searchString } = this.state;
    searchString = searchString.toLowerCase();

    if (searchString !== "") {
      return items.filter(item => {
        const description = item.get("description").toLowerCase();
        const id = item.get(this.props.itemID).toLowerCase();

        return (
          description.indexOf(searchString) > -1 ||
          id.indexOf(searchString) > -1
        );
      });
    }

    return items;
  }

  getActionsModal(action, items, itemID, itemName) {
    if (action === null) {
      return null;
    }

    const checkedItemObjects = this.getCheckedItemObjects(items, itemID) || [];

    return (
      <UsersActionsModal
        action={action}
        actionText={BulkOptions[itemName][action]}
        bodyClass="modal-content allow-overflow"
        itemID={itemID}
        itemType={itemName}
        onClose={this.handleActionSelectionClose}
        selectedItems={checkedItemObjects}
      />
    );
  }

  getTableRowOptions(row) {
    const selectedIDSet = this.internalStorage_get().selectedIDSet;
    if (selectedIDSet[row[this.props.itemID]]) {
      return { className: "selected" };
    }

    return {};
  }

  bulkCheck(isChecked) {
    let checkedCount = 0;
    const selectedIDSet = this.internalStorage_get().selectedIDSet;

    Object.keys(selectedIDSet).forEach(function(id) {
      selectedIDSet[id] = isChecked;
    });
    this.internalStorage_update({ selectedIDSet });

    if (isChecked) {
      checkedCount = this.state.checkableCount;
    }

    this.setState({
      checkedCount,
      showActionDropdown: checkedCount > 0
    });
  }

  resetTablewideCheckboxTabulations() {
    let { items, itemID } = this.props;
    items = this.getVisibleItems(items);
    const selectedIDSet = {};
    const remoteIDSet = {};
    let checkableCount = 0;

    // Initializing hash of items' IDs and corresponding checkbox state.
    items.forEach(function(item) {
      const id = item.get(itemID);
      checkableCount += 1;
      selectedIDSet[id] = false;
    });

    this.internalStorage_update({ selectedIDSet, remoteIDSet });
    this.setState({ checkableCount });
  }

  resetFilter() {
    this.setState({ searchString: "" });
  }

  render() {
    const { items, itemID, itemName } = this.props;
    const state = this.state;
    const action = state.selectedAction;
    const capitalizedItemName = StringUtil.capitalize(itemName);
    const visibleItems = this.getVisibleItems(items);
    const actionDropdown = this.getActionDropdown(itemName);
    const actionsModal = this.getActionsModal(action, items, itemID, itemName);
    const sortProp = itemID;

    return (
      <Page>
        <Page.Header
          breadcrumbs={<UsersBreadcrumbs />}
          addButton={{
            onItemSelect: this.handleNewUserClick,
            label: `New ${capitalizedItemName}`
          }}
        />
        <div className="flex-container-col">
          <div className={`${itemName}s-table-header`}>
            <FilterHeadline
              onReset={this.resetFilter}
              name={capitalizedItemName}
              currentLength={visibleItems.length}
              totalLength={items.length}
            />
            <FilterBar>
              <FilterInputText
                className="flush-bottom"
                searchString={this.state.searchString}
                handleFilterChange={this.handleSearchStringChange}
              />
              {actionDropdown}
              {actionsModal}
            </FilterBar>
          </div>
          <div className="page-body-content-fill flex-grow flex-container-col">
            <Table
              buildRowOptions={this.getTableRowOptions}
              className="table table-borderless-outer
                table-borderless-inner-columns flush-bottom"
              columns={this.getColumns()}
              colGroup={this.getColGroup()}
              containerSelector=".gm-scroll-view"
              data={visibleItems}
              itemHeight={TableUtil.getRowHeight()}
              sortBy={{ prop: sortProp, order: "asc" }}
            />
          </div>
        </div>
        <UserFormModal
          open={this.state.openNewUserModal}
          onClose={this.handleNewUserClose}
        />
      </Page>
    );
  }
}

OrganizationTab.propTypes = {
  items: React.PropTypes.array.isRequired,
  itemID: React.PropTypes.string.isRequired,
  itemName: React.PropTypes.string.isRequired
};

module.exports = OrganizationTab;
