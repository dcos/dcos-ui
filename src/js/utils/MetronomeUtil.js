/**
 * Parse an item into a Job or JobTree - This method will create sub trees if
 * needed to insert the item at the correct location
 * (based on id/path matching).
 * @param {{
 *          id:string,
 *          items:array<({id:string, items:array}|*)>,
 * }} parent tree to add item to
 * @param {{id:string}} item job to add to parent
 * @param {[type]} jobsAlreadyAdded hash of id and jobs of jobs that
 * have already been added to the parent
 */
function addJob(parent, item, jobsAlreadyAdded) {
  const { id } = parent;

  const itemId = item.id;

  if (itemId.startsWith(".") || itemId.endsWith(".")) {
    throw new Error(
      `Id (${itemId}) must not start with a leading dot (".") ` +
        "and should not end with a dot."
    );
  }

  if (!itemId.startsWith(id)) {
    throw new Error(`item id (${itemId}) doesn't match tree id (${id})`);
  }

  // Check if the item (group or job) has already been added
  if (jobsAlreadyAdded[itemId]) {
    // handle merge data for job, not for group
    item = Object.assign(jobsAlreadyAdded[itemId], item);

    return;
  }

  // Get the parent id (e.g. group) by matching everything but the item
  // name including the preceding dot "." (e.g. ".name").
  const [parentId] = itemId.match(/.*?(?=\.?[^.]+\.?$)/);

  if (parentId == null) {
    return;
  }

  // Add item to the current tree if it's the actual parent tree
  if (id === parentId) {
    // Initialize items, if they don't already exist, before push
    if (!parent.items) {
      parent.items = [];
    }

    // Store child as added
    jobsAlreadyAdded[item.id] = item;
    parent.items.push(MetronomeUtil.parseJob(item));

    return;
  }

  // Find or create corresponding parent tree and add it to the tree
  let subParent = jobsAlreadyAdded[parentId];
  if (!subParent) {
    subParent = { id: parentId, items: [] };
    addJob(parent, subParent, jobsAlreadyAdded);
  }

  // Add item to parent tree
  addJob(subParent, item, jobsAlreadyAdded);
}

const MetronomeUtil = {
  /**
   * [parseJobs description]
   * @param  {array} jobs to be turned into an acceptable structure
   * for Job or JobTree
   * @return {{
   *          id:string,
   *          items:array<({id:string, items:array}|*)>,
   * }} jobs and groups in a tree structure
   */
  parseJobs(jobs) {
    const rootTree = { id: "" };
    const jobsAlreadyAdded = {
      [rootTree.id]: rootTree
    };

    if (!Array.isArray(jobs)) {
      jobs = [jobs];
    }

    jobs.forEach(function(job) {
      addJob(rootTree, job, jobsAlreadyAdded);
    });

    return rootTree;
  },

  parseJob(job) {
    let { history } = job;

    if (history == null) {
      return job;
    }

    let { failedFinishedRuns = [], successfulFinishedRuns = [] } = history;

    failedFinishedRuns = failedFinishedRuns.map(function(jobRun) {
      return Object.assign({}, jobRun, { status: "FAILED", jobId: job.id });
    });

    successfulFinishedRuns = successfulFinishedRuns.map(function(jobRun) {
      return Object.assign({}, jobRun, { status: "COMPLETED", jobId: job.id });
    });

    history = Object.assign({}, history, {
      failedFinishedRuns,
      successfulFinishedRuns
    });

    return Object.assign({}, job, { history });
  }
};

module.exports = MetronomeUtil;
