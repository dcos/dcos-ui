jest.unmock('../connections');

import {
  Paginate,
  connectionFromArraySlice,
  connectionFromPromisedArray,
  cursorForObjectInConnection,
} from '../connections';

describe('Paginate()', () => {
  var letters = ['A', 'B', 'C', 'D', 'E'];
  var promisedLetters = Promise.resolve(letters);

  describe('accepts a promise', () => {
    it('accepts data in the form of a promise', async () => {
      var c = await Paginate(promisedLetters, {});
      return expect(c).toEqual({
        edges: [
          {
            node: 'A',
            cursor: 'cursor:0'
          },
          {
            node: 'B',
            cursor: 'cursor:1'
          },
          {
            node: 'C',
            cursor: 'cursor:2'
          },
          {
            node: 'D',
            cursor: 'cursor:3'
          },
          {
            node: 'E',
            cursor: 'cursor:4'
          }
        ],
        pageInfo: {
          startCursor: 'cursor:0',
          endCursor: 'cursor:4',
          hasPreviousPage: false,
          hasNextPage: false
        }
      });
    });
  });

  describe('basic slicing', () => {
    it('returns all elements without filters', () => {
      var c = Paginate(letters, {});
      return expect(c).toEqual({
        edges: [
          {
            node: 'A',
            cursor: 'cursor:0'
          },
          {
            node: 'B',
            cursor: 'cursor:1'
          },
          {
            node: 'C',
            cursor: 'cursor:2'
          },
          {
            node: 'D',
            cursor: 'cursor:3'
          },
          {
            node: 'E',
            cursor: 'cursor:4'
          }
        ],
        pageInfo: {
          startCursor: 'cursor:0',
          endCursor: 'cursor:4',
          hasPreviousPage: false,
          hasNextPage: false
        }
      });
    });

    it('respects a smaller first', () => {
      var c = Paginate(letters, {first: 2});
      return expect(c).toEqual({
        edges: [
          {
            node: 'A',
            cursor: 'cursor:0'
          },
          {
            node: 'B',
            cursor: 'cursor:1'
          }
        ],
        pageInfo: {
          startCursor: 'cursor:0',
          endCursor: 'cursor:1',
          hasPreviousPage: false,
          hasNextPage: true,
        }
      });
    });

    it('respects an overly large first', () => {
      var c = Paginate(letters, {first: 10});
      return expect(c).toEqual({
        edges: [
          {
            node: 'A',
            cursor: 'cursor:0'
          },
          {
            node: 'B',
            cursor: 'cursor:1'
          },
          {
            node: 'C',
            cursor: 'cursor:2'
          },
          {
            node: 'D',
            cursor: 'cursor:3'
          },
          {
            node: 'E',
            cursor: 'cursor:4'
          }
        ],
        pageInfo: {
          startCursor: 'cursor:0',
          endCursor: 'cursor:4',
          hasPreviousPage: false,
          hasNextPage: false
        }
      });
    });

    it('respects a smaller last', () => {
      var c = Paginate(letters, {last: 2});
      return expect(c).toEqual({
        edges: [
          {
            node: 'D',
            cursor: 'cursor:3'
          },
          {
            node: 'E',
            cursor: 'cursor:4'
          },
        ],
        pageInfo: {
          startCursor: 'cursor:3',
          endCursor: 'cursor:4',
          hasPreviousPage: true,
          hasNextPage: false
        }
      });
    });

    it('respects an overly large last', () => {
      var c = Paginate(letters, {last: 10});
      return expect(c).toEqual({
        edges: [
          {
            node: 'A',
            cursor: 'cursor:0'
          },
          {
            node: 'B',
            cursor: 'cursor:1'
          },
          {
            node: 'C',
            cursor: 'cursor:2'
          },
          {
            node: 'D',
            cursor: 'cursor:3'
          },
          {
            node: 'E',
            cursor: 'cursor:4'
          }
        ],
        pageInfo: {
          startCursor: 'cursor:0',
          endCursor: 'cursor:4',
          hasPreviousPage: false,
          hasNextPage: false
        }
      });
    });
  });

  describe('pagination', () => {
    it('respects first and after', () => {
      var c = Paginate(
        letters,
        {first: 2, after: 'cursor:1'}
      );
      return expect(c).toEqual({
        edges: [
          {
            node: 'C',
            cursor: 'cursor:2'
          },
          {
            node: 'D',
            cursor: 'cursor:3'
          }
        ],
        pageInfo: {
          startCursor: 'cursor:2',
          endCursor: 'cursor:3',
          hasPreviousPage: false,
          hasNextPage: true
        }
      });
    });

    it('respects first and after with long first', () => {
      var c = Paginate(
        letters,
        {first: 10, after: 'cursor:1'}
      );
      return expect(c).toEqual({
        edges: [
          {
            node: 'C',
            cursor: 'cursor:2'
          },
          {
            node: 'D',
            cursor: 'cursor:3'
          },
          {
            node: 'E',
            cursor: 'cursor:4'
          }
        ],
        pageInfo: {
          startCursor: 'cursor:2',
          endCursor: 'cursor:4',
          hasPreviousPage: false,
          hasNextPage: false
        }
      });
    });

    it('respects last and before', () => {
      var c = Paginate(
        letters,
        {last: 2, before: 'cursor:3'}
      );
      return expect(c).toEqual({
        edges: [
          {
            node: 'B',
            cursor: 'cursor:1'
          },
          {
            node: 'C',
            cursor: 'cursor:2'
          }
        ],
        pageInfo: {
          startCursor: 'cursor:1',
          endCursor: 'cursor:2',
          hasPreviousPage: true,
          hasNextPage: false
        }
      });
    });

    it('respects last and before with long last', () => {
      var c = Paginate(
        letters,
        {last: 10, before: 'cursor:3'}
      );
      return expect(c).toEqual({
        edges: [
          {
            node: 'A',
            cursor: 'cursor:0'
          },
          {
            node: 'B',
            cursor: 'cursor:1'
          },
          {
            node: 'C',
            cursor: 'cursor:2'
          }
        ],
        pageInfo: {
          startCursor: 'cursor:0',
          endCursor: 'cursor:2',
          hasPreviousPage: false,
          hasNextPage: false
        }
      });
    });

    it('respects first and after and before, too few', () => {
      var c = Paginate(
        letters,
        {
          first: 2,
          after: 'cursor:0',
          before: 'cursor:4'
        }
      );
      return expect(c).toEqual({
        edges: [
          {
            node: 'B',
            cursor: 'cursor:1'
          },
          {
            node: 'C',
            cursor: 'cursor:2'
          }
        ],
        pageInfo: {
          startCursor: 'cursor:1',
          endCursor: 'cursor:2',
          hasPreviousPage: false,
          hasNextPage: true
        }
      });
    });

    it('respects first and after and before, too many', () => {
      var c = Paginate(
        letters,
        {
          first: 4,
          after: 'cursor:0',
          before: 'cursor:4'
        }
      );
      return expect(c).toEqual({
        edges: [
          {
            node: 'B',
            cursor: 'cursor:1'
          },
          {
            node: 'C',
            cursor: 'cursor:2'
          },
          {
            node: 'D',
            cursor: 'cursor:3'
          }
        ],
        pageInfo: {
          startCursor: 'cursor:1',
          endCursor: 'cursor:3',
          hasPreviousPage: false,
          hasNextPage: false
        }
      });
    });

    it('respects first and after and before, exactly right', () => {
      var c = Paginate(
        letters,
        {
          first: 3,
          after: 'cursor:0',
          before: 'cursor:4'
        }
      );
      return expect(c).toEqual({
        edges: [
          {
            node: 'B',
            cursor: 'cursor:1'
          },
          {
            node: 'C',
            cursor: 'cursor:2'
          },
          {
            node: 'D',
            cursor: 'cursor:3'
          }
        ],
        pageInfo: {
          startCursor: 'cursor:1',
          endCursor: 'cursor:3',
          hasPreviousPage: false,
          hasNextPage: false
        }
      });
    });

    it('respects last and after and before, too few', () => {
      var c = Paginate(
        letters,
        {
          last: 2,
          after: 'cursor:0',
          before: 'cursor:4'
        }
      );
      return expect(c).toEqual({
        edges: [
          {
            node: 'C',
            cursor: 'cursor:2'
          },
          {
            node: 'D',
            cursor: 'cursor:3'
          }
        ],
        pageInfo: {
          startCursor: 'cursor:2',
          endCursor: 'cursor:3',
          hasPreviousPage: true,
          hasNextPage: false
        }
      });
    });

    it('respects last and after and before, too many', () => {
      var c = Paginate(
        letters,
        {
          last: 4,
          after: 'cursor:0',
          before: 'cursor:4'
        }
      );
      return expect(c).toEqual({
        edges: [
          {
            node: 'B',
            cursor: 'cursor:1'
          },
          {
            node: 'C',
            cursor: 'cursor:2'
          },
          {
            node: 'D',
            cursor: 'cursor:3'
          }
        ],
        pageInfo: {
          startCursor: 'cursor:1',
          endCursor: 'cursor:3',
          hasPreviousPage: false,
          hasNextPage: false
        }
      });
    });

    it('respects last and after and before, exactly right', () => {
      var c = Paginate(
        letters,
        {
          last: 3,
          after: 'cursor:0',
          before: 'cursor:4'
        }
      );
      return expect(c).toEqual({
        edges: [
          {
            node: 'B',
            cursor: 'cursor:1'
          },
          {
            node: 'C',
            cursor: 'cursor:2'
          },
          {
            node: 'D',
            cursor: 'cursor:3'
          }
        ],
        pageInfo: {
          startCursor: 'cursor:1',
          endCursor: 'cursor:3',
          hasPreviousPage: false,
          hasNextPage: false
        }
      });
    });
  });

  describe('cursor edge cases', () => {
    it('throws an error if first < 0', () => {
      expect(() => {
        Paginate(
          letters,
          {first: -1}
        );
      }).toThrow('Argument "first" must be a non-negative integer');
    });

    it('throws an error if last < 0', () => {
      expect(() => {
        Paginate(
          letters,
          {last: -1}
        );
      }).toThrow('Argument "last" must be a non-negative integer');
    });

    it('returns all elements if cursors are invalid', () => {
      var c = Paginate(
        letters,
        {before: 'invalid', after: 'invalid'}
      );
      return expect(c).toEqual({
        edges: [
          {
            node: 'A',
            cursor: 'cursor:0'
          },
          {
            node: 'B',
            cursor: 'cursor:1'
          },
          {
            node: 'C',
            cursor: 'cursor:2'
          },
          {
            node: 'D',
            cursor: 'cursor:3'
          },
          {
            node: 'E',
            cursor: 'cursor:4'
          }
        ],
        pageInfo: {
          startCursor: 'cursor:0',
          endCursor: 'cursor:4',
          hasPreviousPage: false,
          hasNextPage: false
        }
      });
    });

    it('returns all elements if cursors are on the outside', () => {
      var c = Paginate(
        letters,
        {
          before: 'cursor:6',
          after: 'cursor:-1'
        }
      );
      return expect(c).toEqual({
        edges: [
          {
            node: 'A',
            cursor: 'cursor:0'
          },
          {
            node: 'B',
            cursor: 'cursor:1'
          },
          {
            node: 'C',
            cursor: 'cursor:2'
          },
          {
            node: 'D',
            cursor: 'cursor:3'
          },
          {
            node: 'E',
            cursor: 'cursor:4'
          }
        ],
        pageInfo: {
          startCursor: 'cursor:0',
          endCursor: 'cursor:4',
          hasPreviousPage: false,
          hasNextPage: false
        }
      });
    });

    it('returns no elements if cursors cross', () => {
      var c = Paginate(
        letters,
        {before: 'cursor:2', after: 'cursor:4'}
      );
      return expect(c).toEqual({
        edges: [
        ],
        pageInfo: {
          startCursor: null,
          endCursor: null,
          hasPreviousPage: false,
          hasNextPage: false
        }
      });
    });
  });

  describe('cursorForObjectInConnection()', () => {
    it('returns an edge\'s cursor, given an array and a member object', () => {
      var letterBCursor = cursorForObjectInConnection(letters, 'B');
      return expect(letterBCursor).toEqual('cursor:1');
    });

    it('returns null, given an array and a non-member object', () => {
      var letterFCursor = cursorForObjectInConnection(letters, 'F');
      return expect(letterFCursor).toBeNull();
    });
  });
});

