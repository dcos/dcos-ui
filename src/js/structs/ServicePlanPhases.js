import List from './List';
import ServicePlanPhase from './ServicePlanPhase';

class ServicePlanPhases extends List {
  constructor() {
    super(...arguments);

    // Cache lookups
    this._activePhaseIndex = -1;
    this._activePhase = null;

    // Find first phase where status is not complete
    this.getItems().some((phase, phaseIndex) => {
      let complete = phase.isComplete();

      if (!complete) {
        this._activePhaseIndex = phaseIndex;
        this._activePhase = phase;
      }

      return !complete;
    });
  }

  getActive() {
    return this._activePhase;
  }

  getActiveIndex() {
    return this._activePhaseIndex;
  }

}

ServicePlanPhases.type = ServicePlanPhase;

module.exports = ServicePlanPhases;
