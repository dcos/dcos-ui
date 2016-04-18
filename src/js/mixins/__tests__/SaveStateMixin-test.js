jest.dontMock('../SaveStateMixin');
jest.dontMock('../../stores/UserSettingsStore');

var SaveStateMixin = require('../SaveStateMixin');
var UserSettingsStore = require('../../stores/UserSettingsStore');

describe('SaveStateMixin', function () {

  beforeEach(function () {
    this.instance = Object.assign(
      {
        saveState_key: 'fakeInstance',
        setState: jasmine.createSpy()
      },
      SaveStateMixin
    );
    this.instance.constructor.displayName = 'FakeInstance';
  });

  describe('#componentWillMount', function () {
    beforeEach(function () {
      this.prevGetKey = UserSettingsStore.getKey;
      UserSettingsStore.getKey = function () {
        return {
          fakeInstance: {
            open: false
          }
        };
      };
    });

    afterEach(function () {
      UserSettingsStore.getKey = this.prevGetKey;
    });

    it('should set the previous state', function () {
      this.instance.componentWillMount();
      expect(this.instance.setState).toHaveBeenCalledWith({open: false});
    });
  });

  describe('#componentWillUnmount', function () {
    beforeEach(function () {
      this.prevGetKey = UserSettingsStore.getKey;
      this.prevSetKey = UserSettingsStore.setKey;

      UserSettingsStore.getKey = function () {
        return {
          fakeInstance: {
            open: false
          }
        };
      };
      UserSettingsStore.setKey = jasmine.createSpy();
    });

    afterEach(function () {
      UserSettingsStore.getKey = this.prevGetKey;
      UserSettingsStore.setKey = this.prevSetKey;
    });

    it('should set the previous state', function () {
      this.instance.state = {open: false, errorCount: 9001};
      this.instance.componentWillUnmount();
      expect(UserSettingsStore.setKey).toHaveBeenCalledWith(
        'savedStates', {fakeInstance: {open: false, errorCount: 9001}}
      );
    });
  });
});