describe('connectionFromPromisedArray()', () => {
  var letters = Promise.resolve(['A', 'B', 'C', 'D', 'E']);

  it('returns all elements without filters', async () => {
    var c = await connectionFromPromisedArray(letters, {});
    return expect(c).toEqual({
      edges: [
        {
          node: 'A',
          cursor: 'cursor:0'
        },
        {
          node: 'B',
          cursor: 'cursor:1'
        },
        {
          node: 'C',
          cursor: 'cursor:2'
        },
        {
          node: 'D',
          cursor: 'cursor:3'
        },
        {
          node: 'E',
          cursor: 'cursor:4'
        }
      ],
      pageInfo: {
        startCursor: 'cursor:0',
        endCursor: 'cursor:4',
        hasPreviousPage: false,
        hasNextPage: false
      }
    });
  });

  it('respects a smaller first', async () => {
    var c = await connectionFromPromisedArray(letters, {first: 2});
    return expect(c).toEqual({
      edges: [
        { node: 'A',
          cursor: 'cursor:0'
        },
        {
          node: 'B',
          cursor: 'cursor:1'
        }
      ],
      pageInfo: {
        startCursor: 'cursor:0',
        endCursor: 'cursor:1',
        hasPreviousPage: false,
        hasNextPage: true
      }
    });
  });
});

