jest.dontMock('../ErrorMessageUtil');

const ErrorMessageUtil = require('../ErrorMessageUtil');

describe('ErrorMessageUtil', function () {

  describe('#translateErrorMessages', function () {

    it('should pass-through if there is no translation', function () {
      const errorInput = [
        {
          message: 'message1',
          type: 'TYPE1',
          path: [],
          variables: {}
        }
      ];
      const translationRules = [
      ];

      expect(ErrorMessageUtil.translateErrorMessages(errorInput, translationRules))
        .toEqual([
          {
            message: 'message1',
            type: 'TYPE1',
            path: [],
            variables: {}
          }
        ]);
    });

    it('should pass-through if no path matches', function () {
      const errorInput = [
        {
          message: 'message1',
          type: 'TYPE1',
          path: [],
          variables: {}
        }
      ];
      const translationRules = [
        {
          type: 'TYPE1',
          path: /^E/,
          message: 'message2'
        }
      ];

      expect(ErrorMessageUtil.translateErrorMessages(errorInput, translationRules))
        .toEqual([
          {
            message: 'message1',
            type: 'TYPE1',
            path: [],
            variables: {}
          }
        ]);

    });

    it('should pass-through if no type matches', function () {
      const errorInput = [
        {
          message: 'message1',
          type: 'TYPE1',
          path: [],
          variables: {}
        }
      ];
      const translationRules = [
        {
          type: 'TYPE2',
          path: /.*/,
          message: 'message2'
        }
      ];

      expect(ErrorMessageUtil.translateErrorMessages(errorInput, translationRules))
        .toEqual([
          {
            message: 'message1',
            type: 'TYPE1',
            path: [],
            variables: {}
          }
        ]);

    });

    it('should translate if path and type matches', function () {
      const errorInput = [
        {
          message: 'message1',
          type: 'TYPE1',
          path: [],
          variables: {}
        }
      ];
      const translationRules = [
        {
          type: 'TYPE1',
          path: /.*/,
          message: 'message2'
        }
      ];

      expect(ErrorMessageUtil.translateErrorMessages(errorInput, translationRules))
        .toEqual([
          {
            message: 'message2',
            type: 'TYPE1',
            path: [],
            variables: {}
          }
        ]);

    });

    it('should pick the first translation that passes', function () {
      const errorInput = [
        {
          message: 'message1',
          type: 'TYPE1',
          path: [],
          variables: {}
        }
      ];
      const translationRules = [
        {
          type: 'TYPE1',
          path: /.*/,
          message: 'message3'
        },
        {
          type: 'TYPE1',
          path: /.*/,
          message: 'message2'
        }
      ];

      expect(ErrorMessageUtil.translateErrorMessages(errorInput, translationRules))
        .toEqual([
          {
            message: 'message3',
            type: 'TYPE1',
            path: [],
            variables: {}
          }
        ]);

    });
  });
});
