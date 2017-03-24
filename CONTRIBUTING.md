## Commits

Please commit your changes frequently in small logical chunks that are 
consistent, work independently of any later commits, and pass the linter as well 
as the test suite. Doing so eases rollback and rebase operations. 

You should also follow our commit message formatting rules, as they provide a 
framework to write explicit messages that are easy to comprehend when looking 
through the project history and enable automatic change log generation.

These Guidelines were written based on 
[AngularJS Git Commit Message Conventions](https://goo.gl/27wkkO).

### Commit-Message

Each commit message should consist of a header (type, scope, subject), a body 
and a footer separated by empty lines:

```
<type>(<scope>): <subject>
    
<message>

<footer>
``` 

Any line of the commit message must not be longer than 100 characters to ensure 
that the messages are easy to read.

### Subject

The subject contains a succinct description of the change. It should use the 
imperative and present tense; “change” not “changed” nor “changes”. 
Don't capitalize the first letter, and don't end it with a dot.

### Type

The following commit types are allowed:

* **feat** - 
  use this type for commits that introduce a new features or capabilities
* **fix** - use this one for bug fixes
* **perf** - use this type for performance improvements
* **docs** - use this one to indicate documentation adjustments and improvements 
* **chore** - use this type for _maintainance_ commits e.g. removing old files 
* **style** - use this one for commits that fix formatting and linting errors
* **refactor** - 
  use this type for adjustments to improve maintainability or performance
* **test** - use this one for commits that add new tests

### Scope

The scope should specify the place of the committed change. 
Use the _class_, component, or filename if you only touched one "file", 
otherwise use the page, module or package name. 
Please don't list changed files and be as specific as possible. 

### Message

The message includes motivation for the change and contrasts with previous 
behavior. It should use the imperative and present tense. 

### Referencing Issues 

Closed issues should be listed on a separate line in the footer prefixed with 
"Closes" keyword.

### Breaking Changes

All breaking changes have to be mentioned in the footer with the description of 
the change, justification and migration notes. Start the block explaining the 
breaking changes with the words `BREAKING CHANGE:` followed by a space. 

### Examples

```
fix(AwesomeComponent): remove console log statements

Remove log statements to prevent IE4 errors.

Closes ACME-123, ACME-456
```

```
refactor(*): change constant names

Adjust constant names, following the new naming conventions.

Closes ACME-123
```

```
refactor(VideoPlayer): simplify control interface

Simplify the VideoPlayer control interface as the current
interface is somewhat hard to use and caused bugs due
to accidental misuse.

BREAKING CHANGE: VideoPlayer control interface has changed
to simplify the general usage.

To migrate the code follow the example below:

Before:

VideoPlayer.prototype.stop({pause:true})

After:

VideoPlayer.prototype.pause()
```

### Working with ReactJS Components

To develop ReactJS Components and see the implications immediately in DC/OS UI, it is helpful to use [npm link](https://docs.npmjs.com/cli/link).

1. Run `npm run dist-src` in your `reactjs-components` directory.
2. Run `npm link` in your `reactjs-components` directory.
3. Run `npm link reactjs-components` in your `dcos-ui` directory.
4. Run `export REACTJS_COMPONENTS_LOCAL=true; npm start` to start the Webpack dev server with the proper configuration variable.
5. After any changes are made to `reactjs-components`, run `npm run dist-src` in the `reactjs-components` directory.
