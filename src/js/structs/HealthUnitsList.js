import List from "./List";
import HealthUnit from "./HealthUnit";
import StringUtil from "../utils/StringUtil";
import UnitHealthUtil from "../utils/UnitHealthUtil";

class HealthUnitsList extends List {
  filter(filters) {
    let components = this.getItems();

    if (filters) {
      if (filters.title) {
        components = StringUtil.filterByString(
          components,
          function(component) {
            return component.getTitle();
          },
          filters.title
        );
      }

      if (filters.health) {
        components = UnitHealthUtil.filterByHealth(components, filters.health);
      }
    }

    return new HealthUnitsList({ items: components });
  }
}

HealthUnitsList.type = HealthUnit;

module.exports = HealthUnitsList;
