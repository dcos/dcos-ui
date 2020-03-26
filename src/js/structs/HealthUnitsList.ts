import List from "./List";
import HealthUnit from "./HealthUnit";
import StringUtil from "../utils/StringUtil";
import UnitHealthUtil from "../utils/UnitHealthUtil";

export default class HealthUnitsList extends List<HealthUnit> {
  static type = HealthUnit;
  filter(filters) {
    let components = this.getItems();

    if (filters) {
      if (filters.title) {
        components = StringUtil.filterByString(
          components,
          (component) => component.getTitle(),
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
