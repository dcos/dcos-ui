import { Trans } from "@lingui/macro";
import { i18nMark } from "@lingui/react";
import classNames from "classnames";
import mixin from "reactjs-mixin";
import { Link } from "react-router";
import * as React from "react";
import { Badge } from "@dcos/ui-kit";
import { ProductIcons } from "@dcos/ui-kit/dist/packages/icons/dist/product-icons-enum";

import Breadcrumb from "#SRC/js/components/Breadcrumb";
import BreadcrumbTextContent from "#SRC/js/components/BreadcrumbTextContent";
import FilterBar from "#SRC/js/components/FilterBar";
import FilterButtons from "#SRC/js/components/FilterButtons";
import FilterHeadline from "#SRC/js/components/FilterHeadline";
import FilterInputText from "#SRC/js/components/FilterInputText";
import Loader from "#SRC/js/components/Loader";
import Page from "#SRC/js/components/Page";
import RequestErrorMsg from "#SRC/js/components/RequestErrorMsg";
import StoreMixin from "#SRC/js/mixins/StoreMixin";
import StringUtil from "#SRC/js/utils/StringUtil";

import CertificatesTable from "../components/CertificatesTable";
import CertificateStore from "../stores/CertificateStore";

const CertificatesBreadcrumbs = () => {
  const crumbs = [
    <Breadcrumb key={0} title="Certificates">
      <BreadcrumbTextContent>
        <Trans render={<Link to="/secrets/certificates" />}>Certificates</Trans>
      </BreadcrumbTextContent>
    </Breadcrumb>
  ];

  return (
    <Page.Header.Breadcrumbs iconID={ProductIcons.Lock} breadcrumbs={crumbs} />
  );
};

class CertificatesPage extends mixin(StoreMixin) {
  constructor(...args) {
    super(...args);

    this.state = {
      healthFilter: "all",
      isLoading: true,
      requestError: false,
      searchString: ""
    };

    // prettier-ignore
    this.store_listeners = [
      {name: "certificates", events: ["certificatesSuccess", "certificatesError"]}
    ];
  }

  componentDidMount() {
    super.componentDidMount();
    CertificateStore.fetchCertificates();
  }

  onCertificatesStoreCertificatesSuccess() {
    this.setState({ isLoading: false, requestError: false });
  }

  onCertificatesStoreCertificatesError() {
    this.setState({ requestError: true });
  }
  handleSearchStringChange = (searchString = "") => {
    this.setState({ searchString: searchString.toLowerCase() });
  };
  handleHealthFilterChange = healthFilter => {
    this.setState({ healthFilter });
  };
  resetFilter = () => {
    this.setState({ searchString: "", healthFilter: "all" });
  };

  getButtonContent(filterName, count) {
    const dotClassSet = classNames({
      dot: filterName !== "all",
      danger: filterName === "expired",
      success: filterName === "active"
    });

    return (
      <span className="button-align-content badge-container label flush">
        <span className={dotClassSet} />
        <span className="badge-container-text">
          <span>{StringUtil.capitalize(filterName)}</span>
        </span>
        <Badge>{count || 0}</Badge>
      </span>
    );
  }

  getVisibleItems(items, searchString, healthFilter) {
    return items
      .filterItems(item => {
        const name = item.name.toLowerCase();
        const status = item.status.toLowerCase();

        return (
          (name.includes(searchString) || status.includes(searchString)) &&
          (healthFilter === "all" || status === healthFilter)
        );
      })
      .getItems();
  }

  render() {
    const { healthFilter, isLoading, requestError, searchString } = this.state;

    if (requestError) {
      return (
        <Page>
          <Page.Header breadcrumbs={<CertificatesBreadcrumbs />} />
          <RequestErrorMsg />
        </Page>
      );
    }

    const certificates = CertificateStore.getCertificates();
    const certificateItems = certificates.getItems();
    const visibleItems = this.getVisibleItems(
      certificates,
      searchString,
      healthFilter
    );

    if (isLoading) {
      return (
        <Page>
          <Page.Header breadcrumbs={<CertificatesBreadcrumbs />} />
          <Loader />
        </Page>
      );
    }

    return (
      <Page>
        <Page.Header breadcrumbs={<CertificatesBreadcrumbs />} />
        <FilterHeadline
          currentLength={visibleItems.length}
          isFiltering={healthFilter !== "all" || searchString !== ""}
          name="Certificate"
          onReset={this.resetFilter}
          totalLength={certificateItems.length}
        />
        <FilterBar>
          <FilterInputText
            className="flush-bottom"
            handleFilterChange={this.handleSearchStringChange}
            searchString={searchString}
          />
          <FilterButtons
            filterByKey="status"
            filters={["all", "active", "expired"]}
            itemList={certificateItems}
            onFilterChange={this.handleHealthFilterChange}
            renderButtonContent={this.getButtonContent}
            selectedFilter={healthFilter}
          />
        </FilterBar>
        <CertificatesTable certificates={visibleItems} />
      </Page>
    );
  }
}

CertificatesPage.routeConfig = {
  label: i18nMark("Certificates"),
  matches: /^\/secrets\/certificates/
};

module.exports = CertificatesPage;
