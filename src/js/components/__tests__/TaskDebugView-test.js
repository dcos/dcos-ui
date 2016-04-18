jest.dontMock('../icons/IconDownload');
jest.dontMock('../MesosLogView');
jest.dontMock('../RequestErrorMsg');
jest.dontMock('../TaskDebugView');

var JestUtil = require('../../utils/JestUtil');

JestUtil.unMockStores(['TaskDirectoryStore', 'MesosLogStore']);
require('../../utils/StoreMixinConfig');

var DirectoryItem = require('../../structs/DirectoryItem');
var TaskDirectory = require('../../structs/TaskDirectory');
var React = require('react');
var ReactDOM = require('react-dom');
var TestUtils = require('react-addons-test-utils');

var TaskDirectoryActions = require('../../events/TaskDirectoryActions');
var TaskDebugView = require('../TaskDebugView');

describe('TaskDebugView', function () {

  beforeEach(function () {
    this.container = document.createElement('div');
    this.instance = ReactDOM.render(
      <TaskDebugView
        directory={new TaskDirectory({items: [{nlink: 1, path: '/stdout'}]})}
        selectedLogFile={new DirectoryItem({nlink: 1, path: '/stdout'})}
        task={{slave_id: 'foo'}} />,
      this.container
    );
  });

  afterEach(function () {
    ReactDOM.unmountComponentAtNode(this.container);
  });

  describe('#render', function () {

    it('should set button disabled when file is not found', function () {
      this.instance = ReactDOM.render(
        <TaskDebugView
          directory={new TaskDirectory({items: [{nlink: 1, path: ''}]})}
          task={{slave_id: 'foo'}} />,
        this.container
      );
      var btn = this.container.querySelector('a.button.button-stroke');
      // If btn.props.disabled = true, then disabled attribute will return an object.
      // If btn.props.disabled = false, then disabled attribute will be undefined.
      // So here we just test to see if attribute exists
      expect(btn.attributes.disabled).toBeTruthy();
    });

    it('should set button not disabled when file is found', function () {
      var btn = this.container.querySelector('a.button.button-stroke');
      // If btn.props.disabled = false, then disabled attribute will be undefined
      expect(btn.attributes.disabled).toEqual(undefined);
    });

    it('renders stdout on first render', function () {
      this.instance.state = {currentView: 0};
      TaskDirectoryActions.getDownloadURL =
        jasmine.createSpy('TaskDirectoryActions#getDownloadURL');

      this.instance.render();

      expect(TaskDirectoryActions.getDownloadURL)
        .toHaveBeenCalledWith('foo', '/stdout');
    });

    it('renders stderr when view is changed', function () {
      this.instance = ReactDOM.render(
        <TaskDebugView
          directory={new TaskDirectory({items: [
            {nlink: 1, path: '/stdout'},
            {nlink: 1, path: '/stderr'}
          ]})}
          selectedLogFile={new DirectoryItem({nlink: 1, path: '/stderr'})}
          task={{slave_id: 'foo'}} />,
        this.container
      );

      // Setup spy after state has been configured
      TaskDirectoryActions.getDownloadURL =
        jasmine.createSpy('TaskDirectoryActions#getDownloadURL');

      this.instance.render();

      expect(TaskDirectoryActions.getDownloadURL)
        .toHaveBeenCalledWith('foo', '/stderr');
    });

  });

});
