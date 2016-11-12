/**
 * Creates a globally unique ID for a resource
 * @param  {string} type schema type
 * @param  {string} id   resource's unique id
 * @return {string}      globally unique ID
 */
export const toGlobalId = (type, id) => {
  if (!type || !id || typeof id !== 'string') {
    throw Error(`Invalid arguments for toGlobalId [${type}, ${id}]`);
  }

  return [type, id].join(':');
};

/**
 * Deconstructs a globally unique ID to a schema type and resource ID
 * @param  {string} globalId globally unique ID
 * @return {object}          contains the schema type and resource ID
 */
export const fromGlobalId = (globalId) => {
  const delimiterPos = globalId.indexOf(':');

  if (delimiterPos < 0) {
    throw Error(`${globalId} is not a valid globalId`);
  }

  return {
    type: globalId.substring(0, delimiterPos),
    id: globalId.substring(delimiterPos + 1)
  };
};
