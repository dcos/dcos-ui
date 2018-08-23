# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

<a name="1.20.0"></a>
# [1.20.0](https://github.com/dcos/dcos-ui/compare/v1.11.1...v1.20.0) (2018-08-23)


### Bug Fixes

* do not duplicate container names ([f03985f](https://github.com/dcos/dcos-ui/commit/f03985f))
* show allocated resources for frameworks ([244487a](https://github.com/dcos/dcos-ui/commit/244487a))
* **DCOSStore:** enable health checks to be shown again ([e3a29bf](https://github.com/dcos/dcos-ui/commit/e3a29bf))
* **DSLInputField:** adjust change event handling ([c227b22](https://github.com/dcos/dcos-ui/commit/c227b22))
* **FuzzyTextDSLSection:** apply changes in fuzzy search directly ([f704c10](https://github.com/dcos/dcos-ui/commit/f704c10))
* ignore unused React ([cd1d2f9](https://github.com/dcos/dcos-ui/commit/cd1d2f9))
* **editservicemodal:** render empty modal if the service is not loaded ([bd2d9e9](https://github.com/dcos/dcos-ui/commit/bd2d9e9))
* **marathonUtil:** fix parsePod function ([d4373f5](https://github.com/dcos/dcos-ui/commit/d4373f5))
* **MesosStateStore:** add linearBackoff retry to the stream ([132279e](https://github.com/dcos/dcos-ui/commit/132279e))
* **MesosStateStore:** adjust stream data handling ([f20cf55](https://github.com/dcos/dcos-ui/commit/f20cf55))
* **MesosStateStore:** adjust stream event sampling ([2b2b0a2](https://github.com/dcos/dcos-ui/commit/2b2b0a2))
* **MesosStateStore:** adjust the backoff strategy ([448faf9](https://github.com/dcos/dcos-ui/commit/448faf9))
* **MesosStream:** delay reconnections ([fec41d8](https://github.com/dcos/dcos-ui/commit/fec41d8))
* **MesosStream:** stop replay multicasting the stream ([40ae5b0](https://github.com/dcos/dcos-ui/commit/40ae5b0))
* **NestedServiceLinks:** group link ([5346e1a](https://github.com/dcos/dcos-ui/commit/5346e1a))
* **OverviewDetailTab:** display mesos start and elected time ([ce29e25](https://github.com/dcos/dcos-ui/commit/ce29e25))
* **ServiceDetail:** remove flickering filter bug ([9431312](https://github.com/dcos/dcos-ui/commit/9431312))
* **serviceForm:** fix environment variable reducer ([20a3d20](https://github.com/dcos/dcos-ui/commit/20a3d20))
* **tables/styles:** fix FF collapsed table td ([c85562a](https://github.com/dcos/dcos-ui/commit/c85562a))
* **tasknametextfilter:** include id search in task text filter ([#2875](https://github.com/dcos/dcos-ui/issues/2875)) ([d4ac40d](https://github.com/dcos/dcos-ui/commit/d4ac40d))
* **UnitsHealthTab:** backport form control overflow fix for firefox ([89e2da1](https://github.com/dcos/dcos-ui/commit/89e2da1))
* framework configuration form ([144c847](https://github.com/dcos/dcos-ui/commit/144c847))
* prevent service breadcrumb to update without changes ([402a48f](https://github.com/dcos/dcos-ui/commit/402a48f))
* shows filter default on task page loading ([52041fa](https://github.com/dcos/dcos-ui/commit/52041fa))
* **UserAccountDropdown:** fix menuItems data type ([683fb84](https://github.com/dcos/dcos-ui/commit/683fb84))


### Features

* **EditServiceModal:** show cosmos services in json-schema form ([13ab6be](https://github.com/dcos/dcos-ui/commit/13ab6be))
* caches the flat tree together wit the service tree ([755de4d](https://github.com/dcos/dcos-ui/commit/755de4d))
* **linearBackoff:** add the ability to define a max delay ([086ef89](https://github.com/dcos/dcos-ui/commit/086ef89))
* support docker parameters ([1d0c78a](https://github.com/dcos/dcos-ui/commit/1d0c78a))
* **NetworkingFormSection:** enable service endpoints on ucr ([4c61f1f](https://github.com/dcos/dcos-ui/commit/4c61f1f))
* **privacy:** add privacy in login and user form ([bb19e66](https://github.com/dcos/dcos-ui/commit/bb19e66))


### Performance Improvements

* **DCOSStore:** cache service tree and flat service tree ([cdbbf1e](https://github.com/dcos/dcos-ui/commit/cdbbf1e))
* **MesosStateStore:** introduce a schedulerTasksMap to improve lookups ([fe948be](https://github.com/dcos/dcos-ui/commit/fe948be))
* **Service:** defer service spec creation ([2214f2f](https://github.com/dcos/dcos-ui/commit/2214f2f))
* **TaskMergeDataUtil:** flatten the service tree to avoid extra lookups ([19b09da](https://github.com/dcos/dcos-ui/commit/19b09da))



<a name="1.19.0"></a>
# [1.19.0](https://github.com/dcos/dcos-ui/compare/v1.11.1...v1.19.0) (2018-08-17)


### Bug Fixes

* show allocated resources for frameworks ([244487a](https://github.com/dcos/dcos-ui/commit/244487a))
* **DCOSStore:** enable health checks to be shown again ([e3a29bf](https://github.com/dcos/dcos-ui/commit/e3a29bf))
* **DSLInputField:** adjust change event handling ([c227b22](https://github.com/dcos/dcos-ui/commit/c227b22))
* **editservicemodal:** render empty modal if the service is not loaded ([bd2d9e9](https://github.com/dcos/dcos-ui/commit/bd2d9e9))
* **FuzzyTextDSLSection:** apply changes in fuzzy search directly ([f704c10](https://github.com/dcos/dcos-ui/commit/f704c10))
* **marathonUtil:** fix parsePod function ([d4373f5](https://github.com/dcos/dcos-ui/commit/d4373f5))
* **MesosStateStore:** add linearBackoff retry to the stream ([132279e](https://github.com/dcos/dcos-ui/commit/132279e))
* **MesosStateStore:** adjust stream data handling ([f20cf55](https://github.com/dcos/dcos-ui/commit/f20cf55))
* **MesosStateStore:** adjust stream event sampling ([2b2b0a2](https://github.com/dcos/dcos-ui/commit/2b2b0a2))
* **MesosStateStore:** adjust the backoff strategy ([448faf9](https://github.com/dcos/dcos-ui/commit/448faf9))
* **MesosStream:** delay reconnections ([fec41d8](https://github.com/dcos/dcos-ui/commit/fec41d8))
* **MesosStream:** stop replay multicasting the stream ([40ae5b0](https://github.com/dcos/dcos-ui/commit/40ae5b0))
* **NestedServiceLinks:** group link ([5346e1a](https://github.com/dcos/dcos-ui/commit/5346e1a))
* **OverviewDetailTab:** display mesos start and elected time ([ce29e25](https://github.com/dcos/dcos-ui/commit/ce29e25))
* **ServiceDetail:** remove flickering filter bug ([9431312](https://github.com/dcos/dcos-ui/commit/9431312))
* **serviceForm:** fix environment variable reducer ([20a3d20](https://github.com/dcos/dcos-ui/commit/20a3d20))
* framework configuration form ([144c847](https://github.com/dcos/dcos-ui/commit/144c847))
* **tables/styles:** fix FF collapsed table td ([c85562a](https://github.com/dcos/dcos-ui/commit/c85562a))
* **tasknametextfilter:** include id search in task text filter ([#2875](https://github.com/dcos/dcos-ui/issues/2875)) ([d4ac40d](https://github.com/dcos/dcos-ui/commit/d4ac40d))
* **UserAccountDropdown:** fix menuItems data type ([683fb84](https://github.com/dcos/dcos-ui/commit/683fb84))
* ignore unused React ([cd1d2f9](https://github.com/dcos/dcos-ui/commit/cd1d2f9))
* prevent service breadcrumb to update without changes ([402a48f](https://github.com/dcos/dcos-ui/commit/402a48f))
* shows filter default on task page loading ([52041fa](https://github.com/dcos/dcos-ui/commit/52041fa))


### Features

* **EditServiceModal:** show cosmos services in json-schema form ([13ab6be](https://github.com/dcos/dcos-ui/commit/13ab6be))
* caches the flat tree together wit the service tree ([755de4d](https://github.com/dcos/dcos-ui/commit/755de4d))
* **linearBackoff:** add the ability to define a max delay ([086ef89](https://github.com/dcos/dcos-ui/commit/086ef89))
* support docker parameters ([1d0c78a](https://github.com/dcos/dcos-ui/commit/1d0c78a))
* **NetworkingFormSection:** enable service endpoints on ucr ([4c61f1f](https://github.com/dcos/dcos-ui/commit/4c61f1f))
* **privacy:** add privacy in login and user form ([bb19e66](https://github.com/dcos/dcos-ui/commit/bb19e66))


### Performance Improvements

* **DCOSStore:** cache service tree and flat service tree ([cdbbf1e](https://github.com/dcos/dcos-ui/commit/cdbbf1e))
* **MesosStateStore:** introduce a schedulerTasksMap to improve lookups ([fe948be](https://github.com/dcos/dcos-ui/commit/fe948be))
* **Service:** defer service spec creation ([2214f2f](https://github.com/dcos/dcos-ui/commit/2214f2f))
* **TaskMergeDataUtil:** flatten the service tree to avoid extra lookups ([19b09da](https://github.com/dcos/dcos-ui/commit/19b09da))



<a name="1.18.0"></a>
# [1.18.0](https://github.com/dcos/dcos-ui/compare/v1.11.1...v1.18.0) (2018-08-16)


### Bug Fixes

* show allocated resources for frameworks ([244487a](https://github.com/dcos/dcos-ui/commit/244487a))
* **DCOSStore:** enable health checks to be shown again ([e3a29bf](https://github.com/dcos/dcos-ui/commit/e3a29bf))
* **DSLInputField:** adjust change event handling ([c227b22](https://github.com/dcos/dcos-ui/commit/c227b22))
* **editservicemodal:** render empty modal if the service is not loaded ([bd2d9e9](https://github.com/dcos/dcos-ui/commit/bd2d9e9))
* **FuzzyTextDSLSection:** apply changes in fuzzy search directly ([f704c10](https://github.com/dcos/dcos-ui/commit/f704c10))
* **marathonUtil:** fix parsePod function ([d4373f5](https://github.com/dcos/dcos-ui/commit/d4373f5))
* **MesosStateStore:** add linearBackoff retry to the stream ([132279e](https://github.com/dcos/dcos-ui/commit/132279e))
* **MesosStateStore:** adjust stream data handling ([f20cf55](https://github.com/dcos/dcos-ui/commit/f20cf55))
* **MesosStateStore:** adjust stream event sampling ([2b2b0a2](https://github.com/dcos/dcos-ui/commit/2b2b0a2))
* **MesosStateStore:** adjust the backoff strategy ([448faf9](https://github.com/dcos/dcos-ui/commit/448faf9))
* **MesosStream:** delay reconnections ([fec41d8](https://github.com/dcos/dcos-ui/commit/fec41d8))
* **MesosStream:** stop replay multicasting the stream ([40ae5b0](https://github.com/dcos/dcos-ui/commit/40ae5b0))
* **NestedServiceLinks:** group link ([5346e1a](https://github.com/dcos/dcos-ui/commit/5346e1a))
* **OverviewDetailTab:** display mesos start and elected time ([ce29e25](https://github.com/dcos/dcos-ui/commit/ce29e25))
* **ServiceDetail:** remove flickering filter bug ([9431312](https://github.com/dcos/dcos-ui/commit/9431312))
* **serviceForm:** fix environment variable reducer ([20a3d20](https://github.com/dcos/dcos-ui/commit/20a3d20))
* framework configuration form ([144c847](https://github.com/dcos/dcos-ui/commit/144c847))
* **tables/styles:** fix FF collapsed table td ([c85562a](https://github.com/dcos/dcos-ui/commit/c85562a))
* **tasknametextfilter:** include id search in task text filter ([#2875](https://github.com/dcos/dcos-ui/issues/2875)) ([d4ac40d](https://github.com/dcos/dcos-ui/commit/d4ac40d))
* **UserAccountDropdown:** fix menuItems data type ([683fb84](https://github.com/dcos/dcos-ui/commit/683fb84))
* ignore unused React ([cd1d2f9](https://github.com/dcos/dcos-ui/commit/cd1d2f9))
* prevent service breadcrumb to update without changes ([402a48f](https://github.com/dcos/dcos-ui/commit/402a48f))
* shows filter default on task page loading ([52041fa](https://github.com/dcos/dcos-ui/commit/52041fa))


### Features

* **EditServiceModal:** show cosmos services in json-schema form ([13ab6be](https://github.com/dcos/dcos-ui/commit/13ab6be))
* caches the flat tree together wit the service tree ([755de4d](https://github.com/dcos/dcos-ui/commit/755de4d))
* **linearBackoff:** add the ability to define a max delay ([086ef89](https://github.com/dcos/dcos-ui/commit/086ef89))
* **privacy:** add privacy in login and user form ([bb19e66](https://github.com/dcos/dcos-ui/commit/bb19e66))
* support docker parameters ([1d0c78a](https://github.com/dcos/dcos-ui/commit/1d0c78a))


### Performance Improvements

* **DCOSStore:** cache service tree and flat service tree ([cdbbf1e](https://github.com/dcos/dcos-ui/commit/cdbbf1e))
* **MesosStateStore:** introduce a schedulerTasksMap to improve lookups ([fe948be](https://github.com/dcos/dcos-ui/commit/fe948be))
* **Service:** defer service spec creation ([2214f2f](https://github.com/dcos/dcos-ui/commit/2214f2f))
* **TaskMergeDataUtil:** flatten the service tree to avoid extra lookups ([19b09da](https://github.com/dcos/dcos-ui/commit/19b09da))



<a name="1.17.0"></a>
# [1.17.0](https://github.com/dcos/dcos-ui/compare/v1.11.1...v1.17.0) (2018-08-03)


### Bug Fixes

* show allocated resources for frameworks ([244487a](https://github.com/dcos/dcos-ui/commit/244487a))
* **DCOSStore:** enable health checks to be shown again ([e3a29bf](https://github.com/dcos/dcos-ui/commit/e3a29bf))
* **DSLInputField:** adjust change event handling ([c227b22](https://github.com/dcos/dcos-ui/commit/c227b22))
* **editservicemodal:** render empty modal if the service is not loaded ([bd2d9e9](https://github.com/dcos/dcos-ui/commit/bd2d9e9))
* **marathonUtil:** fix parsePod function ([d4373f5](https://github.com/dcos/dcos-ui/commit/d4373f5))
* **MesosStateStore:** add linearBackoff retry to the stream ([132279e](https://github.com/dcos/dcos-ui/commit/132279e))
* **MesosStateStore:** adjust stream data handling ([f20cf55](https://github.com/dcos/dcos-ui/commit/f20cf55))
* **MesosStateStore:** adjust stream event sampling ([2b2b0a2](https://github.com/dcos/dcos-ui/commit/2b2b0a2))
* **MesosStateStore:** adjust the backoff strategy ([448faf9](https://github.com/dcos/dcos-ui/commit/448faf9))
* **MesosStream:** delay reconnections ([fec41d8](https://github.com/dcos/dcos-ui/commit/fec41d8))
* **MesosStream:** stop replay multicasting the stream ([40ae5b0](https://github.com/dcos/dcos-ui/commit/40ae5b0))
* **NestedServiceLinks:** group link ([5346e1a](https://github.com/dcos/dcos-ui/commit/5346e1a))
* **OverviewDetailTab:** display mesos start and elected time ([ce29e25](https://github.com/dcos/dcos-ui/commit/ce29e25))
* **tables/styles:** fix FF collapsed table td ([c85562a](https://github.com/dcos/dcos-ui/commit/c85562a))
* **tasknametextfilter:** include id search in task text filter ([#2875](https://github.com/dcos/dcos-ui/issues/2875)) ([d4ac40d](https://github.com/dcos/dcos-ui/commit/d4ac40d))
* framework configuration form ([144c847](https://github.com/dcos/dcos-ui/commit/144c847))
* ignore unused React ([cd1d2f9](https://github.com/dcos/dcos-ui/commit/cd1d2f9))
* prevent service breadcrumb to update without changes ([402a48f](https://github.com/dcos/dcos-ui/commit/402a48f))
* shows filter default on task page loading ([52041fa](https://github.com/dcos/dcos-ui/commit/52041fa))
* **UserAccountDropdown:** fix menuItems data type ([683fb84](https://github.com/dcos/dcos-ui/commit/683fb84))


### Features

* **EditServiceModal:** show cosmos services in json-schema form ([13ab6be](https://github.com/dcos/dcos-ui/commit/13ab6be))
* caches the flat tree together wit the service tree ([755de4d](https://github.com/dcos/dcos-ui/commit/755de4d))
* **linearBackoff:** add the ability to define a max delay ([086ef89](https://github.com/dcos/dcos-ui/commit/086ef89))
* **privacy:** add privacy in login and user form ([bb19e66](https://github.com/dcos/dcos-ui/commit/bb19e66))
* support docker parameters ([1d0c78a](https://github.com/dcos/dcos-ui/commit/1d0c78a))


### Performance Improvements

* **DCOSStore:** cache service tree and flat service tree ([cdbbf1e](https://github.com/dcos/dcos-ui/commit/cdbbf1e))
* **MesosStateStore:** introduce a schedulerTasksMap to improve lookups ([fe948be](https://github.com/dcos/dcos-ui/commit/fe948be))
* **Service:** defer service spec creation ([2214f2f](https://github.com/dcos/dcos-ui/commit/2214f2f))
* **TaskMergeDataUtil:** flatten the service tree to avoid extra lookups ([19b09da](https://github.com/dcos/dcos-ui/commit/19b09da))



<a name="1.16.0"></a>
# [1.16.0](https://github.com/dcos/dcos-ui/compare/v1.11.1...v1.16.0) (2018-07-27)


### Bug Fixes

* show allocated resources for frameworks ([244487a](https://github.com/dcos/dcos-ui/commit/244487a))
* **DCOSStore:** enable health checks to be shown again ([e3a29bf](https://github.com/dcos/dcos-ui/commit/e3a29bf))
* **DSLInputField:** adjust change event handling ([c227b22](https://github.com/dcos/dcos-ui/commit/c227b22))
* **editservicemodal:** render empty modal if the service is not loaded ([bd2d9e9](https://github.com/dcos/dcos-ui/commit/bd2d9e9))
* **marathonUtil:** fix parsePod function ([d4373f5](https://github.com/dcos/dcos-ui/commit/d4373f5))
* **MesosStateStore:** add linearBackoff retry to the stream ([132279e](https://github.com/dcos/dcos-ui/commit/132279e))
* **MesosStateStore:** adjust stream data handling ([f20cf55](https://github.com/dcos/dcos-ui/commit/f20cf55))
* **MesosStateStore:** adjust stream event sampling ([2b2b0a2](https://github.com/dcos/dcos-ui/commit/2b2b0a2))
* **MesosStateStore:** adjust the backoff strategy ([448faf9](https://github.com/dcos/dcos-ui/commit/448faf9))
* **MesosStream:** delay reconnections ([fec41d8](https://github.com/dcos/dcos-ui/commit/fec41d8))
* **MesosStream:** stop replay multicasting the stream ([40ae5b0](https://github.com/dcos/dcos-ui/commit/40ae5b0))
* prevent service breadcrumb to update without changes ([402a48f](https://github.com/dcos/dcos-ui/commit/402a48f))
* **NestedServiceLinks:** group link ([5346e1a](https://github.com/dcos/dcos-ui/commit/5346e1a))
* ignore unused React ([cd1d2f9](https://github.com/dcos/dcos-ui/commit/cd1d2f9))
* **OverviewDetailTab:** display mesos start and elected time ([ce29e25](https://github.com/dcos/dcos-ui/commit/ce29e25))
* **tables/styles:** fix FF collapsed table td ([c85562a](https://github.com/dcos/dcos-ui/commit/c85562a))
* **tasknametextfilter:** include id search in task text filter ([#2875](https://github.com/dcos/dcos-ui/issues/2875)) ([d4ac40d](https://github.com/dcos/dcos-ui/commit/d4ac40d))
* **UserAccountDropdown:** fix menuItems data type ([683fb84](https://github.com/dcos/dcos-ui/commit/683fb84))
* shows filter default on task page loading ([52041fa](https://github.com/dcos/dcos-ui/commit/52041fa))


### Features

* **EditServiceModal:** show cosmos services in json-schema form ([13ab6be](https://github.com/dcos/dcos-ui/commit/13ab6be))
* caches the flat tree together wit the service tree ([755de4d](https://github.com/dcos/dcos-ui/commit/755de4d))
* **linearBackoff:** add the ability to define a max delay ([086ef89](https://github.com/dcos/dcos-ui/commit/086ef89))
* **privacy:** add privacy in login and user form ([bb19e66](https://github.com/dcos/dcos-ui/commit/bb19e66))
* support docker parameters ([1d0c78a](https://github.com/dcos/dcos-ui/commit/1d0c78a))


### Performance Improvements

* **DCOSStore:** cache service tree and flat service tree ([cdbbf1e](https://github.com/dcos/dcos-ui/commit/cdbbf1e))
* **MesosStateStore:** introduce a schedulerTasksMap to improve lookups ([fe948be](https://github.com/dcos/dcos-ui/commit/fe948be))
* **Service:** defer service spec creation ([2214f2f](https://github.com/dcos/dcos-ui/commit/2214f2f))
* **TaskMergeDataUtil:** flatten the service tree to avoid extra lookups ([19b09da](https://github.com/dcos/dcos-ui/commit/19b09da))



<a name="1.15.0"></a>
# [1.15.0](https://github.com/dcos/dcos-ui/compare/v1.11.1...v1.15.0) (2018-07-16)


### Bug Fixes

* show allocated resources for frameworks ([244487a](https://github.com/dcos/dcos-ui/commit/244487a))
* **DCOSStore:** enable health checks to be shown again ([e3a29bf](https://github.com/dcos/dcos-ui/commit/e3a29bf))
* **DSLInputField:** adjust change event handling ([c227b22](https://github.com/dcos/dcos-ui/commit/c227b22))
* **editservicemodal:** render empty modal if the service is not loaded ([bd2d9e9](https://github.com/dcos/dcos-ui/commit/bd2d9e9))
* **marathonUtil:** fix parsePod function ([d4373f5](https://github.com/dcos/dcos-ui/commit/d4373f5))
* **MesosStateStore:** add linearBackoff retry to the stream ([132279e](https://github.com/dcos/dcos-ui/commit/132279e))
* **MesosStateStore:** adjust stream data handling ([f20cf55](https://github.com/dcos/dcos-ui/commit/f20cf55))
* **MesosStateStore:** adjust stream event sampling ([2b2b0a2](https://github.com/dcos/dcos-ui/commit/2b2b0a2))
* **MesosStateStore:** adjust the backoff strategy ([448faf9](https://github.com/dcos/dcos-ui/commit/448faf9))
* **MesosStream:** delay reconnections ([fec41d8](https://github.com/dcos/dcos-ui/commit/fec41d8))
* **MesosStream:** stop replay multicasting the stream ([40ae5b0](https://github.com/dcos/dcos-ui/commit/40ae5b0))
* prevent service breadcrumb to update without changes ([402a48f](https://github.com/dcos/dcos-ui/commit/402a48f))
* **NestedServiceLinks:** group link ([5346e1a](https://github.com/dcos/dcos-ui/commit/5346e1a))
* ignore unused React ([cd1d2f9](https://github.com/dcos/dcos-ui/commit/cd1d2f9))
* **OverviewDetailTab:** display mesos start and elected time ([ce29e25](https://github.com/dcos/dcos-ui/commit/ce29e25))
* **tables/styles:** fix FF collapsed table td ([c85562a](https://github.com/dcos/dcos-ui/commit/c85562a))
* **tasknametextfilter:** include id search in task text filter ([#2875](https://github.com/dcos/dcos-ui/issues/2875)) ([d4ac40d](https://github.com/dcos/dcos-ui/commit/d4ac40d))
* **UserAccountDropdown:** fix menuItems data type ([683fb84](https://github.com/dcos/dcos-ui/commit/683fb84))
* shows filter default on task page loading ([52041fa](https://github.com/dcos/dcos-ui/commit/52041fa))


### Features

* **EditServiceModal:** show cosmos services in json-schema form ([13ab6be](https://github.com/dcos/dcos-ui/commit/13ab6be))
* caches the flat tree together wit the service tree ([755de4d](https://github.com/dcos/dcos-ui/commit/755de4d))
* **linearBackoff:** add the ability to define a max delay ([086ef89](https://github.com/dcos/dcos-ui/commit/086ef89))
* **privacy:** add privacy in login and user form ([bb19e66](https://github.com/dcos/dcos-ui/commit/bb19e66))


### Performance Improvements

* **DCOSStore:** cache service tree and flat service tree ([cdbbf1e](https://github.com/dcos/dcos-ui/commit/cdbbf1e))
* **MesosStateStore:** introduce a schedulerTasksMap to improve lookups ([fe948be](https://github.com/dcos/dcos-ui/commit/fe948be))
* **Service:** defer service spec creation ([2214f2f](https://github.com/dcos/dcos-ui/commit/2214f2f))
* **TaskMergeDataUtil:** flatten the service tree to avoid extra lookups ([19b09da](https://github.com/dcos/dcos-ui/commit/19b09da))



<a name="1.14.0"></a>
# [1.14.0](https://github.com/dcos/dcos-ui/compare/v1.11.1...v1.14.0) (2018-06-04)


### Bug Fixes

* **DCOSStore:** enable health checks to be shown again ([e3a29bf](https://github.com/dcos/dcos-ui/commit/e3a29bf))
* **DSLInputField:** adjust change event handling ([c227b22](https://github.com/dcos/dcos-ui/commit/c227b22))
* **editservicemodal:** render empty modal if the service is not loaded ([bd2d9e9](https://github.com/dcos/dcos-ui/commit/bd2d9e9))
* **marathonUtil:** fix parsePod function ([d4373f5](https://github.com/dcos/dcos-ui/commit/d4373f5))
* **MesosStateStore:** add linearBackoff retry to the stream ([132279e](https://github.com/dcos/dcos-ui/commit/132279e))
* ignore unused React ([cd1d2f9](https://github.com/dcos/dcos-ui/commit/cd1d2f9))
* **MesosStateStore:** adjust stream data handling ([f20cf55](https://github.com/dcos/dcos-ui/commit/f20cf55))
* prevent service breadcrumb to update without changes ([402a48f](https://github.com/dcos/dcos-ui/commit/402a48f))
* shows filter default on task page loading ([52041fa](https://github.com/dcos/dcos-ui/commit/52041fa))
* **MesosStateStore:** adjust stream event sampling ([2b2b0a2](https://github.com/dcos/dcos-ui/commit/2b2b0a2))
* **MesosStream:** delay reconnections ([fec41d8](https://github.com/dcos/dcos-ui/commit/fec41d8))
* **NestedServiceLinks:** group link ([5346e1a](https://github.com/dcos/dcos-ui/commit/5346e1a))
* **OverviewDetailTab:** display mesos start and elected time ([ce29e25](https://github.com/dcos/dcos-ui/commit/ce29e25))
* **tasknametextfilter:** include id search in task text filter ([#2875](https://github.com/dcos/dcos-ui/issues/2875)) ([d4ac40d](https://github.com/dcos/dcos-ui/commit/d4ac40d))
* **UserAccountDropdown:** fix menuItems data type ([683fb84](https://github.com/dcos/dcos-ui/commit/683fb84))


### Features

* **EditServiceModal:** show cosmos services in json-schema form ([13ab6be](https://github.com/dcos/dcos-ui/commit/13ab6be))
* **privacy:** add privacy in login and user form ([bb19e66](https://github.com/dcos/dcos-ui/commit/bb19e66))
* caches the flat tree together wit the service tree ([755de4d](https://github.com/dcos/dcos-ui/commit/755de4d))


### Performance Improvements

* **DCOSStore:** cache service tree and flat service tree ([cdbbf1e](https://github.com/dcos/dcos-ui/commit/cdbbf1e))
* **MesosStateStore:** introduce a schedulerTasksMap to improve lookups ([fe948be](https://github.com/dcos/dcos-ui/commit/fe948be))
* **Service:** defer service spec creation ([2214f2f](https://github.com/dcos/dcos-ui/commit/2214f2f))
* **TaskMergeDataUtil:** flatten the service tree to avoid extra lookups ([19b09da](https://github.com/dcos/dcos-ui/commit/19b09da))



<a name="1.13.0"></a>
# [1.13.0](https://github.com/dcos/dcos-ui/compare/v1.11.1...v1.13.0) (2018-05-24)


### Bug Fixes

* **DSLInputField:** adjust change event handling ([c227b22](https://github.com/dcos/dcos-ui/commit/c227b22))
* **editservicemodal:** render empty modal if the service is not loaded ([bd2d9e9](https://github.com/dcos/dcos-ui/commit/bd2d9e9))
* **marathonUtil:** fix parsePod function ([d4373f5](https://github.com/dcos/dcos-ui/commit/d4373f5))
* **MesosStateStore:** add linearBackoff retry to the stream ([132279e](https://github.com/dcos/dcos-ui/commit/132279e))
* **MesosStateStore:** adjust stream data handling ([f20cf55](https://github.com/dcos/dcos-ui/commit/f20cf55))
* **MesosStateStore:** adjust stream event sampling ([2b2b0a2](https://github.com/dcos/dcos-ui/commit/2b2b0a2))
* **MesosStream:** delay reconnections ([fec41d8](https://github.com/dcos/dcos-ui/commit/fec41d8))
* **NestedServiceLinks:** group link ([5346e1a](https://github.com/dcos/dcos-ui/commit/5346e1a))
* **OverviewDetailTab:** display mesos start and elected time ([ce29e25](https://github.com/dcos/dcos-ui/commit/ce29e25))
* shows filter default on task page loading ([52041fa](https://github.com/dcos/dcos-ui/commit/52041fa))
* **tasknametextfilter:** include id search in task text filter ([#2875](https://github.com/dcos/dcos-ui/issues/2875)) ([d4ac40d](https://github.com/dcos/dcos-ui/commit/d4ac40d))
* ignore unused React ([cd1d2f9](https://github.com/dcos/dcos-ui/commit/cd1d2f9))
* prevent service breadcrumb to update without changes ([402a48f](https://github.com/dcos/dcos-ui/commit/402a48f))
* **UserAccountDropdown:** fix menuItems data type ([683fb84](https://github.com/dcos/dcos-ui/commit/683fb84))


### Features

* **EditServiceModal:** show cosmos services in json-schema form ([13ab6be](https://github.com/dcos/dcos-ui/commit/13ab6be))
* **privacy:** add privacy in login and user form ([bb19e66](https://github.com/dcos/dcos-ui/commit/bb19e66))


### Performance Improvements

* **MesosStateStore:** introduce a schedulerTasksMap to improve lookups ([fe948be](https://github.com/dcos/dcos-ui/commit/fe948be))



<a name="1.12.0"></a>
# [1.12.0](https://github.com/dcos/dcos-ui/compare/v1.11.1...v1.12.0) (2018-04-25)


### Bug Fixes

* **DSLInputField:** adjust change event handling ([c227b22](https://github.com/dcos/dcos-ui/commit/c227b22))
* **editservicemodal:** render empty modal if the service is not loaded ([bd2d9e9](https://github.com/dcos/dcos-ui/commit/bd2d9e9))
* **marathonUtil:** fix parsePod function ([d4373f5](https://github.com/dcos/dcos-ui/commit/d4373f5))
* **MesosStateStore:** add linearBackoff retry to the stream ([132279e](https://github.com/dcos/dcos-ui/commit/132279e))
* **MesosStateStore:** adjust stream data handling ([f20cf55](https://github.com/dcos/dcos-ui/commit/f20cf55))
* shows filter default on task page loading ([52041fa](https://github.com/dcos/dcos-ui/commit/52041fa))
* **MesosStateStore:** adjust stream event sampling ([2b2b0a2](https://github.com/dcos/dcos-ui/commit/2b2b0a2))
* **MesosStream:** delay reconnections ([fec41d8](https://github.com/dcos/dcos-ui/commit/fec41d8))
* **OverviewDetailTab:** display mesos start and elected time ([ce29e25](https://github.com/dcos/dcos-ui/commit/ce29e25))
* **tasknametextfilter:** include id search in task text filter ([#2875](https://github.com/dcos/dcos-ui/issues/2875)) ([d4ac40d](https://github.com/dcos/dcos-ui/commit/d4ac40d))
* **UserAccountDropdown:** fix menuItems data type ([683fb84](https://github.com/dcos/dcos-ui/commit/683fb84))


### Features

* **EditServiceModal:** show cosmos services in json-schema form ([13ab6be](https://github.com/dcos/dcos-ui/commit/13ab6be))
