/**
 * Return a new array or a new object, if the key given is a number or string.
 *
 * @param {String} forKey - The key to create a new object/array for
 * @returns {Object|Array} Returns an object or array, according to type
 */
function newTypeFor(forKey) {
  if (isNaN(forKey)) {
    return {};
  } else {
    return [];
  }
}

var ObjectUtil = {

  /**
   * This function adds the given mark to the provided object.
   * Note that this will replace the value of a previous mark.
   *
   * @param {Object} obj - The object to mark
   * @param {Any} mark - The mark to add
   * @return {Object} Returns the passed object
   */
  markObject(obj, mark) {
    Object.defineProperty(obj, '___object_mark___', {
      value: mark,
      enumerable: false,
      writable: true
    });

    return obj;
  },

  /**
   * This function checks if the object is marked with the given mark.
   *
   * @param {Object} obj - The object to test
   * @param {Any} mark - The mark to compare against
   * @returns {Boolean} Returns true if the mark matches
   */
  objectHasMark(obj, mark) {
    return obj.___object_mark___ === mark;
  },

  /**
   * A function that can be used as a `walkFn` on a `walkSpec` in the
   * `walkObjectsByPath` function (see below) for creating missing object paths.
   *
   * @param {Object} object - The current object being walked
   * @param {String} key - The name of the immediate children to return
   * @param {String} nextKey - The next key in the path (used for type detection)
   * @returns {Object} Returns the child item
   */
  walkCreateMissing(object, key, nextKey) {
    if (object[key] === undefined) {
      object[key] = newTypeFor(nextKey);
    }
    return object[key];
  },

  /**
   * A function that can be used as a `walkFn` on a `walkSpec` in the
   * `walkObjectsByPath` function (see below) for skipping missing paths.
   *
   * If a path is missing this function will return `undefined`.
   *
   * @param {Object} object - The current object being walked
   * @param {String} key - The name of the immediate children to return
   * @returns {Object|undefined} Returns the child item or undefined if a path was missing
   */
  walkSkipMissing(object, key) {
    if (object === undefined) {
      return undefined;
    }
    return object[key];
  },

  /**
   * Walk on one or more objects in parallel following the path given and return
   * the final result of the walk operation.
   *
   * WARNING: We assume the `opFn` will eventually *MUTATE* the object. That's
   *          intentional, since this function can be used to delete items in
   *          the object. If you don't want this behaviour, *YOU* are
   *          responsible for passing object copies.
   *
   * Each `walkSpec` is an object with the following syntax:
   *
   * {
   *   object: {}                   // The object to walk
   *   walkFn(object, key, nextKey) // The walking function
   * }
   *
   * @param {Array} path - The path components as an array of strings
   * @param {Array} walkSpec - One or more objects to walk concurrently (see above)
   * @param {Function} opFn - The operation to perform at the end of the walk
   *
   * @returns {Array} Returns an array with the objects as mutated by the walk op
   *
   */
  walkObjectsByPath(path, walkSpec, opFn) {
    let branchKeys = path.slice(0, -1);
    let leafKey = path[path.length-1];

    // Extract the objects from all
    let objects = walkSpec.map(function (spec) {
      return spec.object;
    });

    // Walk all object paths in parallel
    let leafObjects = branchKeys.reduce(function (objects, key, keyIdx) {
      return objects.map(function (object, specIdx) {
        return (walkSpec[specIdx].walkFn || ObjectUtil.walkCreateMissing)(
          object, key, path[keyIdx+1]
        );
      });
    }, objects);

    // Call the operator function & return the objects root
    opFn(leafObjects, leafKey);
    return objects;
  },

  /**
   * Shorthand for walkObjectsByPath for one object
   *
   * @param {Array} path - The path components as an array of strings
   * @param {Object} object - The object to walk
   * @param {Function} opFn - The operation to perform at the end of the walk
   * @param {Function} walkFn - The function to use for walking the path
   *
   * @returns {Object} Returns the mutated object by the walk op
   */
  walkObjectByPath(path, object, opFn, walkFn=ObjectUtil.walkCreateMissing) {
    return ObjectUtil.walkObjectsByPath(path,
      [{object, walkFn}],
      function (objects, key) {
        return [opFn(objects[0], key)];
      }
    )[0];
  }

};

module.exports = ObjectUtil;