describe('connectionFromArraySlice()', () => {
  var letters = ['A', 'B', 'C', 'D', 'E'];

  it('works with a just-right array slice', () => {
    var c = connectionFromArraySlice(
      letters.slice(1, 3),
      {
        first: 2,
        after: 'cursor:0'
      },
      {
        sliceStart: 1,
        arrayLength: 5
      }
    );
    return expect(c).toEqual({
      edges: [
        {
          node: 'B',
          cursor: 'cursor:1'
        },
        {
          node: 'C',
          cursor: 'cursor:2'
        }
      ],
      pageInfo: {
        startCursor: 'cursor:1',
        endCursor: 'cursor:2',
        hasPreviousPage: false,
        hasNextPage: true
      }
    });
  });

  it('works with an oversized array slice ("left" side)', () => {
    var c = connectionFromArraySlice(
      letters.slice(0, 3),
      {
        first: 2,
        after: 'cursor:0'
      },
      {
        sliceStart: 0,
        arrayLength: 5
      }
    );
    return expect(c).toEqual({
      edges: [
        {
          node: 'B',
          cursor: 'cursor:1'
        },
        {
          node: 'C',
          cursor: 'cursor:2'
        }
      ],
      pageInfo: {
        startCursor: 'cursor:1',
        endCursor: 'cursor:2',
        hasPreviousPage: false,
        hasNextPage: true
      }
    });
  });

  it('works with an oversized array slice ("right" side)', () => {
    var c = connectionFromArraySlice(
      letters.slice(2, 4),
      {
        first: 1,
        after: 'cursor:1'
      },
      {
        sliceStart: 2,
        arrayLength: 5
      }
    );
    return expect(c).toEqual({
      edges: [
        {
          node: 'C',
          cursor: 'cursor:2'
        }
      ],
      pageInfo: {
        startCursor: 'cursor:2',
        endCursor: 'cursor:2',
        hasPreviousPage: false,
        hasNextPage: true
      }
    });
  });

  it('works with an oversized array slice (both sides)', () => {
    var c = connectionFromArraySlice(
      letters.slice(1, 4),
      {
        first: 1,
        after: 'cursor:1'
      },
      {
        sliceStart: 1,
        arrayLength: 5
      }
    );
    return expect(c).toEqual({
      edges: [
        {
          node: 'C',
          cursor: 'cursor:2'
        }
      ],
      pageInfo: {
        startCursor: 'cursor:2',
        endCursor: 'cursor:2',
        hasPreviousPage: false,
        hasNextPage: true
      }
    });
  });

  it('works with an undersized array slice ("left" side)', () => {
    var c = connectionFromArraySlice(
      letters.slice(3, 5),
      {
        first: 3,
        after: 'cursor:1'
      },
      {
        sliceStart: 3,
        arrayLength: 5
      }
    );
    return expect(c).toEqual({
      edges: [
        {
          node: 'D',
          cursor: 'cursor:3'
        },
        {
          node: 'E',
          cursor: 'cursor:4'
        }
      ],
      pageInfo: {
        startCursor: 'cursor:3',
        endCursor: 'cursor:4',
        hasPreviousPage: false,
        hasNextPage: false
      }
    });
  });

  it('works with an undersized array slice ("right" side)', () => {
    var c = connectionFromArraySlice(
      letters.slice(2, 4),
      {
        first: 3,
        after: 'cursor:1'
      },
      {
        sliceStart: 2,
        arrayLength: 5
      }
    );
    return expect(c).toEqual({
      edges: [
        {
          node: 'C',
          cursor: 'cursor:2'
        },
        {
          node: 'D',
          cursor: 'cursor:3'
        }
      ],
      pageInfo: {
        startCursor: 'cursor:2',
        endCursor: 'cursor:3',
        hasPreviousPage: false,
        hasNextPage: true
      }
    });
  });

  it('works with an undersized array slice (both sides)', () => {
    var c = connectionFromArraySlice(
      letters.slice(3, 4),
      {
        first: 3,
        after: 'cursor:1'
      },
      {
        sliceStart: 3,
        arrayLength: 5
      }
    );
    return expect(c).toEqual({
      edges: [
        {
          node: 'D',
          cursor: 'cursor:3',
        }
      ],
      pageInfo: {
        startCursor: 'cursor:3',
        endCursor: 'cursor:3',
        hasPreviousPage: false,
        hasNextPage: true
      }
    });
  });
});
