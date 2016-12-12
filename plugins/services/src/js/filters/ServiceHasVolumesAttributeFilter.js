import DSLFilterTypes from '../../../../../src/js/constants/DSLFilterTypes';
import DSLFilter from '../../../../../src/js/structs/DSLFilter';

const LABEL = 'has';
const LABEL_TEXT = 'volumes';

/**
 * This filter handles the `has:volumes` for filtering services with volumes
 */
class ServiceIsUniverseAttributeFilter extends DSLFilter {

  /**
   * Handle all `has:volumes` attrib filters that we can handle.
   *
   * @override
   */
  filterCanHandle(filterType, filterArguments) {
    return filterType === DSLFilterTypes.ATTRIB &&
      filterArguments.label === LABEL &&
      filterArguments.text.toLowerCase() === LABEL_TEXT;
  }

  /**
   * Keep only services that contain more than 1 volume
   *
   * @override
   */
  filterApply(resultset) {
    return resultset.filterItems((service) => {
      let volumes = service.getVolumes();
      return (volumes.list && volumes.list.length > 0);
    });
  }

}

module.exports = ServiceIsUniverseAttributeFilter;
