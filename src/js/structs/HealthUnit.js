import Item from "./Item";
import StringUtil from "../utils/StringUtil";
import UnitHealthUtil from "../utils/UnitHealthUtil";

const ID_PREFIX = "dcos-";
const REPLACE_IN_ID = { dns: "DNS" };

class HealthUnit extends Item {
  getHealth() {
    return UnitHealthUtil.getHealth(this.get("health"));
  }

  getTitle() {
    let title = this.get("name");
    if (!title) {
      title = this.getPrettyPrintID();
    }

    return title;
  }

  getPrettyPrintID() {
    let id = this.get("id") || "";
    const prefixIndex = id.indexOf(ID_PREFIX);

    if (prefixIndex >= 0) {
      id = id.slice(prefixIndex + ID_PREFIX.length);
    }

    return StringUtil.idToTitle([id], [".", "-"], REPLACE_IN_ID, true);
  }
}

module.exports = HealthUnit;
