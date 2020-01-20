# Plugins tests setup

## How to tests Plugins

Setup your dcos-ui and run `npm run test:integration` from its root-folder.

## How to write Plugins Tests

In order to satisfy Cypress, files from Plugins are `rsync`ed into dcos-ui before executed:
`rsync -a plugins-ee/tests/ ./tests/`

This means that if you need to access files which are stored in plugins repo, you can use the same path which is valid here.
But if you need to access files from OSS, you need to add one more `../` to the path.
