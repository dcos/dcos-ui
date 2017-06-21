import Item from "./Item";
import ServicePlanPhases from "./ServicePlanPhases";
import ServicePlanStatusTypes from "../constants/ServicePlanStatusTypes";

class ServicePlan extends Item {
  getPhases() {
    return new ServicePlanPhases({ items: this.get("phases") });
  }

  getErrors() {
    return this.get("errors") || [];
  }

  hasError() {
    return this.get("status") === ServicePlanStatusTypes.ERROR;
  }

  isComplete() {
    return this.get("status") === ServicePlanStatusTypes.COMPLETE;
  }

  isInProgress() {
    return this.get("status") === ServicePlanStatusTypes.IN_PROGRESS;
  }

  isPending() {
    return this.get("status") === ServicePlanStatusTypes.PENDING;
  }

  isWaiting() {
    return this.get("status") === ServicePlanStatusTypes.WAITING;
  }
}

module.exports = ServicePlan;
