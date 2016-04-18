jest.dontMock('../../mixins/GetSetMixin');
jest.dontMock('../HistoryStore');

var HistoryStore = require('../HistoryStore');

describe('HistoryStore', function () {
  beforeEach(function () {
    HistoryStore.init();
    var routes = [{name: 'home'}, {name: 'dashboard'}];
    this.routes = routes;
    this.router = {
      getCurrentRoutes: function () {
        return routes;
      },
      getCurrentParams: function () {
        return {};
      },
      transitionTo: function () {}
    };
  });

  describe('#goBackToPage', function () {
    it('should transition to dashboard', function () {
      this.routes.push({name: 'service-panel'});
      this.router.transitionTo = jasmine.createSpy();

      HistoryStore.goBackToPage(this.router);
      expect(this.router.transitionTo).toHaveBeenCalledWith('dashboard', {});
    });
  });

  describe('#goBack', function () {
    beforeEach(function () {
      HistoryStore.set({history: ['home', 'nodes', 'nodes-list', 'service-panel']});
    });

    it('should go back to previous page', function () {
      this.router.transitionTo = jasmine.createSpy();
      HistoryStore.goBack(this.router);

      expect(this.router.transitionTo).toHaveBeenCalledWith('nodes-list');
    });

    it('should pop off two items from the history', function () {
      this.router.transitionTo = jasmine.createSpy();
      HistoryStore.goBack(this.router);

      expect(HistoryStore.get('history').length).toEqual(2);
    });
  });
});
