jest.dontMock('../../../components/Icon');
jest.dontMock('../../../components/MesosLogView');
jest.dontMock('../../../components/RequestErrorMsg');
jest.dontMock('../TaskLogsTab');
jest.dontMock('../../../components/FilterBar');

let JestUtil = require('../../../utils/JestUtil');

JestUtil.unMockStores(['TaskDirectoryStore', 'MesosLogStore']);
require('../../../utils/StoreMixinConfig');

let DirectoryItem = require('../../../structs/DirectoryItem');
let TaskDirectory = require('../../../structs/TaskDirectory');
/* eslint-disable no-unused-vars */
let React = require('react');
/* eslint-enable no-unused-vars */
let ReactDOM = require('react-dom');

let TaskDirectoryActions = require('../../../events/TaskDirectoryActions');
let TaskLogsTab = require('../TaskLogsTab');

describe('TaskLogsTab', function () {

  beforeEach(function () {
    this.container = document.createElement('div');
    this.instance = ReactDOM.render(
      <TaskLogsTab
        directory={new TaskDirectory({items: [{nlink: 1, path: '/stdout'}]})}
        params={{filePath: 'undefined'}}
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
        <TaskLogsTab
          directory={new TaskDirectory({items: [{nlink: 1, path: ''}]})}
          params={{filePath: 'undefined'}}
          task={{slave_id: 'foo'}} />,
        this.container
      );
      let btn = this.container.querySelector('a.button.button-stroke');
      // If btn.props.disabled = true, then disabled attribute will return an object.
      // If btn.props.disabled = false, then disabled attribute will be undefined.
      // So here we just test to see if attribute exists
      expect(btn.attributes.disabled).toBeTruthy();
    });

    it('should set button not disabled when file is found', function () {
      let btn = this.container.querySelector('a.button.button-stroke');
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
        <TaskLogsTab
          directory={new TaskDirectory({items: [
            {nlink: 1, path: '/stdout'},
            {nlink: 1, path: '/stderr'}
          ]})}
          params={{filePath: '/stderr'}}
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
