/**
 * Pattern to extract the parent id (e.g. "a.b") from an item id (e.g. "a.b.c")
 * by matching everything except the last bit (e.g. ".c")
 *
 * @type {RegExp}
 */
const PARENT_ID_REGEXP = /.*?(?=\.?[^.]+\.?$)/;

/**
 * Get the parent id (e.g. "a.b") from the item id (e.g. "a.b.c")
 *
 * @param {string} itemId
 * @return {string} the items parent id
 */
function getParentId(itemId) {
  const [parentId = ""] = itemId.match(PARENT_ID_REGEXP);

  return parentId;
}

/**
 * Add a job to the respective namespace based on the id property.
 *
 * @param {{id:string}} job
 * @param {Map} jobMap hash map of all jobs that have already
 * been created
 * @param {Map} namespaceMap hash map of all namespaces that have already
 * been created
 * @return {{id:string}} job
 */
function addJob(job, jobMap, namespaceMap) {
  const { id } = job;

  if (id.startsWith(".") || id.endsWith(".")) {
    throw new Error(
      `Id (${id}) must not start with a leading dot (".") ` +
        "and should not end with a dot."
    );
  }

  // Check if the item (namespace or job) has already been added and merge with
  // existing one
  if (jobMap.has(id)) {
    job = Object.assign(jobMap.get(id), job);
    jobMap.set(id, job);

    return job;
  }

  const parentNamespace = getNamespaceWithId(getParentId(id), namespaceMap);

  // Add job to the parent namespace and jobs map
  parentNamespace.items.push(job);
  jobMap.set(id, job);

  return job;
}

/**
 * Get a namespace with the respective id and create sub namespaces if needed.
 *
 * @param {String} namespaceId
 * @param {Map} namespaceMap hash map of all namespaces that have already
 * been created
 * @return {{id:string, items:[]}} namespace
 */
function getNamespaceWithId(namespaceId, namespaceMap) {
  // Check if the item (namespace or job) has already been added
  if (namespaceMap.has(namespaceId)) {
    return namespaceMap.get(namespaceId);
  }

  const namespace = { id: namespaceId, items: [] };
  const parentNamespace = getNamespaceWithId(
    getParentId(namespaceId),
    namespaceMap
  );

  // Save namespace and link with parent
  namespaceMap.set(namespaceId, namespace);
  parentNamespace.items.push(namespace);

  return namespace;
}

const MetronomeUtil = {
  /**
   * [parseJobs description]
   * @param  {array} jobs to be turned into an acceptable structure
   * for Job or JobTree
   * @return {{
   *          id:string,
   *          items:array<({id:string, items:array}|*)>,
   * }} jobs and namespaces in a tree structure
   */
  parseJobs(jobs) {
    const namespacesMap = new Map();
    const jobsMap = new Map();
    const rootNamespace = { id: "", items: [] };

    // Add initial root namespace. N.B. The namespaces must be added to the map
    // without the "%" prefix.
    namespacesMap.set("", rootNamespace);

    if (!Array.isArray(jobs)) {
      jobs = [jobs];
    }

    jobs.forEach(function(job) {
      addJob(MetronomeUtil.parseJob(job), jobsMap, namespacesMap);
    });

    return rootNamespace;
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

export default MetronomeUtil;
