function parseApp(app) {
  let {id} = app;

  if (!id.startsWith('/') || id.endsWith('/')) {
    throw new Error(`Id (${id}) must start with a leading slash ("/") ` +
      'and should not end with a slash.');
  }

  return app;
}

const MarathonUtil = {
  parseGroups({id = '/', groups = [], apps = []}) {
    if (id !== '/' && (!id.startsWith('/') || id.endsWith('/'))) {
      throw new Error(`Id (${id}) must start with a leading slash ("/") ` +
        'and should not end with a slash, except for root id which is only ' +
        'a slash.');
    }

    // Parse items
    let items = [].concat(groups.map(this.parseGroups.bind(this)),
      apps.map(parseApp));

    return {id, items};
  }
};

module.exports = MarathonUtil;
