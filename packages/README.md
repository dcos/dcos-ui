# DC/OS UI packages

## Historical background

This directory has been introduced as a part of the modularization effort. The idea was to extract packages from the UI monolith plugin by plugin and eventually move them into separate repos as they get stable.

We chose the name after the convention widely accepted in the comunity and after the way [lerna.js](https://lernajs.io/) does that.

## Configuration

This directory is included in Webpack's `modulesDirectories` and `root` so that Webpack loads packages from this directory as they would be npm packages with one exception - if a package has it's own dependencies **they won't be automatically installed**.

## Developing a package

We encourage you to consider wrapping a new piece of functionality as a package and putting it in the directory. Be mindful and use your best judgement drawing the line between your package and the UI. There shall be no kitchen sink packages! Package should do, at best, one thing and do it well, though be careful creating a per-function-package. Sometimes less isn't better.

If you need to add dependencies please add them in **both** your package `package.json` and the top-level `package.json` otherwise they won't be installed.

Your package should be well documented and well tested.

Please also consider using our [JavaScript guidelines](https://github.com/dcos/javascript) so the style is aligned.

**Don't** add your package as a local dependency in the top-level `package.json` as it'll break webpack's alias magic and the UI.
