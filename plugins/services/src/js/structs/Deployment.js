import Item from "../../../../../src/js/structs/Item";

/**
 * An application deployment.
 *
 * @struct
 * @see the
 *   {@link http://mesosphere.github.io/marathon/docs/deployments.html|Marathon
 *   application deployment documentation}
 */
module.exports = class Deployment extends Item {
  /**
   * @return {string} the id of this deployment
   */
  getId() {
    return this.get("id");
  }

  /**
   * @return {Array.<string>} an array of app IDs affected by this deployment.
   */
  getAffectedServiceIds() {
    const affectedApps = this.get("affectedApps") || [];
    const affectedPods = this.get("affectedPods") || [];

    return affectedApps.concat(affectedPods);
  }

  /**
   * @return {Array.<string>} an array of stale service IDs.
   */
  getStaleServiceIds() {
    return this.get("staleServiceIds");
  }

  /**
   * @return {ServiceList} list of services affected by this deployment.
   */
  getAffectedServices() {
    const ids = this.getAffectedServiceIds();
    const services = this.get("affectedServices");
    if (ids == null || ids.length === 0) {
      return [];
    }
    if (services == null) {
      throw Error("Affected services list is stale.");
    }

    return services;
  }

  /**
   * @return {Date} the date and time at which the deployment was started.
   */
  getStartTime() {
    return new Date(this.get("version"));
  }

  /**
   * @return {number} the index of the deployment step currently underway.
   * @see {@link getTotalSteps}
   */
  getCurrentStep() {
    return this.get("currentStep");
  }

  /**
   * @return {number} the number of steps in this deployment.
   * @see {@link getCurrentStep}
   */
  getTotalSteps() {
    return this.get("totalSteps");
  }

  /**
   * @return {boolean} true if this deployment starts a new service.
   */
  isStarting() {
    const steps = this.get("steps");
    if (steps != null) {
      return this.get("steps").some(function(step) {
        return step.actions.some(function(action) {
          return action.type === "StartApplication";
        });
      });
    }
  }
};
