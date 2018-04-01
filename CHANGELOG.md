# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

<a name="1.2.0"></a>
# [1.2.0](https://github.com/dcos/dcos-ui/compare/v1.12.0-rc.1...v1.2.0) (2018-04-01)


### Bug Fixes

* **build:** stop browser from opened automatically ([7301c95](https://github.com/dcos/dcos-ui/commit/7301c95))
* **ci:** add http-server as devDependency ([cfeea0c](https://github.com/dcos/dcos-ui/commit/cfeea0c))
* **ci:** add junit-merge as devDependency ([57e2e47](https://github.com/dcos/dcos-ui/commit/57e2e47))
* **ci:** fix release file name ([9d619a2](https://github.com/dcos/dcos-ui/commit/9d619a2))
* **ci:** use find instead of foreach glob ([51d986f](https://github.com/dcos/dcos-ui/commit/51d986f))
* **commitlint:** update the commit linting to new versions ([4eb602c](https://github.com/dcos/dcos-ui/commit/4eb602c))
* **FrameworkConfigurationForm:** improve schema errors ([4668a25](https://github.com/dcos/dcos-ui/commit/4668a25))
* **FrameworkForm:** remove extra onChange call ([47f5d9c](https://github.com/dcos/dcos-ui/commit/47f5d9c))
* **githooks:** fix post-checkout-hook ([7b67d25](https://github.com/dcos/dcos-ui/commit/7b67d25))
* **integration-tests:** fix globbing for result merging ([5408904](https://github.com/dcos/dcos-ui/commit/5408904))
* **jenkinsfile:** installs correct node version ([9e09647](https://github.com/dcos/dcos-ui/commit/9e09647))
* **MesosStateStore:** adjust stream data handling ([806e4db](https://github.com/dcos/dcos-ui/commit/806e4db))
* **moment:** update moment ([2370aa4](https://github.com/dcos/dcos-ui/commit/2370aa4))
* **mount:** fix mistranslated test to old form ([3de11ba](https://github.com/dcos/dcos-ui/commit/3de11ba))
* **NodeBreadcrumbs:** check if node exists before relying on it ([f5e862f](https://github.com/dcos/dcos-ui/commit/f5e862f))
* **package:** add check-env as prestart again ([02ff3e4](https://github.com/dcos/dcos-ui/commit/02ff3e4))
* **package.json:** fix packages version in package.json ([578165b](https://github.com/dcos/dcos-ui/commit/578165b))
* **PodStorageConfigSection:** display DSS type and size ([fa4f723](https://github.com/dcos/dcos-ui/commit/fa4f723))
* **pre-push:** fix old reference to commit lint tool ([816fc3f](https://github.com/dcos/dcos-ui/commit/816fc3f))
* **ResourcesUtil:** fix undefined or null object ([ff0673d](https://github.com/dcos/dcos-ui/commit/ff0673d))
* **scripts:** adapt validate-engines to respect devDeps ([89b912e](https://github.com/dcos/dcos-ui/commit/89b912e))
* **scripts:** make post-checkout executable ([7f756ca](https://github.com/dcos/dcos-ui/commit/7f756ca))
* **service-util:** support Pods task ids ([4b0f52a](https://github.com/dcos/dcos-ui/commit/4b0f52a))
* **ServiceOtherDSLSection.js:** rename package to catalog ([f647512](https://github.com/dcos/dcos-ui/commit/f647512))
* **services-table:** hide text if the service status is N/A ([20e8d82](https://github.com/dcos/dcos-ui/commit/20e8d82))
* **ServicesContainer:** checks and updates modalProps if needed ([e5d18b1](https://github.com/dcos/dcos-ui/commit/e5d18b1))
* **storage:** adjust getDefinition default ([6e7f498](https://github.com/dcos/dcos-ui/commit/6e7f498))
* **taskdetails:** remove misleading endpoints row from config table ([0049154](https://github.com/dcos/dcos-ui/commit/0049154))
* **TaskFileViewer:** fix url break on multiple file navigations ([3583607](https://github.com/dcos/dcos-ui/commit/3583607))
* **TaskFileViewer-tests:** fix tests that were skipped ([d24a5cd](https://github.com/dcos/dcos-ui/commit/d24a5cd))
* **TasksView:** fix undefined service in TasksView ([ecac61d](https://github.com/dcos/dcos-ui/commit/ecac61d))
* **vips:** keep VIP label ([fb33fe8](https://github.com/dcos/dcos-ui/commit/fb33fe8))
* **webpack:** set empty string as filename ([f5d9bc5](https://github.com/dcos/dcos-ui/commit/f5d9bc5))
* **webpack:** update raml loader ([b0b6a47](https://github.com/dcos/dcos-ui/commit/b0b6a47))


### Features

* **ci:** move http-server call to shellscript ([69cc039](https://github.com/dcos/dcos-ui/commit/69cc039))
* **ci:** use standard-version ([f610cb5](https://github.com/dcos/dcos-ui/commit/f610cb5))
* **EditServiceModal:** show cosmos services in json-schema form ([8866e50](https://github.com/dcos/dcos-ui/commit/8866e50))
* **githooks:** check node version on checkout ([1b838b2](https://github.com/dcos/dcos-ui/commit/1b838b2))
* **mesos-stream:** repeat the stream ([de0cfad](https://github.com/dcos/dcos-ui/commit/de0cfad))
* **MesosStateStore:** add linearBackoff retry to the stream ([ca1ae04](https://github.com/dcos/dcos-ui/commit/ca1ae04))
* **NetworkingFormSection:** enable service endpoints on ucr ([ddb279f](https://github.com/dcos/dcos-ui/commit/ddb279f))
* **package-describe:** add fixture for x-region:string ([7f52516](https://github.com/dcos/dcos-ui/commit/7f52516))
* **package.json:** adds node & npm as dependency ([1eb1271](https://github.com/dcos/dcos-ui/commit/1eb1271))
* **Packages:** respect minDcosReleaseVersion ([fa1d0c8](https://github.com/dcos/dcos-ui/commit/fa1d0c8))
* **service-filters:** align status filters ([01ed942](https://github.com/dcos/dcos-ui/commit/01ed942))
* **task-details-tab:** display task's ip addresses ([c56553a](https://github.com/dcos/dcos-ui/commit/c56553a))
