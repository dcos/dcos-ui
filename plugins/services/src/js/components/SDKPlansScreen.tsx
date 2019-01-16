import * as React from "react";

import { Service } from "#PLUGINS/services/src/js/types/Service";
import SDKPlanTable from "#PLUGINS/services/src/js/components/SDKPlanTable";
import { formatServicePlanStatus } from "#PLUGINS/services/src/js/types/ServicePlanStatus";
import { ServicePlan } from "#PLUGINS/services/src/js/types/ServicePlan";
import FieldSelect from "#SRC/js/components/form/FieldSelect";

export interface SDKPlansScreenProps {
  service: Service;
  plan: string;
  handleSelectPlan: (name: string) => void;
}

class SDKPlansScreen extends React.PureComponent<SDKPlansScreenProps, {}> {
  constructor(props: SDKPlansScreenProps) {
    super(props);

    this.renderPlanSelect = this.renderPlanSelect.bind(this);
    this.planSelectChange = this.planSelectChange.bind(this);
  }

  planSelectChange(e: React.FormEvent<HTMLSelectElement>) {
    this.props.handleSelectPlan(e.currentTarget.value);
  }

  renderPlanSelect(plans: ServicePlan[]): React.ReactNode {
    return (
      <div className="pod flush-horizontal flush-top">
        <FieldSelect
          name="plan"
          onChange={this.planSelectChange}
          value={this.props.plan}
        >
          {plans.map((plan: ServicePlan, index: number) => {
            const { name, strategy, status } = plan;
            return (
              <option key={`plan.option.${index}`} value={name}>
                {name} ({strategy}) - {formatServicePlanStatus(status)}
              </option>
            );
          })}
        </FieldSelect>
      </div>
    );
  }

  render() {
    const { service, plan: planName } = this.props;
    if (service.plans.length === 0) {
      return <div>No Plans</div>;
    }
    let selectedPlan = service.plans.find(plan => plan.name === planName);
    if (selectedPlan === undefined) {
      selectedPlan = service.plans[0];
    }

    return (
      <div className="flex-item-grow-1 flex flex-direction-top-to-bottom">
        {this.renderPlanSelect(service.plans)}
        <SDKPlanTable plan={selectedPlan} />
      </div>
    );
  }
}

export default SDKPlansScreen;
