jest.dontMock('../../constants/UnitHealthStatus');

const HealthUnit = require('../../structs/HealthUnit');
const UnitHealthStatus = require('../../constants/UnitHealthStatus');
const UnitHealthUtil = require('../../utils/UnitHealthUtil');
const NodesList = require('../../structs/NodesList');

describe('UnitHealthUnit', function () {

  describe('#getHealthSorting', function () {
    beforeEach(function () {
      const unit = new HealthUnit({health: 0, id: 'aaa'});
      this.healthWeight = UnitHealthUtil.getHealthSorting(unit);
    });

    it('should return a number', function () {
      expect(typeof this.healthWeight).toEqual('number');
    });
  });

  describe('#getHealth', function () {

    it('returns a UnitHealthStatus object', function () {
      var health = 1;

      expect(UnitHealthUtil.getHealth(health)).toEqual({
        key: 'UNHEALTHY',
        title: 'Unhealthy',
        sortingValue: 0,
        value: 1,
        classNames: 'text-danger'
      });
    });

    it('returns NA when health not valid', function () {
      var health = 'wtf';
      expect(UnitHealthUtil.getHealth(health)).toEqual(UnitHealthStatus.NA);
    });
  });

  describe('#filterByHealth', function () {

    it('filters by unit health title', function () {
      const items = [
        {id: 'food', health: 0},
        {id: 'bard', health: 0},
        {id: 'bluh', health: 2}
      ];
      const list = new NodesList({items});
      const filteredList = list.filter({health: 'healthy'}).getItems();
      expect(filteredList.length).toEqual(2);
      expect(filteredList[0].get('id')).toEqual('food');
      expect(filteredList[1].get('id')).toEqual('bard');
    });
  });

  describe('#getSortingValueByhealthValue', function () {
    it('should get sorting value by health value', function () {
      /**
       * health status visibility importance order top to bottom
       * unhealthy > NA > warn/idle > healthy
       */
      const originalUnhealthyValue = 1;
      const sortingValue = 0;

      expect(UnitHealthUtil.getSortingValueByhealthValue(originalUnhealthyValue)).toEqual(sortingValue);
    });
  });

  describe('#sortHealthValues', function () {
    it('should sort health status by order of importance', function () {
      const units = [
        { id: 'aa', health: 0 },
        { id: 'bb', health: 1 },
        { id: 'cc', health: 3 }
      ];
      const expectedResult = [
        { id: 'bb', health: 1 },
        { id: 'cc', health: 3 },
        { id: 'aa', health: 0 }
      ];
      const sortingResult = units.sort(UnitHealthUtil.sortHealthValues);

      expect(sortingResult).toEqual(expectedResult);
    });
  });

  describe('#getHealthSortingOrder', function () {
    beforeEach(function () {
      this.healthSorting = UnitHealthUtil.getHealthSortingOrder();
    });

    it('should return a function', function () {
      expect(typeof this.healthSorting).toEqual('function');
    });
  });

});
