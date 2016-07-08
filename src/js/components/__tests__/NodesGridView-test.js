jest.dontMock('../CollapsingString');
jest.dontMock('../../mixins/GetSetMixin');
jest.dontMock('../../mixins/InternalStorageMixin');
jest.dontMock('../NodesGridView');
jest.dontMock('../../stores/MesosStateStore');
jest.dontMock('../../utils/Util');
/* eslint-disable no-unused-vars */
var React = require('react');
/* eslint-enable no-unused-vars */
var ReactDOM = require('react-dom');

var NodesGridView = require('../NodesGridView');
var MesosStateStore = require('../../stores/MesosStateStore');
var NodesList = require('../../structs/NodesList');

MesosStateStore.addChangeListener = function () {};

describe('NodesGridView', function () {

  describe('#getActiveServiceIds', function () {

    beforeEach(function () {
      MesosStateStore.processStateSuccess({frameworks: []});
      this.hosts = new NodesList({items: [
        {
          name: 'foo',
          framework_ids: [
            'a',
            'b',
            'c'
          ]
        },
        {
          name: 'bar',
          framework_ids: [
            'a',
            'b',
            'c',
            'd',
            'e',
            'f'
          ]
        },
        {
          name: 'zoo',
          framework_ids: [
            'a',
            'd',
            'g',
            'z'
          ]
        }
      ]});
      this.container = document.createElement('div');
      this.instance = ReactDOM.render(
        <NodesGridView
          selectedResource={'mem'}
          hosts={this.hosts.getItems()}
          services={[]}
          />,
        this.container
      );
    });
    afterEach(function () {
      ReactDOM.unmountComponentAtNode(this.container);
    });

    it('should return a list of unique framwork_ids', function () {
      var list = this.instance.getActiveServiceIds(this.hosts.getItems());

      expect(list).toEqual(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'z']);
    });

  });

});
