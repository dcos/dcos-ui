declare module "mesosphere-shared-reactjs" {
  interface StoreMixin {
    store_initializeListeners(storeListeners: string[]): void;
    componentDidMount(): void;
    componentWillUnmount(): void;
    store_configure(stores: object): void;
    store_addListeners(): void;
    store_removeListeners(): void;
    store_removeEventListenerForStoreID(storeID: string, event: string): void;
    store_onStoreChange(storeID: string, event: string): void;
    store_getChangeFunctionName(storeID: string, event: string): string;
  }

  export var StoreMixin: StoreMixin;
}
