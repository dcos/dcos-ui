import { Trans, t } from "@lingui/macro";
import { i18nMark, withI18n } from "@lingui/react";
import classNames from "classnames";
import { Link } from "react-router";
import mixin from "reactjs-mixin";
/* eslint-disable no-unused-vars */
import React from "react";
/* eslint-enable no-unused-vars */
import { StoreMixin } from "mesosphere-shared-reactjs";
import { Table } from "reactjs-components";
import { ProductIcons } from "@dcos/ui-kit/dist/packages/icons/dist/product-icons-enum";

import { Badge } from "@dcos/ui-kit";
import Breadcrumb from "../../components/Breadcrumb";
import BreadcrumbTextContent from "../../components/BreadcrumbTextContent";
import FilterBar from "../../components/FilterBar";
import FilterHeadline from "../../components/FilterHeadline";
import FilterButtons from "../../components/FilterButtons";
import FilterInputText from "../../components/FilterInputText";
import Page from "../../components/Page";
import ResourceTableUtil from "../../utils/ResourceTableUtil";
import StringUtil from "../../utils/StringUtil";
import TableUtil from "../../utils/TableUtil";
import UnitHealthStore from "../../stores/UnitHealthStore";
import UnitHealthUtil from "../../utils/UnitHealthUtil";

const UnitHealthBreadcrumbs = () => {
  const crumbs = [
    <Breadcrumb key={0} title="Components">
      <BreadcrumbTextContent>
        <Trans render={<Link to="/components" />}>Components</Trans>
      </BreadcrumbTextContent>
    </Breadcrumb>
  ];

  return (
    <Page.Header.Breadcrumbs
      iconID={ProductIcons.Components}
      breadcrumbs={crumbs}
    />
  );
};

const METHODS_TO_BIND = [
  "handleHealthFilterChange",
  "handleSearchStringChange",
  "renderUnit",
  "renderHealth",
  "resetFilter",
  "getButtonContent"
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

  getButtonContent(filterName, count, isActive) {
    const dotClassSet = classNames({
      dot: filterName !== "all",
      danger: filterName === "unhealthy",
      success: filterName === "healthy"
    });

    isActive = isActive ? "outline" : "default";

    return (
      <span className="badge-container button-align-content label flush">
        <span className={dotClassSet} />
        <span className="badge-container-text">
          <Trans render="span" id={StringUtil.capitalize(filterName)} />
        </span>
        <Badge appearance={isActive}>{count || 0}</Badge>
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
    const getHealthSortingOrder = TableUtil.getHealthSortingOrder;

    return [
      {
        className: classNameFn,
        headerClassName: classNameFn,
        heading: ResourceTableUtil.renderHeading({ name: i18nMark("Name") }),
        prop: "name",
        render: this.renderUnit,
        sortable: true,
        sortFunction
      },
      {
        className: classNameFn,
        headerClassName: classNameFn,
        heading: ResourceTableUtil.renderHeading({
          health: i18nMark("Health")
        }),
        prop: "health",
        render: this.renderHealth,
        sortable: true,
        sortFunction: getHealthSortingOrder
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
    const { i18n } = this.props;
    const visibleData = this.getVisibleData(data, searchString, healthFilter);
    const dataHealth = dataItems.map(function(unit) {
      return unit.getHealth();
    });
    const filters = [
      {
        filter: "all",
        marked: i18nMark("All")
      },
      {
        filter: "healthy",
        marked: i18nMark("Healthy")
      },
      {
        filter: "unhealthy",
        marked: i18nMark("Unhealthy")
      }
    ];

    return (
      <Page>
        <Page.Header breadcrumbs={<UnitHealthBreadcrumbs />} />
        <div className="flex-container-col">
          <div className="units-health-table-header">
            {/* L10NTODO: Pluralize
            We should pluralize FilterHeadline name here using lingui macro instead of
            doing it manually in FilterHeadline */}
            <FilterHeadline
              currentLength={visibleData.length}
              isFiltering={healthFilter !== "all" || searchString !== ""}
              name={i18n._(t`Component`)}
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
                filters={filters.map(f => f.filter)}
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
                <Trans render="span">Download Snapshot</Trans>
              </a>
            </FilterBar>
          </div>
          <div className="page-body-content-fill flex-grow flex-container-col">
            <Table
              className="table table-flush table-borderless-outer
                table-borderless-inner-columns table-hover flush-bottom"
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
  label: i18nMark("Components"),
  matches: /^\/components\/overview/
};

export default withI18n()(UnitsHealthTab);
