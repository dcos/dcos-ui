/**
 * jest always mocks modules which have a mocking file in a root/__mocks__,
 * if you NOT want to mock it in your testcae, use jest.unmock("immutable");
 */

function stub() {
  return {};
}

function List() {
  let size = 0;

  return Object.defineProperties(
    {
      add: jest.fn(() => List()),
      push: jest.fn(() => List()),
      sort: jest.fn(() => List()),
      first: jest.fn(() => {}),
      __setMockSize: _size => {
        size = _size;
      }
    },
    {
      size: {
        get: () => size,
        writeable: true
      }
    }
  );
}

var Immutable = {
  List,

  Iterable: stub,

  Seq: stub,
  Collection: stub,
  Map: stub,
  OrderedMap: stub,
  Stack: stub,
  Set: stub,
  OrderedSet: stub,

  Record: stub,
  Range: stub,
  Repeat: stub,

  is: stub,
  fromJS: stub
};

module.exports = Immutable;
