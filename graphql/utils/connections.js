/*
  This code is a reimplemenation of graphql-relay-js.

  https://github.com/graphql/graphql-relay-js/blob/master/src/connection/arrayconnection.js

  Original License:

  ==============================================================================
  BSD License

  For GraphQL software

  Copyright (c) 2015, Facebook, Inc. All rights reserved.

  Redistribution and use in source and binary forms, with or without modification,
  are permitted provided that the following conditions are met:

   * Redistributions of source code must retain the above copyright notice, this
     list of conditions and the following disclaimer.

   * Redistributions in binary form must reproduce the above copyright notice,
     this list of conditions and the following disclaimer in the documentation
     and/or other materials provided with the distribution.

   * Neither the name Facebook nor the names of its contributors may be used to
     endorse or promote products derived from this software without specific
     prior written permission.

  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
  ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
  WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
  DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
  ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
  ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
  SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
  ==============================================================================
 */

// Prefix for cursor string.
const PREFIX = 'cursor:';

/**
 * A simple function that accepts an array and connection arguments, and returns
 * a connection object for use in GraphQL. It uses array offsets as pagination,
 * so pagination will only work if the array is static. Relies on server data
 * maintaining order.
 *
 * @param {array | promise} data array of items or promise that resolves array of items
 * @param {object} args query arguments
 * @return {object | promise} connection data
 */
export function Paginate(data, args) {
  if (!Array.isArray(data) && typeof data.then === 'function') {
    return connectionFromPromisedArray(data, args);
  }

  return connectionFromArraySlice(
    data,
    args,
    {
      sliceStart: 0,
      arrayLength: data.length
    }
  );
}

/**
 * A version of `connectionFromArray` that takes a promised array, and returns a
 * promised connection.
 *
 * @param  {promise} dataPromise promise resolving an array
 * @param  {object} args        query arguments
 * @return {object}             connection object with edges
 */
export function connectionFromPromisedArray(dataPromise, args) {
  return dataPromise.then((data) => {
    return connectionFromArraySlice(
      data,
      args,
      {
        sliceStart: 0,
        arrayLength: data.length
      }
    );
  });
}

/**
 * Given a slice (subset) of an array, returns a connection object for use in
 * GraphQL.
 *
 * This function is similar to `connectionFromArray`, but is intended for use
 * cases where you know the cardinality of the connection, consider it too large
 * to materialize the entire array, and instead wish pass in a slice of the
 * total result large enough to cover the range specified in `args`.
 *
 * @param  {array} arraySlice array to paginate
 * @param  {object} args       query arguments
 * @param  {object} meta       slice data
 * @return {object}            contains edges and metadata about pagination state
 */
export function connectionFromArraySlice(arraySlice, args, meta) {
  const {after, before, first, last} = args;
  const {sliceStart, arrayLength} = meta;
  const sliceEnd = sliceStart + arraySlice.length;
  const beforeOffset = getOffsetWithDefault(before, arrayLength);
  const afterOffset = getOffsetWithDefault(after, -1);

  let startOffset = Math.max(
    sliceStart - 1,
    afterOffset,
    -1
  ) + 1;
  let endOffset = Math.min(
    sliceEnd,
    beforeOffset,
    arrayLength
  );
  if (typeof first === 'number') {
    if (first < 0) {
      throw new Error('Argument "first" must be a non-negative integer');
    }

    endOffset = Math.min(
      endOffset,
      startOffset + first
    );
  }
  if (typeof last === 'number') {
    if (last < 0) {
      throw new Error('Argument "last" must be a non-negative integer');
    }

    startOffset = Math.max(
      startOffset,
      endOffset - last
    );
  }

  // If supplied slice is too large, trim it down before mapping over it.
  const slice = arraySlice.slice(
    Math.max(startOffset - sliceStart, 0),
    arraySlice.length - (sliceEnd - endOffset)
  );

  const edges = slice.map((value, index) => ({
    cursor: offsetToCursor(startOffset + index),
    node: value
  }));

  const firstEdge = edges[0];
  const lastEdge = edges[edges.length - 1];
  const lowerBound = after ? (afterOffset + 1) : 0;
  const upperBound = before ? beforeOffset : arrayLength;

  return {
    edges,
    pageInfo: {
      startCursor: firstEdge ? firstEdge.cursor : null,
      endCursor: lastEdge ? lastEdge.cursor : null,
      hasPreviousPage: typeof last === 'number' ? startOffset > lowerBound : false,
      hasNextPage: typeof first === 'number' ? endOffset < upperBound : false
    }
  };
}

/**
 * Creates the cursor string from an offset.
 * @param  {int} offset position in array
 * @return {string}        cursor
 */
export function offsetToCursor(offset) {
  return PREFIX + offset;
}

/**
 * Rederives the offset from the cursor string.
 * @param  {string} cursor cursor for object
 * @return {int}        position of cursor in array
 */
export function cursorToOffset(cursor) {
  return parseInt(cursor.substring(PREFIX.length), 10);
}

/**
 * Return the cursor associated with an object in an array.
 * @param  {array} data   array of items
 * @param  {object} object item to locate in array
 * @return {string}        cursor as defined by where item is located in array
 */
export function cursorForObjectInConnection(data, object) {
  const offset = data.indexOf(object);
  if (offset === -1) {
    return null;
  }

  return offsetToCursor(offset);
}

/**
 * Given an optional cursor and a default offset, returns the offset
 * to use; if the cursor contains a valid offset, that will be used,
 * otherwise it will be the default.
 * @param  {string} cursor        cursor to decompose
 * @param  {int} defaultOffset default cursor position if cursor is invalid
 * @return {int}               cursor position
 */
export function getOffsetWithDefault(cursor, defaultOffset) {
  if (typeof cursor !== 'string') {
    return defaultOffset;
  }
  const offset = cursorToOffset(cursor);

  return isNaN(offset) ? defaultOffset : offset;
}
