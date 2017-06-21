module.exports = {
  /**
   * This function adds the given mark to the provided object.
   * Note that this will replace the value of a previous mark.
   *
   * @param {Object} obj - The object to mark
   * @param {Any} mark - The mark to add
   * @return {Object} Returns the passed object
   */
  markObject(obj, mark) {
    Object.defineProperty(obj, "___object_mark___", {
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
  }
};
