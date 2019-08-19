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
  //   listenAlways: true,
  //   suppressUpdate: false
  // }
};

type Listener = "string" | StoreConfig;
type StoreConfig = { name: string; events?: any };

export default {
  store_initializeListeners(storeListeners: Listener[]) {
    // Create a map of listeners, becomes useful later
    const storesListeners: Record<string, StoreConfig> = {};

    // Merges options for each store listener with
    // the ListenersDescription definition above
    storeListeners.forEach(listener => {
      if (typeof listener === "string") {
        if (!ListenersDescription[listener]) {
          return;
        }
        // Use all defaults
        storesListeners[listener] = { ...ListenersDescription[listener] };
      } else {
        const storeName = listener.name;
        const events = listener.events;

        if (!ListenersDescription[storeName]) {
          return;
        }
        // Populate events by key. For example, a component
        // may only want to listen for 'success' events
        if (events) {
          listener.events = {};
          events.forEach((event: any) => {
            listener.events[event] =
              ListenersDescription[storeName].events[event];
          });
        }

        storesListeners[storeName] = {
          ...ListenersDescription[storeName],
          ...listener
        };
      }
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
    Object.keys(this.store_listeners).forEach(storeID => {
      const listenerDetail = this.store_listeners[storeID];
      const events = listenerDetail.events;

      // Check that we actually have events to fire events on
      if (
        process.env.NODE_ENV !== "production" &&
        (typeof events !== "object" || !Object.keys(events).length)
      ) {
        throw new Error(
          "No events found on listener configuration for store " +
            'with ID "' +
            storeID +
            '".'
        );
      }
      // Loop through all available events
      Object.keys(events).forEach(event => {
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
    Object.keys(this.store_listeners).forEach(storeID => {
      const listenerDetail = this.store_listeners[storeID];

      // Loop through all available events
      Object.keys(listenerDetail.events).forEach(event => {
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
    // Maybe remove listener
    if (listenerDetail.unmountWhen && !listenerDetail.listenAlways) {
      // Remove change listener if the settings want to unmount after a certain
      // condition is truthy
      if (listenerDetail.unmountWhen(listenerDetail.store, event)) {
        this.store_removeEventListenerForStoreID(storeID, event);
      }
    }

    // Call callback on component that implements mixin if it exists
    const onChangeFn = this.store_getChangeFunctionName(storeID, event);

    if (this[onChangeFn]) {
      this[onChangeFn].apply(this, args);
    }

    // forceUpdate if not suppressed by configuration
    if (
      listenerDetail.suppressUpdate !== true &&
      typeof this.forceUpdate === "function"
    ) {
      if (process.env.NODE_ENV === "performance") {
        let warning = "Forced upates are an antipattern. ";
        if (this.saveState_key != null) {
          warning += "Check the render method of " + this.saveState_key + ".";
        }
        /* tslint:disable */
        console.warn(warning);
        /* tslint:enable */
      }
      this.forceUpdate();
    }
  },

  store_getChangeFunctionName(storeID: string, event: string) {
    const storeName = StringUtil.capitalize(storeID);
    const eventName = StringUtil.capitalize(event);

    return "on" + storeName + "Store" + eventName;
  }
} as any;
