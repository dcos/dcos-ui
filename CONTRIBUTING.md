### Working with ReactJS Components

To develop ReactJS Components and see the implications immediately in DC/OS UI, it is helpful to use [npm link](https://docs.npmjs.com/cli/link).
1. Run `npm link` in your `reactjs-components` directory.
2. Run `npm link reactjs-components` in your `dcos-ui` directory.
3. Run `npm run start-reactjs-components-local` to start the Webpack dev server.
4. After any changes are made to `reactjs-components`, run `npm run dist-src` in the `reactjs-components` directory.
