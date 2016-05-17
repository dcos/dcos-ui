import ServicePlanStatusTypes from './ServicePlanStatusTypes';

const ServicePlanStatusDisplayText = {
  [ServicePlanStatusTypes.COMPLETE]: 'Complete',
  [ServicePlanStatusTypes.ERROR]: 'Error',
  [ServicePlanStatusTypes.IN_PROGRESS]: 'In Progress',
  [ServicePlanStatusTypes.PENDING]: 'Pending',
  [ServicePlanStatusTypes.WAITING]: 'Waiting'
};

module.exports = ServicePlanStatusDisplayText;
