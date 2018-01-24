/**
 * Order service by status weight of importance
 * This will depend on the sorting method/function
 * suggested use is ascending 0 meaning (top of the list) more important
 * visibility and 6 meaning least important (bottom of the order)
 */
const StatusSorting = {
  Recovering: 0,
  Deploying: 1,
  Deleting: 2,
  Stopped: 3,
  Running: 4,
  NA: 5
};

module.exports = StatusSorting;
