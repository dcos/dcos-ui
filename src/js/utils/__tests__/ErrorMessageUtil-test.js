const ErrorMessageUtil = require("../ErrorMessageUtil");

describe("ErrorMessageUtil", function() {
  describe("#translateErrorMessages", function() {
    it("passes through if there is no translation", function() {
      const errorInput = [
        {
          message: "message1",
          type: "TYPE1",
          path: [],
          variables: {}
        }
      ];
      const translationRules = [];

      expect(
        ErrorMessageUtil.translateErrorMessages(errorInput, translationRules)
      ).toEqual([
        {
          message: "message1",
          type: "TYPE1",
          path: [],
          variables: {}
        }
      ]);
    });

    it("passes through if no path matches", function() {
      const errorInput = [
        {
          message: "message1",
          type: "TYPE1",
          path: [],
          variables: {}
        }
      ];
      const translationRules = [
        {
          type: "TYPE1",
          path: /^E/,
          message: "message2"
        }
      ];

      expect(
        ErrorMessageUtil.translateErrorMessages(errorInput, translationRules)
      ).toEqual([
        {
          message: "message1",
          type: "TYPE1",
          path: [],
          variables: {}
        }
      ]);
    });

    it("passes through if no type matches", function() {
      const errorInput = [
        {
          message: "message1",
          type: "TYPE1",
          path: [],
          variables: {}
        }
      ];
      const translationRules = [
        {
          type: "TYPE2",
          path: /.*/,
          message: "message2"
        }
      ];

      expect(
        ErrorMessageUtil.translateErrorMessages(errorInput, translationRules)
      ).toEqual([
        {
          message: "message1",
          type: "TYPE1",
          path: [],
          variables: {}
        }
      ]);
    });

    it("translates if path and type matches", function() {
      const errorInput = [
        {
          message: "message1",
          type: "TYPE1",
          path: [],
          variables: {}
        }
      ];
      const translationRules = [
        {
          type: "TYPE1",
          path: /.*/,
          message: "message2"
        }
      ];

      expect(
        ErrorMessageUtil.translateErrorMessages(errorInput, translationRules)
      ).toEqual([
        {
          message: "message2",
          type: "TYPE1",
          path: [],
          variables: {}
        }
      ]);
    });

    it("does not modify path if a rule matches", function() {
      const errorInput = [
        {
          message: "message1",
          type: "TYPE1",
          path: ["foo", 0, "bar"],
          variables: {}
        }
      ];
      const translationRules = [
        {
          type: "TYPE1",
          path: /.*/,
          message: "message2"
        }
      ];

      expect(
        ErrorMessageUtil.translateErrorMessages(errorInput, translationRules)
      ).toEqual([
        {
          message: "message2",
          type: "TYPE1",
          path: ["foo", 0, "bar"],
          variables: {}
        }
      ]);
    });

    it("picks the first translation that passes", function() {
      const errorInput = [
        {
          message: "message1",
          type: "TYPE1",
          path: [],
          variables: {}
        }
      ];
      const translationRules = [
        {
          type: "TYPE1",
          path: /.*/,
          message: "message3"
        },
        {
          type: "TYPE1",
          path: /.*/,
          message: "message2"
        }
      ];

      expect(
        ErrorMessageUtil.translateErrorMessages(errorInput, translationRules)
      ).toEqual([
        {
          message: "message3",
          type: "TYPE1",
          path: [],
          variables: {}
        }
      ]);
    });

    it("replaces variables", function() {
      const errorInput = [
        {
          message: "message1 is 3",
          type: "TYPE1",
          path: [],
          variables: {
            value: 3
          }
        }
      ];
      const translationRules = [
        {
          type: "TYPE1",
          path: /.*/,
          message: "message2 is ||value||"
        }
      ];

      expect(
        ErrorMessageUtil.translateErrorMessages(errorInput, translationRules)
      ).toEqual([
        {
          message: "message2 is 3",
          type: "TYPE1",
          path: [],
          variables: {
            value: 3
          }
        }
      ]);
    });

    it("is able to handle errors with no path", function() {
      const errorInput = [{ message: "message" }];
      const translationRules = [];

      const translatedErrors = ErrorMessageUtil.translateErrorMessages(
        errorInput,
        translationRules
      );
      expect(translatedErrors).toEqual([{ message: "message" }]);
    });

    it("is able to handle errors with null messages", function() {
      const errorInput = [{ message: null }];
      const translationRules = [];

      const translatedErrors = ErrorMessageUtil.translateErrorMessages(
        errorInput,
        translationRules
      );
      expect(translatedErrors).toEqual([{ message: null }]);
    });
  });

  describe("#getUnanchoredErrorMessage", function() {
    it("passes through if error.isUnanchored", function() {
      const errorInput = {
        message: "An error message",
        isUnanchored: true,
        path: []
      };
      const pathTranslationRules = [];
      const i18n = {
        _(text) {
          return text;
        }
      };

      expect(
        ErrorMessageUtil.getUnanchoredErrorMessage(
          errorInput,
          pathTranslationRules,
          i18n
        )
      ).toEqual("An error message");
    });

    it("passes through if a rule is not found and path is empty", function() {
      const errorInput = {
        message: "An error message",
        isUnanchored: false,
        path: []
      };
      const pathTranslationRules = [];

      expect(
        ErrorMessageUtil.getUnanchoredErrorMessage(
          errorInput,
          pathTranslationRules
        )
      ).toEqual("An error message");
    });

    it("passes through if path is empty", function() {
      const errorInput = {
        message: "An error message",
        isUnanchored: false,
        path: []
      };
      const pathTranslationRules = [
        {
          match: /^foo.*/,
          name: "Unit test"
        }
      ];

      expect(
        ErrorMessageUtil.getUnanchoredErrorMessage(
          errorInput,
          pathTranslationRules
        )
      ).toEqual("An error message");
    });

    it("appends path string if rule not found", function() {
      const errorInput = {
        message: "An error message",
        isUnanchored: false,
        path: ["foo", "bar"]
      };
      const pathTranslationRules = [];

      expect(
        ErrorMessageUtil.getUnanchoredErrorMessage(
          errorInput,
          pathTranslationRules
        )
      ).toEqual("foo.bar: An error message");
    });

    it("builds error message from name and message", function() {
      const errorInput = {
        message: "Error occurred doing stuff",
        isUnanchored: false,
        path: ["foo"]
      };
      const pathTranslationRules = [
        {
          match: /^foo.*/,
          name: "Unit test"
        }
      ];

      expect(
        ErrorMessageUtil.getUnanchoredErrorMessage(
          errorInput,
          pathTranslationRules
        )
      ).toEqual("Unit test error occurred doing stuff");
    });
  });

  describe("Localization", function() {
    describe("#getUnanchoredErrorMessage", function() {
      it("translated name if i18n given", function() {
        const errorInput = {
          message: "Error occurred doing stuff",
          isUnanchored: false,
          path: ["foo"]
        };
        const pathTranslationRules = [
          {
            match: /^foo.*/,
            name: "Unit test"
          }
        ];
        const i18n = {
          _() {
            return "Translated name";
          }
        };

        expect(
          ErrorMessageUtil.getUnanchoredErrorMessage(
            errorInput,
            pathTranslationRules,
            i18n
          )
        ).toEqual("Translated name error occurred doing stuff");
      });
    });

    describe("#translateErrorMessages", function() {
      it("translates if path and type matches", function() {
        const errorInput = [
          {
            message: "message1",
            type: "TYPE1",
            path: [],
            variables: {}
          }
        ];
        const translationRules = [
          {
            type: "TYPE1",
            path: /.*/,
            message: "message2"
          }
        ];
        const i18n = {
          _() {
            return "test2";
          }
        };

        expect(
          ErrorMessageUtil.translateErrorMessages(
            errorInput,
            translationRules,
            i18n
          )
        ).toEqual([
          {
            message: "test2",
            type: "TYPE1",
            path: [],
            variables: {}
          }
        ]);
      });

      it("replaces variables", function() {
        const errorInput = [
          {
            message: "message1 is 3",
            type: "TYPE1",
            path: [],
            variables: {
              value: 3
            }
          }
        ];
        const translationRules = [
          {
            type: "TYPE1",
            path: /.*/,
            message: "message2 is ||value||"
          }
        ];

        const i18n = {
          _() {
            return "Nachricht ist ||value||";
          }
        };

        expect(
          ErrorMessageUtil.translateErrorMessages(
            errorInput,
            translationRules,
            i18n
          )
        ).toEqual([
          {
            message: "Nachricht ist 3",
            type: "TYPE1",
            path: [],
            variables: {
              value: 3
            }
          }
        ]);
      });
    });
  });
});
