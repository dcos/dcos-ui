import Util from "#SRC/js/utils/Util";

export function getFirstTabAndField(packageDetails) {
  const schema = packageDetails.getConfig() || {};

  const [activeTab] = Object.keys(schema.properties || {});
  const activeTabProperties =
    Util.findNestedPropertyInObject(
      schema,
      `properties.${activeTab}.properties`
    ) || {};
  const [focusField] = Object.keys(activeTabProperties);

  return {
    activeTab,
    focusField
  };
}
