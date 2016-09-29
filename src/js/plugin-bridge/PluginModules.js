// Modules to paths
module.exports = {
  constants: {
    EventTypes: 'EventTypes',
    FrameworkConstants: 'FrameworkConstants',
    HTTPStatusCodes: 'HTTPStatusCodes'
  },
  events: {
    SidebarActions: 'SidebarActions'
  },
  stores: {
    AuthStore: 'AuthStore',
    BaseStore: 'BaseStore',
    ConfigStore: 'ConfigStore',
    CosmosPackagesStore: 'CosmosPackagesStore',
    MarathonStore: 'MarathonStore',
    MetadataStore: 'MetadataStore',
    NotificationStore: 'NotificationStore',
    UsersStore: 'UsersStore',
    UserStore: 'UserStore',
    VisibilityStore: 'VisibilityStore'
  },
  structs: {
    CompositeState: 'CompositeState',
    Item: 'Item',
    List: 'List',
    Tree: 'Tree'
  },
  utils: {
    ApplicationUtil: 'ApplicationUtil',
    CookieUtils: 'CookieUtils',
    DateUtil: 'DateUtil',
    DOMUtils: 'DOMUtils',
    FormUtil: 'FormUtil',
    LocalStorageUtil: 'LocalStorageUtil',
    Maths: 'Maths',
    ResourceTableUtil: 'ResourceTableUtil',
    RouterUtil: 'RouterUtil',
    StringUtil: 'StringUtil',
    TableUtil: 'TableUtil',
    TabsUtil: 'TabsUtil',
    Units: 'Units',
    Util: 'Util'
  },
  mixins: {
    InternalStorageMixin: 'InternalStorageMixin',
    TabsMixin: 'TabsMixin'
  },
  components: {
    AccessDeniedPage: 'AccessDeniedPage',
    ActionsModal: 'modals/ActionsModal',
    AlertPanel: 'AlertPanel',
    Authenticated: 'Authenticated',
    Breadcrumbs: 'Breadcrumbs',
    Chart: 'charts/Chart',
    CheckboxTable: 'CheckboxTable',
    ClipboardTrigger: 'ClipboardTrigger',
    ClusterHeader: 'ClusterHeader',
    ClusterName: 'ClusterName',
    CollapsingString: 'CollapsingString',
    DetailViewHeader: 'DetailViewHeader',
    DCOSLogo: 'DCOSLogo',
    DescriptionList: 'DescriptionList',
    FilterBar: 'FilterBar',
    FilterButtons: 'FilterButtons',
    FilterHeadline: 'FilterHeadline',
    FilterInputText: 'FilterInputText',
    FormModal: 'FormModal',
    Icon: 'Icon',
    Loader: 'Loader',
    MesosphereLogo: 'icons/MesosphereLogo',
    NestedServiceLinks: 'NestedServiceLinks',
    Page: 'Page',
    RequestErrorMsg: 'RequestErrorMsg',
    StatusBar: 'StatusBar',
    TabForm: 'TabForm',
    ToggleButton: 'ToggleButton',
    Typeahead: 'Typeahead',
    UserDropup: 'UserDropup'
  },
  config: {
    Config: 'Config'
  },
  systemPages: {
    UsersTab: 'UsersTab'
  }
};
