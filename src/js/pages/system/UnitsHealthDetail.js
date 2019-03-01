import { Trans, t } from "@lingui/macro";
import { withI18n } from "@lingui/react";
import mixin from "reactjs-mixin";
import { Link } from "react-router";
/* eslint-disable no-unused-vars */
import React from "react";
/* eslint-enable no-unused-vars */
import { StoreMixin } from "mesosphere-shared-reactjs";
import { ProductIcons } from "@dcos/ui-kit/dist/packages/icons/dist/product-icons-enum";

import Breadcrumb from "../../components/Breadcrumb";
import BreadcrumbTextContent from "../../components/BreadcrumbTextContent";
import FilterBar from "../../components/FilterBar";
import FilterHeadline from "../../components/FilterHeadline";
import FilterInputText from "../../components/FilterInputText";
import Loader from "../../components/Loader";
import Page from "../../components/Page";
import RequestErrorMsg from "../../components/RequestErrorMsg";
import UnitHealthDropdown from "../../components/UnitHealthDropdown";
import UnitHealthNodesTable from "../../components/UnitHealthNodesTable";
import UnitHealthStore from "../../stores/UnitHealthStore";

const UnitHealthDetailBreadcrumbs = ({ unit }) => {
  const crumbs = [
    <Breadcrumb key={0} title="Components">
      <BreadcrumbTextContent>
        <Trans render={<Link to="/components" />}>Components</Trans>
      </BreadcrumbTextContent>
    </Breadcrumb>
  ];

  if (unit != null) {
    const healthStatus = unit.getHealth();
    const unitTitle = unit.getTitle();

    crumbs.push(
      <Breadcrumb key={0} title="Components">
        <BreadcrumbTextContent>
          <Link to={`/components/${unit.get("id")}`}>
            {`${unitTitle} `}
            <span className={healthStatus.classNames}>
              ({healthStatus.title})
            </span>
          </Link>
        </BreadcrumbTextContent>
      </Breadcrumb>
    );
  }

  return (
    <Page.Header.Breadcrumbs
      iconID={ProductIcons.Components}
      breadcrumbs={crumbs}
    />
  );
};

const METHODS_TO_BIND = [
  "handleHealthSelection",
  "handleSearchStringChange",
  "resetFilter"
];

class UnitsHealthDetail extends mixin(StoreMixin) {
  constructor() {
    super(...arguments);

    this.store_listeners = [
      {
        name: "unitHealth",
        events: ["unitSuccess", "unitError", "nodesSuccess", "nodesError"],
        suppressUpdate: true
      }
    ];

    this.state = {
      hasError: false,
      healthFilter: "all",
      isLoadingUnit: true,
      isLoadingNodes: true,
      searchString: ""
    };

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  componentDidMount() {
    super.componentDidMount();

    UnitHealthStore.fetchUnit(this.props.params.unitID);
    UnitHealthStore.fetchUnitNodes(this.props.params.unitID);
  }

  onUnitHealthStoreUnitSuccess() {
    this.setState({ isLoadingUnit: false });
  }

  onUnitHealthStoreUnitError() {
    this.setState({ hasError: true });
  }

  onUnitHealthStoreNodesSuccess() {
    this.setState({ isLoadingNodes: false });
  }

  onUnitHealthStoreNodeError() {
    this.setState({ hasError: true });
  }

  handleHealthSelection(selectedHealth) {
    this.setState({ healthFilter: selectedHealth.id });
  }

  handleSearchStringChange(searchString = "") {
    this.setState({ searchString });
  }

  resetFilter() {
    if (this.healthFilter !== null && this.healthFilter.dropdown !== null) {
      this.healthFilter.setDropdownValue("all");
    }

    this.setState({
      searchString: "",
      healthFilter: "all"
    });
  }

  getErrorNotice() {
    return (
      <div className="pod">
        <RequestErrorMsg />
      </div>
    );
  }

  getLoadingScreen() {
    return <Loader />;
  }

  getNodesTable(unit, visibleData) {
    return (
      <UnitHealthNodesTable nodes={visibleData} params={this.props.params} />
    );
  }

  getUnit() {
    const { hasError, isLoadingUnit, isLoadingNodes } = this.state;

    if (hasError) {
      return null;
    }

    if (isLoadingUnit || isLoadingNodes) {
      return null;
    }

    return UnitHealthStore.getUnit(this.props.params.unitID);
  }

  getVisibleData(data, searchString, healthFilter) {
    return data.filter({ ip: searchString, health: healthFilter }).getItems();
  }

  getContent() {
    const {
      healthFilter,
      searchString,
      hasError,
      isLoadingUnit,
      isLoadingNodes
    } = this.state;
    const { i18n } = this.props;

    if (hasError) {
      return this.getErrorNotice();
    }

    if (isLoadingUnit || isLoadingNodes) {
      return this.getLoadingScreen();
    }

    const nodes = UnitHealthStore.getNodes(this.props.params.unitID);
    const visibleData = this.getVisibleData(nodes, searchString, healthFilter);

    return (
      <div className="flex-container-col">
        {/* L10NTODO: Pluralize
        We should pluralize FilterHeadline name here using lingui macro instead of
        doing it manually in FilterHeadline */}
        <FilterHeadline
          currentLength={visibleData.length}
          isFiltering={healthFilter !== "all" || searchString !== ""}
          name={i18n._(t`Health Check`)}
          onReset={this.resetFilter}
          totalLength={nodes.getItems().length}
        />
        <FilterBar>
          <div className="form-group flush-bottom">
            <FilterInputText
              className="flush-bottom"
              searchString={searchString}
              handleFilterChange={this.handleSearchStringChange}
            />
          </div>
          <UnitHealthDropdown
            className="button dropdown-toggle text-align-left"
            dropdownMenuClassName="dropdown-menu"
            initialID="all"
            onHealthSelection={this.handleHealthSelection}
            ref={ref => (this.healthFilter = ref)}
          />
        </FilterBar>
        <div className="flex-container-col flex-grow no-overflow">
          {this.getNodesTable(this.getUnit(), visibleData)}
        </div>
      </div>
    );
  }

  render() {
    return (
      <Page>
        <Page.Header
          breadcrumbs={<UnitHealthDetailBreadcrumbs unit={this.getUnit()} />}
        />
        {this.getContent()}
      </Page>
    );
  }
}

module.exports = withI18n()(UnitsHealthDetail);
