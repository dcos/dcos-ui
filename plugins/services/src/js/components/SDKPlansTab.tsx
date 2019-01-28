import { Trans } from "@lingui/macro";
import * as React from "react";
import { Link } from "react-router";
import { Dropdown } from "reactjs-components";

import { Service } from "#PLUGINS/services/src/js/types/Service";
import SDKPlanTable, {
  getStatusIcon
} from "#PLUGINS/services/src/js/components/SDKPlanTable";
import { formatServicePlanStatus } from "#PLUGINS/services/src/js/types/ServicePlanStatus";
import { ServicePlan } from "#PLUGINS/services/src/js/types/ServicePlan";
import AlertPanel from "#SRC/js/components/AlertPanel";
import AlertPanelHeader from "#SRC/js/components/AlertPanelHeader";

export interface SDKPlansTabProps {
  service: Service;
  plan: string;
  schedulerTaskId: string | undefined;
  handleSelectPlan: (name: string) => void;
}

class SDKPlansTab extends React.PureComponent<SDKPlansTabProps, {}> {
  constructor(props: SDKPlansTabProps) {
    super(props);

    this.renderPlanSelect = this.renderPlanSelect.bind(this);
    this.renderSchedulerLogsLink = this.renderSchedulerLogsLink.bind(this);
    this.renderNoPlansPanel = this.renderNoPlansPanel.bind(this);
    this.planSelectChange = this.planSelectChange.bind(this);
  }

  planSelectChange(dropdownItem: { id: string }) {
    this.props.handleSelectPlan(dropdownItem.id);
  }

  renderPlanSelect(
    plans: ServicePlan[],
    selectedPlan: string
  ): React.ReactNode {
    const dropdownActions = plans.map((plan: ServicePlan) => ({
      id: plan.name,
      html: (
        <span>
          {plan.name} ({plan.strategy}) - {getStatusIcon(plan.status)}{" "}
          {formatServicePlanStatus(plan.status)}
        </span>
      ),
      selectedHtml: (
        <span>
          {plan.name} ({plan.strategy}) - {getStatusIcon(plan.status)}{" "}
          {formatServicePlanStatus(plan.status)}
        </span>
      )
    }));
    return (
      <div className="flex-item-grow-1">
        <Dropdown
          buttonClassName="dropdown-toggle button button-transparent flush-left"
          dropdownMenuClassName="dropdown-menu"
          dropdownMenuListClassName="dropdown-menu-list"
          dropdownMenuListItemClassName="clickable"
          items={dropdownActions}
          initialID={selectedPlan}
          onItemSelection={this.planSelectChange}
          scrollContainer=".gm-scroll-view"
          scrollContainerParentSelector=".gm-prevented"
          transition={true}
          transitionName="dropdown-menu"
          wrapperClassName="dropdown"
        />
      </div>
    );
  }

  renderSchedulerLogsLink(): React.ReactNode | null {
    if (!this.props.schedulerTaskId) {
      return null;
    }
    const { service, schedulerTaskId } = this.props;
    return (
      <div className="flex-item-shrink-1">
        <Link
          to={`/services/detail/${encodeURIComponent(
            service.id
          )}/tasks/${encodeURIComponent(schedulerTaskId)}/logs`}
        >
          View Scheduler Logs
        </Link>
      </div>
    );
  }

  renderNoPlansPanel() {
    return (
      <AlertPanel>
        <Trans render={<AlertPanelHeader />}>No Plans</Trans>
        <Trans render="p" className="tall">
          There are no plans currently available.
        </Trans>
      </AlertPanel>
    );
  }

  render() {
    const { service, plan: planName } = this.props;
    if (service.plans.length === 0) {
      return this.renderNoPlansPanel();
    }
    let selectedPlan = service.plans.find(plan => plan.name === planName);
    if (selectedPlan === undefined) {
      selectedPlan = service.plans[0];
    }

    return (
      <div className="flex-item-grow-1 flex flex-direction-top-to-bottom">
        <div className="pod flush-horizontal flush-top flex flex-align-items-center flex-justify-items-space-between">
          {this.renderPlanSelect(service.plans, selectedPlan.name)}
          {this.renderSchedulerLogsLink()}
        </div>
        <SDKPlanTable plan={selectedPlan} />
      </div>
    );
  }
}

export default SDKPlansTab;
