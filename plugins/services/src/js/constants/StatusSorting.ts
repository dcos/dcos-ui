interface StatusSortingInterface {
  ERROR: number;
  WARNING: number;
  LOADING: number;
  RUNNING: number;
  STOPPED: number;
  NA: number;
}

const StatusSorting: StatusSortingInterface = {
  ERROR: 0,
  WARNING: 1,
  LOADING: 2,
  RUNNING: 3,
  STOPPED: 4,
  NA: 5
};

module.exports = StatusSorting;
