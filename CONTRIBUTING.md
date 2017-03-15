# How to contribute

If you would like to contribute to the project please follow the guidelines set out below. Keep in mind that they are not here to make your contribution a painful experience, but to simplify our jobs looking through many pull requests (making it a 30 minute task).

### Pull Request

Pull Request for new features, bugs and minor improvements are appreciated. However please follow the guidelines below to save as much time as possible for the maintainers.

- __Prepend your branch with (bug/feature)__ When creating a new branch prepend `bug` or `feature` in front of it e.g `bug/some-wording` based on the work needed, if there is Jira ticket make sure to include e.g `bug/DCOS-1111-some-wording`.
- __Make your commit message as descriptive as possible.__ Include as much information as you can. Explain anything that the file diffs themselves won’t make apparent, link to the relevant Jira (if applicable).
- __Consolidate multiple commits into a single commit when you rebase.__ If you’ve got several commits in your local repository/branch that all have to do with a single change, you can squash multiple commits into a single.

If your PR contains multiple parts (PRs) make clear on your commit heading e.g `[1 of 3]: Fixes user log out button`.

### Working with ReactJS Components

To develop ReactJS Components and see the implications immediately in DC/OS UI, it is helpful to use [npm link](https://docs.npmjs.com/cli/link).

1. Run `npm run dist-src` in your `reactjs-components` directory.
2. Run `npm link` in your `reactjs-components` directory.
3. Run `npm link reactjs-components` in your `dcos-ui` directory.
4. Run `export REACTJS_COMPONENTS_LOCAL=true; npm start` to start the Webpack dev server with the proper configuration variable.
5. After any changes are made to `reactjs-components`, run `npm run dist-src` in the `reactjs-components` directory.
