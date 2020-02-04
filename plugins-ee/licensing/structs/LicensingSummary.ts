import Item from "#SRC/js/structs/Item";
import differenceInDays from "date-fns/differenceInDays";

export default class LicensingSummary extends Item {
  getNodeCapacity() {
    return this.get("node_capacity");
  }

  getNumberBreaches() {
    return this.get("number_of_breaches");
  }

  getExpiration() {
    return this.get("end_timestamp");
  }

  getTime() {
    return this.get("current_timestamp");
  }

  getDaysExceeded() {
    // both expiration and timestamp are RFC3339 date-time
    const expiration = new Date(this.getExpiration());
    const timestamp = new Date(this.getTime());

    return differenceInDays(timestamp, expiration);
  }

  hasBreach() {
    return this.getNumberBreaches() > 0;
  }

  hasDaysBreach() {
    // consider it a breach when current day is expiry day
    return this.getDaysExceeded() >= 0;
  }
}
