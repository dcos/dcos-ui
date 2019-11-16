import GetSetBaseStore from "./GetSetBaseStore";

class MesosSummaryStore extends GetSetBaseStore {
  init(): void;
  getInitialStates(): any;
  addChangeListener(eventName, callback) {
    this.on(eventName, callback);

    if (!this.shouldPoll()) {
      startPolling.call(this);
    }
  }
  removeChangeListener(eventName: string, callback: () => void): void;
  shouldPoll(): boolean;
  getActiveServices(): any;
  getServiceFromName(name: string): any;
  hasServiceUrl(serviceName: string): boolean;
  getNextRequestTime(): number;
  getLastSuccessfulSummarySnapshot(): object | null;
  processSummary(data: any, options: object = {}): void;
  processSummaryError(options: object = {}): void;
  get storeID(): string;
}

export default new MesosSummaryStore();
