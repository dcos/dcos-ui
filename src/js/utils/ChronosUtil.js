module.exports = {
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
  addJob(parent, item, jobsAlreadyAdded) {
    const {id} = parent;

    const itemId = item.id;

    if (itemId !== '/' && (!itemId.startsWith('/') || itemId.endsWith('/'))) {
      throw new Error(`Id (${itemId}) must start with a leading slash ("/") ` +
        'and should not end with a slash, except for root id which is only ' +
        'a slash.');
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

    // Get the parent id (e.g. /group) by matching every thing but the item
    // name including the preceding slash "/" (e.g. /id).
    const [parentId] = itemId.match(/\/.*?(?=\/?[^/]+\/?$)/) || [null];

    if (!parentId) {
      return;
    }

    // Add item to the current tree if it's the actual parent tree
    if (id === parentId) {
      parent.items.push(item);
      return;
    }

    // Find or create corresponding parent tree and add it to the tree
    let subParent = jobsAlreadyAdded[parentId];
    if (!subParent) {
      subParent = {id: parentId, items: []};
      this.addJob(parent, subParent, jobsAlreadyAdded);
    }

    // Add item to parent tree
    this.addJob(subParent, item, jobsAlreadyAdded);
  },

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
    let rootTree = {id: '/', items: []};
    let jobsAlreadyAdded = {
      [rootTree.id]: rootTree
    };

    if (!Array.isArray(jobs)) {
      jobs = [jobs];
    }

    jobs.forEach((job) => {
      this.addJob(rootTree, job, jobsAlreadyAdded);
    });

    return rootTree;
  }
};
