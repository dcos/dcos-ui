// Modules to paths
module.exports = {
  constants: {
    EventTypes: 'EventTypes',
    HTTPStatusCodes: 'HTTPStatusCodes',
    TransactionTypes: 'TransactionTypes'
  },
  events: {
    SidebarActions: 'SidebarActions'
  },
  stores: {
    AuthStore: 'AuthStore',
    BaseStore: 'BaseStore',
    ConfigStore: 'ConfigStore',
    CosmosPackagesStore: 'CosmosPackagesStore',
    MesosStateStore: 'MesosStateStore',
    MetadataStore: 'MetadataStore',
    NotificationStore: 'NotificationStore',
    UsersStore: 'UsersStore',
    UserStore: 'UserStore',
    VisibilityStore: 'VisibilityStore'
  },
  structs: {
    Batch: 'Batch',
    CompositeState: 'CompositeState',
    Item: 'Item',
    List: 'List',
    Transaction: 'Transaction',
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
    MesosStateUtil: 'MesosStateUtil',
    RouterUtil: 'RouterUtil',
    ReducerUtil: 'ReducerUtil',
    ParserUtil: 'ParserUtil',
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
    FluidGeminiScrollbar: 'FluidGeminiScrollbar',
    FormModal: 'FormModal',
    Icon: 'Icon',
    Loader: 'Loader',
    MesosphereLogo: 'icons/MesosphereLogo',
    ModalHeading: 'modals/ModalHeading',
    NestedServiceLinks: 'NestedServiceLinks',
    Page: 'Page',
    RequestErrorMsg: 'RequestErrorMsg',
    StatusBar: 'StatusBar',
    TabForm: 'TabForm',
    ToggleButton: 'ToggleButton',
    Typeahead: 'Typeahead',
    UserFormModal: 'modals/UserFormModal',
    'form-elements': 'form/index'
  },
  config: {
    Config: 'Config'
  },
  systemPages: {
    UsersPage: 'UsersPage'
  },
  routing: {
    routing: 'index'
  },
  navigation: {
    navigation: 'index'
  },
  'foundation-ui': {
    'foundation-ui': 'index'
  },
  internalPlugin: {
    services: 'services/index'
  }
};
