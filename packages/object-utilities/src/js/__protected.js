/**
 * Creates a non-enumerable, non-configurable
 * and non-writeable property in the given object.
 * Use this for properties you want to be considered
 * as protected, functions are public for now.
 *
 * Usage:
 * class WithProtected {
 *   constructor() {
 *     // set multiple properties
 *     __protected(this, { foo: "bar", some: "thing"});
 *     // set/change one
 *     __protected(this).foo = "baz";
 *     // read
 *     alert(__protected(this).foo);
 *   }
 * }
 *
 * @param {Object} object – given object
 * @param {Object} [value] – given value
 * @return {Object} protected property / context
 */
export default function __protected(object, value) {
  if (object === undefined || object === null) {
    throw new Error("no object given or null");
  }
  if (object.__protected__ === undefined) {
    Object.defineProperty(object, "__protected__", {
      configurable: false,
      enumerable: false,
      writeable: false,
      value: {}
    });
  }
  if (value !== undefined) {
    if (typeof value === "object") {
      Object.assign(object.__protected__, value);
    } else {
      throw new Error("value must be an object");
    }
  }

  return object.__protected__;
}
