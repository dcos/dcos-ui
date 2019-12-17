const ContainerUtil = {
  /**
   * Sets or clears error for actionType
   * @param {Object} actionErrors
   * @param  {String} actionType
   * @param  {Any} error
   * @return {Object} updated action errors
   */
  adjustActionErrors(actionErrors, actionType, error) {
    return {
      ...actionErrors,
      [actionType]: error
    };
  },
  /**
   * Sets pending action to true/false
   * @param {Object} pendingActions
   * @param  {String}  actionType
   * @param  {Boolean} isPending
   * @return {Object} updated pending actions
   */
  adjustPendingActions(pendingActions, actionType, isPending) {
    return {
      ...pendingActions,
      [actionType]: isPending
    };
  },

  getNewContainerName(containerLength, newState) {
    const name = `container-${containerLength + 1}`;
    const matchingNames = newState.filter(item => item.name === name);

    if (matchingNames.length > 0) {
      return this.getNewContainerName(++containerLength, newState);
    }
    return name;
  }
};

export default ContainerUtil;
