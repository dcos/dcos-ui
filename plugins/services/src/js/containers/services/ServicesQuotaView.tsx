import PropTypes from "prop-types";
import React from "react";
import { routerShape } from "react-router";
import { i18nMark } from "@lingui/react";

import Page from "#SRC/js/components/Page";
//@ts-ignore
import DeploymentStatusIndicator from "../../components/DeploymentStatusIndicator";
//@ts-ignore
import ServiceBreadcrumbs from "../../components/ServiceBreadcrumbs";
import ServicesQuotaOverview from "../../components/ServicesQuotaOverview";
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

  getTabs() {
    return [
      {
        label: i18nMark("Services"),
        routePath: "/services/overview"
      },
      {
        label: i18nMark("Quota"),
        routePath: "/services/quota"
      }
    ];
  }

  render() {
    const { children, serviceTree } = this.props;
    const { modalHandlers } = this.context;
    const createService = () => {
      this.context.router.push("/services/overview/create");
    };
    const tabs = this.getTabs();

    const content = <ServicesQuotaOverview />;

    return (
      <Page dontScroll={true} flushBottom={true}>
        //@ts-ignore
        <Page.Header
          breadcrumbs={<ServiceBreadcrumbs serviceID={serviceTree.getId()} />}
          actions={[
            {
              onItemSelect: modalHandlers.createGroup,
              label: i18nMark("Create Group")
            }
          ]}
          addButton={{
            onItemSelect: createService,
            label: i18nMark("Run a Service")
          }}
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
