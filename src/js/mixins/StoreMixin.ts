import StringUtil from "../utils/StringUtil";

const LISTENER_SUFFIX = "ListenerFn";
let ListenersDescription: Record<string, StoreConfig> = {
  // Example store
  // user: {
  //   store: UserStoreHere,
  //   events: {
  //     success: 'USER_STORE_SUCCESS'
  //   },
  //   unmountWhen: function () {
  //     return true;
  //   },
  //   suppressUpdate: false
  // }
};

type Listener = StoreConfig;
type StoreConfig = { name: string; events: any };

export default {
  store_initializeListeners(storeListeners: Listener[]) {
    // Create a map of listeners, becomes useful later
    const storesListeners: Record<string, StoreConfig> = {};

    // Merges options for each store listener with
    // the ListenersDescription definition above
    storeListeners.forEach((listener) => {
      const { events, name } = listener;

      if (!ListenersDescription[name]) {
        return;
      }

      // Populate events by key. For example, a component
      // may only want to listen for 'success' events
      listener.events = {};
      events.forEach((event: any) => {
        listener.events[event] = ListenersDescription[name].events[event];
      });

      storesListeners[name] = { ...ListenersDescription[name], ...listener };
    });

    // Default unmountWhen to unmount immediately when suppressUpdate is not
    // explicity set
    if (
      this.unmountWhen == null &&
      typeof this.suppressUpdate === "undefined"
    ) {
      this.unmountWhen = () => true;
    }

    // TODO: this.store_listeners gets changed from an array to an object here.
    // We shouldn't modify the structure
    this.store_listeners = storesListeners;
    this.store_addListeners();
  },

  // Auto set listeners on react components
  componentDidMount() {
    if (this.store_listeners) {
      this.store_initializeListeners(this.store_listeners);
    }
  },
  // Auto clear listeners on react components
  componentWillUnmount() {
    this.store_removeListeners();
  },

  store_configure(stores: Record<string, StoreConfig>) {
    ListenersDescription = stores;
  },

  store_addListeners() {
    Object.keys(this.store_listeners).forEach((storeID) => {
      const listenerDetail = this.store_listeners[storeID];
      const events = listenerDetail.events;

      // Loop through all available events
      Object.keys(events).forEach((event) => {
        const eventListenerID = event + LISTENER_SUFFIX;

        // Check to see if we are already listening for this event
        if (listenerDetail[eventListenerID]) {
          return;
        }

        // Create listener
        listenerDetail[eventListenerID] = this.store_onStoreChange.bind(
          this,
          storeID,
          event
        );

        // Set up listener with store
        listenerDetail.store.addChangeListener(
          events[event],
          listenerDetail[eventListenerID]
        );
      });
    });
  },

  store_removeListeners() {
    Object.keys(this.store_listeners).forEach((storeID) => {
      const listenerDetail = this.store_listeners[storeID];

      // Loop through all available events
      Object.keys(listenerDetail.events).forEach((event) => {
        this.store_removeEventListenerForStoreID(storeID, event);
      });
    });
  },

  store_removeEventListenerForStoreID(storeID: string, event: string) {
    const listenerDetail = this.store_listeners[storeID];
    const eventListenerID = event + LISTENER_SUFFIX;

    // Return if there was no listener setup
    if (!listenerDetail[eventListenerID]) {
      return;
    }

    listenerDetail.store.removeChangeListener(
      listenerDetail.events[event],
      listenerDetail[eventListenerID]
    );

    listenerDetail[eventListenerID] = null;
  },

  /**
   * This is a callback that will be invoked when stores emit a change event
   *
   * @param  {String} storeID The id of a store
   * @param  {String} event Normally a string containing success|error
   */
  store_onStoreChange(storeID: string, event: string) {
    const args = Array.prototype.slice.call(arguments, 2);
    // See if we need to remove our change listener
    const listenerDetail = this.store_listeners[storeID];
    // Remove change listener if the settings want to unmount after a certain
    // condition is truthy
    if (listenerDetail.unmountWhen?.(listenerDetail.store, event)) {
      this.store_removeEventListenerForStoreID(storeID, event);
    }

    // Call callback on component that implements mixin if it exists
    const onChangeFn = this.store_getChangeFunctionName(storeID, event);
    this[onChangeFn]?.apply(this, args);

    // forceUpdate if not suppressed by configuration
    if (listenerDetail.suppressUpdate !== true) {
      this.forceUpdate?.();
    }
  },

  store_getChangeFunctionName(storeID: string, event: string) {
    const storeName = StringUtil.capitalize(storeID);
    const eventName = StringUtil.capitalize(event);

    return "on" + storeName + "Store" + eventName;
  },
} as any;
