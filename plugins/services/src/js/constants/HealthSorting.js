/**
 * Order health types by it's label and number value
 * This will depend on the sorting method/function
 * suggested use is ascending 0 meaning ((top of the list)) more important
 * visibility and 3 meaning least important (bottom of the order)
 */
const HealthSorting = {
  UNHEALTHY: 0,
  HEALTHY: 3,
  IDLE: 2,
  NA: 1,
  WARN: 2
};

export default HealthSorting;
