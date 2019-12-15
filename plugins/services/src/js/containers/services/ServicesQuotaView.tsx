import PropTypes from "prop-types";
import React from "react";
import { routerShape } from "react-router";
import { i18nMark } from "@lingui/react";
import { Trans } from "@lingui/macro";
import {
  DropdownMenu,
  DropdownSection,
  DropdownMenuItem,
  PrimaryDropdownButton
} from "@dcos/ui-kit";
import { SystemIcons } from "@dcos/ui-kit/dist/packages/icons/dist/system-icons-enum";

import Page, { Header } from "#SRC/js/components/Page";
import DeploymentStatusIndicator from "../../components/DeploymentStatusIndicator";
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

    const content = isRoot ? (
      <ServicesQuotaOverview />
    ) : (
      <ServicesQuotaOverviewDetail serviceTree={serviceTree} id={id} />
    );
    const onAddSelectRoot = (selectedItem: string) => {
      switch (selectedItem) {
        case "runService":
          this.context.router.push("/services/overview/create");
          break;
        case "createGroup":
          this.context.router.push("/services/overview/create_group");
          break;
        default:
          break;
      }
    };

    const onAddSelectTree = (selectedItem: string) => {
      switch (selectedItem) {
        case "runService":
          this.context.router.push(
            "/services/overview/" +
              encodeURIComponent(serviceTree.getId()) +
              "/create"
          );
          break;
        case "createGroup":
          modalHandlers.createGroup();
          break;
        default:
          break;
      }
    };

    const onEditSelect = () => {
      this.context.router.push(
        `/services/detail/${encodeURIComponent(serviceTree.getId())}/edit/`
      );
    };

    const actionMenu = (
      <React.Fragment>
        <DropdownMenu
          trigger={
            <PrimaryDropdownButton iconStart={SystemIcons.Plus}>
              <Trans render="span">New</Trans>
            </PrimaryDropdownButton>
          }
          onSelect={isRoot ? onAddSelectRoot : onAddSelectTree}
        >
          <DropdownSection>
            <DropdownMenuItem key="runService" value="runService">
              <Trans render="span">Run a Service</Trans>
            </DropdownMenuItem>
            <DropdownMenuItem key="createGroup" value="createGroup">
              <Trans render="span">Create Group</Trans>
            </DropdownMenuItem>
          </DropdownSection>
        </DropdownMenu>
      </React.Fragment>
    );

    // @ts-ignore
    const deployStatus = <DeploymentStatusIndicator />;

    return (
      <Page dontScroll={false} flushBottom={true}>
        <Header
          breadcrumbs={<ServiceBreadcrumbs serviceID={id} />}
          supplementalContent={
            <React.Fragment>
              {deployStatus}
              {actionMenu}
            </React.Fragment>
          }
          actions={
            serviceTree.isTopLevel()
              ? [
                  {
                    onItemSelect: onEditSelect,
                    label: i18nMark("Edit Group")
                  }
                ]
              : []
          }
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
