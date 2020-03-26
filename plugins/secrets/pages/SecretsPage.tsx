import { i18nMark } from "@lingui/react";
import { Trans } from "@lingui/macro";
import { Dropdown } from "reactjs-components";
import mixin from "reactjs-mixin";
import { Link } from "react-router";
import * as React from "react";
import { Icon } from "@dcos/ui-kit";
import { ProductIcons } from "@dcos/ui-kit/dist/packages/icons/dist/product-icons-enum";
import { iconSizeS } from "@dcos/ui-kit/dist/packages/design-tokens/build/js/designTokens";

import Breadcrumb from "#SRC/js/components/Breadcrumb";
import BreadcrumbTextContent from "#SRC/js/components/BreadcrumbTextContent";
import FilterBar from "#SRC/js/components/FilterBar";
import FilterHeadline from "#SRC/js/components/FilterHeadline";
import FilterInputText from "#SRC/js/components/FilterInputText";
import Loader from "#SRC/js/components/Loader";
import Page from "#SRC/js/components/Page";
import RequestErrorMsg from "#SRC/js/components/RequestErrorMsg";
import StoreMixin from "#SRC/js/mixins/StoreMixin";
import StringUtil from "#SRC/js/utils/StringUtil";
import UserActions from "#SRC/js/constants/UserActions";

import SealedStoreAlert from "../components/SealedStoreAlert";
import SecretActionsModal from "../components/SecretActionsModal";
import SecretFormModal from "../components/SecretFormModal";
import SecretsTable from "../components/SecretsTable";
import getSecretStore from "../stores/SecretStore";
import SecretsError from "../components/SecretsError";
import EmptySecretsTable from "../components/EmptySecretsTable";

const SecretStore = getSecretStore();

const SECRET_DROPDOWN_ACTIONS = [
  {
    html: StringUtil.capitalize(UserActions.DELETE),
    id: UserActions.DELETE,
    selectedHtml: "Actions",
  },
];

const SecretsBreadcrumbs = () => {
  const crumbs = [
    <Breadcrumb key={0} title="Secrets">
      <BreadcrumbTextContent>
        <Trans render={<Link to="/secrets" />}>Secrets</Trans>
      </BreadcrumbTextContent>
    </Breadcrumb>,
  ];

  return (
    <Page.Header.Breadcrumbs iconID={ProductIcons.Lock} breadcrumbs={crumbs} />
  );
};

const PermissionErrorMessage = () => {
  const header = "Permission denied";
  const message = (
    <Trans render="p" className="text-align-center flush-bottom">
      You do not have permission to list this cluster's secrets.
      <br />
      Please contact your super admin to learn more.
    </Trans>
  );

  return <RequestErrorMsg header={header} message={message} />;
};

class SecretsPage extends mixin(StoreMixin) {
  constructor(...args) {
    super(...args);

    this.state = {
      checkedItems: {},
      healthFilter: "all",
      isLoadingStores: true,
      isLoadingSecrets: true,
      requestErrorType: null,
      showActionDropdown: false,
      searchString: "",
      secretFormOpen: false,
      secretToRemove: null,
      selectedAction: "",
    };

    // prettier-ignore
    this.store_listeners = [
      {name: "secrets", events: ["storesSuccess", "secretsSuccess", "secretsError"]}
    ];
  }

  componentDidMount() {
    super.componentDidMount();
    SecretStore.fetchStores();
    SecretStore.fetchSecrets();
  }

  onSecretsStoreStoresSuccess() {
    this.setState({ isLoadingStores: false, requestErrorType: null });
  }

  onSecretsStoreSecretsSuccess() {
    this.setState({ isLoadingSecrets: false, requestErrorType: null });
  }

  onSecretsStoreSecretsError(error) {
    if (error.status === 403) {
      this.setState({ requestErrorType: "permission" });
    } else {
      this.setState({ requestErrorType: "failure" });
    }
  }
  handleActionSelection = (action) => {
    this.setState({ selectedAction: action.id });
  };
  handleHealthFilterChange = (healthFilter) => {
    this.setState({ healthFilter });
  };
  handleSearchStringChange = (searchString = "") => {
    this.setState({ searchString });
  };
  handleItemCheck = (idsChecked) => {
    this.setState({ checkedItems: idsChecked });
  };
  handleRemoveClick = (secret) => {
    this.setState({
      selectedAction: UserActions.DELETE,
      secretToRemove: secret,
    });
  };
  handleSecretFormOpen = () => {
    this.setState({ secretFormOpen: true });
  };
  handleSecretFormClose = () => {
    this.setState({ secretFormOpen: false });
  };
  handleActionClose = () => {
    this.setState({
      selectedAction: "",
      secretToRemove: false,
    });
  };
  handleActionSuccess = () => {
    const nextState = { selectedAction: "" };
    if (this.state.secretToRemove) {
      nextState.secretToRemove = false;
    } else {
      nextState.checkedItems = {};
    }
    SecretStore.fetchSecrets();
    this.setState(nextState);
  };
  resetFilter = () => {
    this.setState({ searchString: "", healthFilter: "all" });
  };

