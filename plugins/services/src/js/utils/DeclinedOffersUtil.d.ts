interface Queue {
  app?: unknown;
  pod?: unknown;
  processedOffersSummary?: unknown;
  lastUnusedOffers?: unknown;
  since?: unknown;
}

interface ItemWithQueue {
  getQueue(): Queue | null;
}

export default class DeclinedOffersUtil {
  static getTimeWaiting(queue: Queue): string | null;
  static displayDeclinedOffersWarning<T extends ItemWithQueue>(
    item: T
  ): boolean;
  getSummaryFromQueue(queue: Queue): unknown;
  getOffersFromQueue(queue: Queue): unknown;
}
