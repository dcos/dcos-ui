import classNames from "classnames";
import { Link } from "react-router";
import mixin from "reactjs-mixin";
/* eslint-disable no-unused-vars */
import React from "react";
/* eslint-enable no-unused-vars */
import { ResourceTableUtil } from "foundation-ui";
import { StoreMixin } from "mesosphere-shared-reactjs";
import { Table } from "reactjs-components";

import Breadcrumb from "../../components/Breadcrumb";
import BreadcrumbTextContent from "../../components/BreadcrumbTextContent";
import FilterBar from "../../components/FilterBar";
import FilterHeadline from "../../components/FilterHeadline";
import FilterButtons from "../../components/FilterButtons";
import FilterInputText from "../../components/FilterInputText";
import Page from "../../components/Page";
import StringUtil from "../../utils/StringUtil";
import TableUtil from "../../utils/TableUtil";
import UnitHealthStore from "../../stores/UnitHealthStore";
import UnitHealthUtil from "../../utils/UnitHealthUtil";

const UnitHealthBreadcrumbs = () => {
  const crumbs = [
    <Breadcrumb key={0} title="Components">
      <BreadcrumbTextContent>
        <Link to="/components">Components</Link>
      </BreadcrumbTextContent>
    </Breadcrumb>
  ];

  return <Page.Header.Breadcrumbs iconID="components" breadcrumbs={crumbs} />;
};

const METHODS_TO_BIND = [
  "handleHealthFilterChange",
  "handleSearchStringChange",
  "renderUnit",
  "renderHealth",
  "resetFilter"
];

class UnitsHealthTab extends mixin(StoreMixin) {
  constructor() {
    super(...arguments);

    this.store_listeners = [
      {
        name: "unitHealth",
        events: ["success", "error"],
        suppressUpdate: false
      }
    ];

    this.state = {
      healthFilter: "all",
      searchString: ""
    };

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    }, this);
  }

  componentDidMount() {
    super.componentDidMount();
    UnitHealthStore.fetchUnits();
  }

  handleSearchStringChange(searchString = "") {
    this.setState({ searchString });
  }

  renderUnit(prop, unit) {
    return (
      <div className="text-overflow">
        <Link
          to={`/components/${unit.get("id")}`}
          className="table-cell-link-primary"
        >
          {unit.getTitle()}
        </Link>
      </div>
    );
  }

  renderHealth(prop, unit) {
    const health = unit.getHealth();

    return (
      <span className={health.classNames}>
        {StringUtil.capitalize(health.title)}
      </span>
    );
  }

  getButtonContent(filterName, count) {
    const dotClassSet = classNames({
      dot: filterName !== "all",
      danger: filterName === "unhealthy",
      success: filterName === "healthy"
    });

    return (
      <span className="badge-container button-align-content label flush">
        <span className={dotClassSet} />
        <span className="badge-container-text">
          <span>{StringUtil.capitalize(filterName)}</span>
        </span>
        <span className="badge badge-rounded">{count || 0}</span>
      </span>
    );
  }

  getColGroup() {
    return (
      <colgroup>
        <col style={{ width: "75%" }} />
        <col style={{ width: "25%" }} />
      </colgroup>
    );
  }

  getColumns() {
    const classNameFn = ResourceTableUtil.getClassName;
    const sortFunction = UnitHealthUtil.getHealthSortFunction;

    return [
      {
        className: classNameFn,
        headerClassName: classNameFn,
        heading: ResourceTableUtil.renderHeading({ name: "NAME" }),
        prop: "name",
        render: this.renderUnit,
        sortable: true,
        sortFunction
      },
      {
        className: classNameFn,
        headerClassName: classNameFn,
        heading: ResourceTableUtil.renderHeading({ health: "HEALTH" }),
        prop: "health",
        render: this.renderHealth,
        sortable: true,
        sortFunction
      }
    ];
  }

  handleHealthFilterChange(healthFilter) {
    this.setState({ healthFilter });
  }

  getVisibleData(data, searchString, healthFilter) {
    return data
      .filter({ title: searchString, health: healthFilter })
      .getItems();
  }

  resetFilter() {
    this.setState({
      searchString: "",
      healthFilter: "all"
    });
  }

  render() {
    const data = UnitHealthStore.getUnits();
    const dataItems = data.getItems();
    const { healthFilter, searchString } = this.state;
    const visibleData = this.getVisibleData(data, searchString, healthFilter);
    const dataHealth = dataItems.map(function(unit) {
      return unit.getHealth();
    });

    return (
      <Page>
        <Page.Header breadcrumbs={<UnitHealthBreadcrumbs />} />
        <div className="flex-container-col">
          <div className="units-health-table-header">
            <FilterHeadline
              currentLength={visibleData.length}
              isFiltering={healthFilter !== "all" || searchString !== ""}
              name="Component"
              onReset={this.resetFilter}
              totalLength={dataItems.length}
            />
            <FilterBar rightAlignLastNChildren={1}>
              <FilterInputText
                className="flush-bottom"
                searchString={searchString}
                handleFilterChange={this.handleSearchStringChange}
              />
              <FilterButtons
                renderButtonContent={this.getButtonContent}
                filters={["all", "healthy", "unhealthy"]}
                filterByKey="title"
                onFilterChange={this.handleHealthFilterChange}
                itemList={dataHealth}
                selectedFilter={healthFilter}
              />
              <a
                href={UnitHealthStore.getDownloadURL()}
                className="button button-primary"
                target="_blank"
              >
                Download Snapshot
              </a>
            </FilterBar>
          </div>
          <div className="page-body-content-fill flex-grow flex-container-col">
            <Table
              className="table table-borderless-outer
                table-borderless-inner-columns flush-bottom"
              columns={this.getColumns()}
              colGroup={this.getColGroup()}
              containerSelector=".gm-scroll-view"
              data={visibleData}
              itemHeight={TableUtil.getRowHeight()}
              sortBy={{ prop: "health", order: "asc" }}
            />
          </div>
        </div>
      </Page>
    );
  }
}

UnitsHealthTab.routeConfig = {
  label: "Components",
  matches: /^\/components\/overview/
};

module.exports = UnitsHealthTab;
