jest.dontMock('../Item');
jest.dontMock('../RepositoryList');
jest.dontMock('../../utils/Util');

var Item = require('../Item');
var RepositoryList = require('../RepositoryList');

describe('RepositoryList', function () {

  describe('#constructor', function () {

    it('creates instances of Item', function () {
      var items = [{foo: 'bar'}];
      var list = new RepositoryList({items});
      items = list.getItems();
      expect(items[0] instanceof Item).toBeTruthy();
    });

  });

});
