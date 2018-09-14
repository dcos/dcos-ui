import Util from "#SRC/js/utils/Util";

// eslint-disable-next-line import/prefer-default-export
export function getFirstTabAndField(packageDetails) {
  window.packageDetails = packageDetails;
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