  getVisibleItems(items, searchString) {
    return items.filter((item) => item.getPath().includes(searchString));
  }

  getCheckedItems(items) {
    const { checkedItems } = this.state;

    return items.filter((item) => checkedItems[item.getPath()]);
  }

  getActionDropdown(checkedItems) {
    if (Object.keys(checkedItems).length === 0) {
      return null;
    }

    if (SECRET_DROPDOWN_ACTIONS.length === 1) {
      const buttonAction = SECRET_DROPDOWN_ACTIONS[0];

      return (
        <button
          className="button"
          onClick={this.handleActionSelection.bind(this, buttonAction)}
        >
          {buttonAction.html}
        </button>
      );
    }

    return (
      <Dropdown
        buttonClassName="button dropdown-toggle"
        dropdownMenuClassName="dropdown-menu"
        dropdownMenuListClassName="dropdown-menu-list"
        dropdownMenuListItemClassName="clickable"
        initialID={UserActions.DELETE}
        items={SECRET_DROPDOWN_ACTIONS}
        onItemSelection={this.handleActionSelection}
        scrollContainer=".gm-scroll-view"
        scrollContainerParentSelector=".gm-prevented"
        transition={true}
        transitionName="dropdown-menu"
        wrapperClassName="dropdown"
      />
    );
  }

  getActionItems(secrets) {
    let actionItems = [this.state.secretToRemove];
    if (!actionItems[0]) {
      actionItems = this.getCheckedItems(secrets);
    }

    return actionItems;
  }

  render() {
    const {
      checkedItems,
      healthFilter,
      isLoadingStores,
      isLoadingSecrets,
      requestErrorType,
      searchString,
      secretFormOpen,
      selectedAction,
    } = this.state;

    if (requestErrorType !== null) {
      return (
        <SecretsError
          type={requestErrorType}
          open={secretFormOpen}
          openModal={this.handleSecretFormOpen}
          closeModal={this.handleSecretFormClose}
          breadcrumbs={<SecretsBreadcrumbs />}
          permissionErrorMessage={<PermissionErrorMessage />}
        />
      );
    }

    if (isLoadingStores && isLoadingSecrets) {
      return (
        <Page>
          <Page.Header breadcrumbs={<SecretsBreadcrumbs />} />
          <Loader />
        </Page>
      );
    }

    const secrets =
      requestErrorType === "permission" ? [] : SecretStore.getSecrets();

    const visibleItems = this.getVisibleItems(secrets, searchString);

    const secretStores = SecretStore.getStores();
    if (secretStores && secretStores.getSealedCount() > 0) {
      return (
        <Page>
          <Page.Header breadcrumbs={<SecretsBreadcrumbs />} />
          <SealedStoreAlert />
        </Page>
      );
    }

    return (
      <Page dontScroll={true} flushBottom={true}>
        <Page.Header
          breadcrumbs={<SecretsBreadcrumbs />}
          addButton={{
            onItemSelect: this.handleSecretFormOpen,
            label: i18nMark("New Secret"),
          }}
        />
        <div className="flex-item-grow-1 flex flex-direction-top-to-bottom">
          {secrets.length ? (
            <React.Fragment>
              <div className="users-table-header">
                <FilterHeadline
                  currentLength={visibleItems.length}
                  isFiltering={healthFilter !== "all" || searchString !== ""}
                  name="Secret"
                  onReset={this.resetFilter}
                  totalLength={secrets.length}
                />
                <FilterBar>
                  <FilterInputText
                    className="flush-bottom"
                    searchString={searchString}
                    handleFilterChange={this.handleSearchStringChange}
                  />
                  {this.getActionDropdown(checkedItems)}
                </FilterBar>
              </div>
              <div className="flex-grow flex-container-col table-wrapper">
                <SecretsTable
                  data={visibleItems}
                  onChange={this.handleItemCheck}
                  selected={checkedItems}
                  onRemoveClick={this.handleRemoveClick}
                />
              </div>
            </React.Fragment>
          ) : (
            <EmptySecretsTable
              handleSecretFormOpen={this.handleSecretFormOpen}
            />
          )}
          <SecretFormModal
            onClose={this.handleSecretFormClose}
            open={secretFormOpen}
          />
          <SecretActionsModal
            itemID="path"
            action={selectedAction}
            onClose={this.handleActionClose}
            onSuccess={this.handleActionSuccess}
            selectedItems={this.getActionItems(secrets)}
            open={!!selectedAction}
          />
        </div>
      </Page>
    );
  }
}

SecretsPage.routeConfig = {
  icon: <Icon shape={ProductIcons.LockInverse} size={iconSizeS} />,
  label: i18nMark("Secrets"),
  matches: /^\/secrets/,
};

export default SecretsPage;
