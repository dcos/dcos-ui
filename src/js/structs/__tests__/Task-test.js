let ServiceImages = require('../../constants/ServiceImages');
let Task = require('../Task');

describe('Task', function () {

  describe('#getId', function () {

    it('returns correct id', function () {
      let task = new Task({
        id: 'test.a1f67e90-1c86-11e6-ae46-0ed0cffa3d76'
      });

      expect(task.getId()).toEqual('test.a1f67e90-1c86-11e6-ae46-0ed0cffa3d76');
    });

  });

  describe('#getImages', function () {

    it('defaults to NA images', function () {
      let task = new Task({});

      expect(task.getImages()).toEqual(ServiceImages.NA_IMAGES);
    });

  });

});
