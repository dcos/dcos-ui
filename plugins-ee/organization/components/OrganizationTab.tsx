import { i18nMark } from "@lingui/react";
import { Trans } from "@lingui/macro";
import classNames from "classnames";
import { Dropdown, Form, Table, Tooltip } from "reactjs-components";
import { Link } from "react-router";
import PropTypes from "prop-types";
import * as React from "react";

import { Badge } from "@dcos/ui-kit";
import FilterBar from "#SRC/js/components/FilterBar";
import FilterHeadline from "#SRC/js/components/FilterHeadline";
import FilterInputText from "#SRC/js/components/FilterInputText";
import ResourceTableUtil from "#SRC/js/utils/ResourceTableUtil";
import StringUtil from "#SRC/js/utils/StringUtil";
import TableUtil from "#SRC/js/utils/TableUtil";

import AuthUtil from "../utils/AuthUtil";
import BulkOptions from "../constants/BulkOptions";
import GroupsActionsModal from "../submodules/groups/components/modals/GroupsActionsModal";
import ServiceAccountsActionsModal from "../submodules/service-accounts/components/ServiceAccountsActionsModal";
import UsersActionsModal from "../submodules/users/components/modals/UsersActionsModal";

function hypenize(str) {
  return str.replace(/[A-Z]/g, x => `-${x.toLowerCase()}`);
}

export default class OrganizationTab extends React.Component {
  static propTypes = {
    items: PropTypes.array.isRequired,
    itemID: PropTypes.string.isRequired,
    itemName: PropTypes.string.isRequired
  };
  constructor() {
    super();

    this.state = {
      checkableCount: 0,
      checkedCount: 0,
      showActionDropdown: false,
      searchFilter: "all",
      searchString: "",
      selectedAction: null
    };

    this.selectedIDSet = {};
  }

