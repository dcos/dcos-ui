jest.dontMock('../../utils/MesosSummaryUtil');
jest.dontMock('../../utils/StringUtil');
jest.dontMock('../../utils/Util');

const Node = require('../Node');
const NodesList = require('../NodesList');

describe('NodesList', function () {

  describe('#constructor', function () {

    it('creates instances of Node', function () {
      let items = [{foo: 'bar'}];
      let list = new NodesList({items});
      items = list.getItems();
      expect(items[0] instanceof Node).toBeTruthy();
    });

  });

  describe('#filter', function () {

    it('returns unfiltered list', function () {
      let items = [{a: 1}, {b: 2}];
      let list = new NodesList({items});
      expect(list.filter().getItems().length).toEqual(2);
    });

    it('filters by ids', function () {
      let items = [
        {id: 1, hostname: 'foo'},
        {id: 2, hostname: 'bar'},
        {id: '3', hostname: 'baz'}
      ];
      let list = new NodesList({items});
      let filteredList = list.filter({ids: [2, '3']}).getItems();
      expect(filteredList.length).toEqual(2);
      expect(filteredList[0].get('hostname')).toEqual('bar');
      expect(filteredList[1].get('hostname')).toEqual('baz');
    });

    it('filters by hostname', function () {
      let items = [
        {hostname: 'foo'},
        {hostname: 'bar'},
        {hostname: 'baz'}
      ];
      let list = new NodesList({items});
      let filteredList = list.filter({name: 'ba'}).getItems();
      expect(filteredList.length).toEqual(2);
      expect(filteredList[0].get('hostname')).toEqual('bar');
      expect(filteredList[1].get('hostname')).toEqual('baz');
    });

    it('filters by service', function () {
      let items = [
        {host_ip: 'foo', framework_ids: [1, 2]},
        {host_ip: 'bar', framework_ids: [3]},
        {host_ip: 'baz', framework_ids: [2]}
      ];
      let list = new NodesList({items});
      let filteredList = list.filter({service: 2}).getItems();
      expect(filteredList.length).toEqual(2);
      expect(filteredList[0].get('host_ip')).toEqual('foo');
      expect(filteredList[1].get('host_ip')).toEqual('baz');
    });

    it('filters by service', function () {
      let items = [
        {hostname: 'foo', framework_ids: [1, 2]},
        {hostname: 'bar', framework_ids: [3]},
        {hostname: 'baz', framework_ids: [2]}
      ];
      let list = new NodesList({items});
      let filteredList = list.filter({service: 2}).getItems();
      expect(filteredList.length).toEqual(2);
      expect(filteredList[0].get('hostname')).toEqual('foo');
      expect(filteredList[1].get('hostname')).toEqual('baz');
    });

    it('filters by unit health title', function () {
      let items = [
        {id: 'foo', health: 0},
        {id: 'bar', health: 0},
        {id: 'bluh', health: 2}
      ];
      let list = new NodesList({items});
      let filteredList = list.filter({health: 'healthy'}).getItems();
      expect(filteredList.length).toEqual(2);
      expect(filteredList[0].get('id')).toEqual('foo');
      expect(filteredList[1].get('id')).toEqual('bar');
    });

  });

  describe('#sumUsedResources', function () {

    it('returns all resources as 0 when there\'s no services', function () {
      let list = new NodesList();
      expect(list.sumUsedResources()).toEqual({cpus: 0, mem: 0, disk: 0});
    });

    it('returns used resources when there\'s one service', function () {
      let list = new NodesList({items: [
        {used_resources: {cpus: 1, mem: 3, disk: 1}}
      ]});
      expect(list.sumUsedResources()).toEqual({cpus: 1, mem: 3, disk: 1});
    });

    it('sums used resources for services', function () {
      let list = new NodesList({items: [
        {used_resources: {cpus: 1, mem: 3, disk: 1}},
        {used_resources: {cpus: 1, mem: 3, disk: 1}}
      ]});
      expect(list.sumUsedResources()).toEqual({cpus: 2, mem: 6, disk: 2});
    });

  });

});
