import PropTypes from "prop-types";
import React from "react";
import { routerShape } from "react-router";
import { i18nMark } from "@lingui/react";

import Page, { Header } from "#SRC/js/components/Page";
//@ts-ignore
import DeploymentStatusIndicator from "../../components/DeploymentStatusIndicator";
//@ts-ignore
import ServiceBreadcrumbs from "../../components/ServiceBreadcrumbs";
import ServicesQuotaOverview from "../../components/ServicesQuotaOverview";
import ServicesQuotaOverviewDetail from "../../components/ServicesQuotaOverviewDetail";

import ServiceTree from "../../structs/ServiceTree";

interface ServicesQuotaViewProps {
  serviceTree: ServiceTree;
}

class ServicesQuotaView extends React.Component<ServicesQuotaViewProps, {}> {
  static contextTypes = {
    modalHandlers: PropTypes.shape({
      createGroup: PropTypes.func
    }).isRequired,
    router: routerShape
  };
  static propTypes = {
    serviceTree: PropTypes.instanceOf(ServiceTree)
  };
  constructor(props: ServicesQuotaViewProps) {
    super(props);

    this.getTabs = this.getTabs.bind(this);
  }

  getTabs() {
    const { serviceTree } = this.props;

    return [
      {
        label: i18nMark("Services"),
        routePath: serviceTree.isRoot()
          ? "/services/overview"
          : `/services/overview/${encodeURIComponent(serviceTree.getId())}`
      },
      {
        label: i18nMark("Quota"),
        routePath: serviceTree.isRoot()
          ? "/services/quota"
          : `/services/quota/${encodeURIComponent(serviceTree.getId())}`
      }
    ];
  }

  render() {
    const { children, serviceTree } = this.props;
    const { modalHandlers } = this.context;
    const tabs = this.getTabs();
    const id: string = serviceTree.getId();
    const isRoot = serviceTree.isRoot();
    const createService = () => {
      isRoot
        ? this.context.router.push("/services/overview/create")
        : this.context.router.push(
            "/services/overview/" +
              encodeURIComponent(serviceTree.getId()) +
              "/create"
          );
    };
    const content = isRoot ? (
      <ServicesQuotaOverview />
    ) : (
      <ServicesQuotaOverviewDetail serviceTree={serviceTree} id={id} />
    );
    let createGroup;
    if (isRoot) {
      createGroup = () => {
        this.context.router.push("/services/overview/create_group");
      };
    } else {
      createGroup = modalHandlers.createGroup;
    }

    return (
      <Page dontScroll={serviceTree.isRoot()} flushBottom={true}>
        <Header
          breadcrumbs={<ServiceBreadcrumbs serviceID={id} />}
          addButton={[
            {
              onItemSelect: createService,
              label: i18nMark("Run a Service")
            },
            {
              onItemSelect: createGroup,
              label: i18nMark("Create Group")
            }
          ]}
          supplementalContent={<DeploymentStatusIndicator />}
          tabs={tabs}
        />
        <div className="flex-item-grow-1 flex flex-direction-top-to-bottom">
          {content}
        </div>
        {children}
      </Page>
    );
  }
}

export default ServicesQuotaView;