  UNSAFE_componentWillMount() {
    this.resetTablewideCheckboxTabulations();
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.items.length !== this.props.items.length) {
      this.resetTablewideCheckboxTabulations();
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      prevState.searchFilter !== this.state.searchFilter ||
      prevState.searchString !== this.state.searchString ||
      prevProps.items.length !== this.props.items.length
    ) {
      this.resetTablewideCheckboxTabulations();
    }
  }

  handleActionSelection = dropdownItem => {
    this.setState({
      selectedAction: dropdownItem.id
    });
  };

  handleActionSelectionClose = () => {
    this.setState({
      selectedAction: null
    });
    this.bulkCheck(false);
  };

  handleCheckboxChange = (prevCheckboxState, eventObject) => {
    const isChecked = eventObject.fieldValue;
    const checkedCount = this.state.checkedCount + (isChecked || -1);
    const selectedIDSet = this.selectedIDSet;

    selectedIDSet[eventObject.fieldName] = isChecked;
    this.selectedIDSet = selectedIDSet;

    this.setState({
      checkedCount,
      showActionDropdown: checkedCount > 0
    });
  };

  handleHeadingCheckboxChange = (prevCheckboxState, eventObject) => {
    const isChecked = eventObject.fieldValue;
    this.bulkCheck(isChecked);
  };

  handleSearchStringChange = (searchString = "") => {
    this.setState({ searchString });
    this.bulkCheck(false);
  };

  renderDescription = (prop, subject) => {
    const isRemote = AuthUtil.isSubjectRemote(subject);
    const itemName = hypenize(this.props.itemName);
    let label = subject.get(prop);
    const subjectID = subject.get(this.props.itemID);

    if (isRemote) {
      label = subject.get(this.props.itemID);
    }

    return (
      <Link
        to={`/organization/${itemName}s/${subjectID}`}
        className="table-cell-link-secondary"
      >
        {label}
      </Link>
    );
  };

  renderID = (prop, subject) => {
    let badge = null;
    const itemName = hypenize(this.props.itemName);
    const subjectID = subject.get(this.props.itemID);
    let nameColClassnames = "column-12 text-overflow";

    if (AuthUtil.isSubjectRemote(subject)) {
      nameColClassnames = "column-9 column-jumbo-10 text-overflow";
      badge = (
        <div className="column-3 column-jumbo-2 text-align-right">
          <Tooltip content="This user has been imported from an external identity provider.">
            <Badge>
              <Trans render="span">External</Trans>
            </Badge>
          </Tooltip>
        </div>
      );
    }

    return (
      <div className="row flex">
        <div className={nameColClassnames}>
          <Link
            className="table-cell-link-primary"
            to={`/organization/${itemName}s/${subjectID}`}
          >
            {subject.get(prop)}
          </Link>
        </div>
        {badge}
      </div>
    );
  };

  renderCheckbox = (prop, row) => {
    const rowID = row[this.props.itemID];
    const { checkableCount, checkedCount } = this.state;
    let checked = null;

    if (checkedCount === 0) {
      checked = false;
    } else if (checkedCount === checkableCount) {
      checked = true;
    } else {
      checked = this.selectedIDSet[rowID];
    }

    return (
      <Form
        className="table-form-checkbox"
        formGroupClass="form-group flush-bottom"
        definition={[
          {
            checked,
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
  };

  renderHeadingCheckbox = () => {
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
        className="table-form-checkbox"
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
  };

  getColGroup(itemName) {
    switch (itemName) {
      case "group":
        return (
          <colgroup>
            <col style={{ width: "40px" }} />
            <col />
          </colgroup>
        );
      case "serviceAccount":
        return (
          <colgroup>
            <col style={{ width: "40px" }} />
            <col />
            <col />
          </colgroup>
        );
      case "user":
        return (
          <colgroup>
            <col style={{ width: "40px" }} />
            <col style={{ width: "45%" }} />
            <col />
          </colgroup>
        );
      default:
        return null;
    }
  }

  getGroupsClassName(prop, sortBy, row) {
    return classNames({
      clickable: row == null // this is a header
    });
  }

  getColumns(itemName) {
    let className = ResourceTableUtil.getClassName;
    const columns = [
      {
        className,
        headerClassName: className,
        prop: "selected",
        render: this.renderCheckbox,
        sortable: false,
        heading: this.renderHeadingCheckbox
      }
    ];
    const sortFunction = TableUtil.getSortFunction(
      this.props.itemID,
      (item, prop) => item.get(prop)
    );

    switch (itemName) {
      case "group":
        className = this.getGroupsClassName;
        columns.push({
          className,
          headerClassName: className,
          prop: "gid",
          render: this.renderID,
          sortable: true,
          sortFunction,
          heading: ResourceTableUtil.renderHeading({ gid: "ID" })
        });
        break;

      case "user":
      case "serviceAccount":
        let uid = "ID";
        if (itemName === "user") {
          uid = "Username";
        }
        columns.push(
          {
            cacheCell: true,
            className,
            headerClassName: className,
            prop: "uid",
            render: this.renderID,
            sortable: true,
            sortFunction,
            heading: ResourceTableUtil.renderHeading({ uid })
          },
          {
            className,
            headerClassName: className,
            prop: "description",
            render: this.renderDescription,
            sortable: true,
            sortFunction,
            heading: ResourceTableUtil.renderHeading({
              description:
                itemName === "user"
                  ? i18nMark("Full Name")
                  : i18nMark("Description")
            })
          }
        );
        break;
    }

    return columns;
  }

  getActionDropdown(itemName) {
    if (!this.state.showActionDropdown) {
      return null;
    }

    const actionPhrases = BulkOptions[itemName];
    let initialID = null;

    // Get first Action to set as initially selected option in dropdown.
    initialID = Object.keys(actionPhrases)[0] || null;

    return (
      <Dropdown
        anchorRight={true}
        buttonClassName="button dropdown-toggle"
        dropdownMenuClassName="dropdown-menu"
        dropdownMenuListClassName="dropdown-menu-list"
        dropdownMenuListItemClassName="clickable"
        initialID={initialID}
        items={this.getActionsDropdownItems(actionPhrases)}
        onItemSelection={this.handleActionSelection}
        scrollContainer=".gm-scroll-view"
        scrollContainerParentSelector=".gm-prevented"
        transition={true}
        transitionName="dropdown-menu"
        wrapperClassName="dropdown"
      />
    );
  }

  getActionsDropdownItems(actionPhrases) {
    return Object.keys(actionPhrases).map(action => ({
      html: actionPhrases[action].dropdownOption,
      id: action,
      selectedHtml: "Actions"
    }));
  }

  getCheckedItemObjects(items, itemIDName) {
    if (this.state.selectedAction) {
      const checkboxStates = this.selectedIDSet;
      const selectedItems = {};

      Object.keys(checkboxStates).forEach(id => {
        if (checkboxStates[id] === true) {
          selectedItems[id] = true;
        }
      });

      return items.filter(item => {
        const itemID = item[itemIDName];

        return selectedItems[itemID] || false;
      });
    }
    return null;
  }

  getVisibleItems(items) {
    let { searchFilter, searchString } = this.state;
    searchString = searchString.toLowerCase();

    switch (searchFilter) {
      case "all":
        break;
      case "local":
        items = items.filter(item => !AuthUtil.isSubjectRemote(item));
        break;
      case "external":
        items = items.filter(item => AuthUtil.isSubjectRemote(item));
        break;
    }

    if (searchString !== "") {
      return items.filter(item => {
        let description = item.getDescription().toLowerCase();
        const id = item.get(this.props.itemID).toLowerCase();

        if (AuthUtil.isSubjectRemote(item)) {
          description = "";
        }

        return (
          description.indexOf(searchString) > -1 ||
          id.indexOf(searchString) > -1
        );
      });
    }

    return items;
  }

  getActionsModal(action, items, itemID, itemType) {
    if (action === null) {
      return null;
    }

    const selectedItems = this.getCheckedItemObjects(items, itemID) || [];
    const actionModalProps = {
      action,
      actionText: BulkOptions[itemType][action],
      bodyClass: "modal-content allow-overflow",
      itemID,
      itemType,
      onClose: this.handleActionSelectionClose,
      selectedItems
    };
    switch (itemType) {
      case "group":
        return <GroupsActionsModal {...actionModalProps} />;

      case "serviceAccount":
        return <ServiceAccountsActionsModal {...actionModalProps} />;

      case "user":
        return <UsersActionsModal {...actionModalProps} />;

      default:
        return null;
    }
  }

  getSearchFilterChangeHandler(searchFilter) {
    return () => {
      this.bulkCheck(false);
      this.setState({ searchFilter });
    };
  }

  getFilterButtons(items) {
    if (this.props.itemName !== "user") {
      return null;
    }

    const external = items.filter(AuthUtil.isSubjectRemote);
    const numbers = {
      all: items.length,
      local: items.length - external.length,
      external: external.length
    };

    const currentFilter = this.state.searchFilter;

    const buttons = Object.entries(numbers).map(([filter, number]) => {
      const classSet = classNames("button button-outline", {
        active: filter === currentFilter
      });

      return (
        <button
          key={filter}
          className={classSet}
          onClick={this.getSearchFilterChangeHandler(filter)}
        >
          {StringUtil.capitalize(filter)} ({number})
        </button>
      );
    });

    return <div className="button-group flush-bottom">{buttons}</div>;
  }

  getTableRowOptions = row => {
    const selectedIDSet = this.selectedIDSet;
    if (selectedIDSet[row[this.props.itemID]]) {
      return { className: "selected" };
    }

    return {};
  };

  bulkCheck(isChecked) {
    let checkedCount = 0;
    const selectedIDSet = this.selectedIDSet;

    Object.keys(selectedIDSet).forEach(id => {
      selectedIDSet[id] = isChecked;
    });
    this.selectedIDSet = selectedIDSet;

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
    let checkableCount = 0;

    // Initializing hash of items' IDs and corresponding checkbox state.
    items.forEach(item => {
      const id = item.get(itemID);

      checkableCount += 1;
      selectedIDSet[id] = false;
    });

    this.selectedIDSet = selectedIDSet;
    this.setState({ checkableCount });
  }

  resetFilter = () => {
    this.setState({
      searchString: "",
      searchFilter: "all"
    });
  };

  render() {
    const { items, itemID, itemName } = this.props;
    const {
      selectedAction,
      searchFilter,
      searchString,
      showActionDropdown
    } = this.state;
    let capitalizedItemName = StringUtil.capitalize(itemName);
    const columns = this.getColumns(itemName);
    const visibleItems = this.getVisibleItems(items);
    const filterButtons = this.getFilterButtons(visibleItems);
    const actionDropdown = this.getActionDropdown(itemName);
    const actionsModal = this.getActionsModal(
      selectedAction,
      items,
      itemID,
      itemName
    );
    // Pick the first column after the checkbox to default sort to
    const sortProp = columns[1].prop;
    let rightAlignLastNChildren = 0;

    if (itemName === "serviceAccount") {
      capitalizedItemName = "Service Account";
    }

    if (showActionDropdown) {
      rightAlignLastNChildren = 1;
    }

    return (
      <div className="flex-container-col">
        <div className={`${itemName}s-table-header`}>
          <FilterHeadline
            currentLength={visibleItems.length}
            isFiltering={searchFilter !== "all" || searchString !== ""}
            name={capitalizedItemName}
            onReset={this.resetFilter}
            totalLength={items.length}
          />
          <FilterBar rightAlignLastNChildren={rightAlignLastNChildren}>
            <FilterInputText
              className="flush-bottom"
              searchString={searchString}
              handleFilterChange={this.handleSearchStringChange}
            />
            {filterButtons}
            {actionDropdown}
          </FilterBar>
          {actionsModal}
        </div>
        <div className="page-content-fill flex-grow flex-container-col">
          <Table
            buildRowOptions={this.getTableRowOptions}
            className="table table-flush table-borderless-outer
              table-borderless-inner-columns table-hover flush-bottom"
            columns={columns}
            colGroup={this.getColGroup(itemName)}
            containerSelector=".gm-scroll-view"
            data={visibleItems}
            itemHeight={TableUtil.getRowHeight()}
            sortBy={{ prop: sortProp, order: "asc" }}
          />
        </div>
      </div>
    );
  }
}
