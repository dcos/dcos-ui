import FormErrorUtil from "../FormErrorUtil";

describe("FormErrorUtil", function() {
  describe("#getTopLevelTabErrors", function() {
    const errors = [
      {
        path: ["foo"],
        message: "Foo must be defined"
      },
      {
        path: ["bar"],
        message: "Bar must be defined"
      },
      {
        path: ["baz"],
        message: "Bar must be defined"
      },
      {
        path: ["bat"],
        message: "Bat must be defined"
      }
    ];

    const tabRegexes = {
      services: [/^foo$/],
      placement: [/^bar$/, /^baz$/],
      volumes: [/^bat$/]
    };
    const topLevelErrors = FormErrorUtil.getTopLevelTabErrors(
      errors,
      tabRegexes,
      []
    );

    it("does not return an object containing errors with the same message", function() {
      expect(Object.keys(topLevelErrors).length).toEqual(3);
    });
    it("returns an object with the same keys as the object passed to the second parameter", function() {
      expect(Object.keys(topLevelErrors)).toEqual(Object.keys(tabRegexes));
    });
    it("maps error paths based on the regexes in the second parameter", function() {
      const expectedOutput = {
        services: [
          {
            parsedMessage: "foo: Foo must be defined",
            errorObj: { path: ["foo"], message: "Foo must be defined" }
          }
        ],
        placement: [
          {
            parsedMessage: "bar: Bar must be defined",
            errorObj: { path: ["bar"], message: "Bar must be defined" }
          },
          {
            parsedMessage: "baz: Bar must be defined",
            errorObj: { path: ["baz"], message: "Bar must be defined" }
          }
        ],
        volumes: [
          {
            parsedMessage: "bat: Bat must be defined",
            errorObj: { path: ["bat"], message: "Bat must be defined" }
          }
        ]
      };
      expect(JSON.stringify(topLevelErrors)).toEqual(
        JSON.stringify(expectedOutput)
      );
    });
  });

  describe("#getContainerTabErrors", function() {
    const baseErrors = [
      {
        path: ["foo"],
        message: "Foo must be defined"
      }
    ];

    const containerErrors = [
      {
        path: ["container", 0, "foo"],
        message: "Foo must be defined"
      },
      {
        path: ["container", 1, "baz"],
        message: "Baz must be defined"
      }
    ];

    const errors = [...baseErrors, ...containerErrors];

    const tabRegexes = {
      services: [/^foo$/],
      containers: [/^container\..*/]
    };
    const topLevelErrors = FormErrorUtil.getTopLevelTabErrors(
      errors,
      tabRegexes,
      []
    );
    const containerTabErrors = FormErrorUtil.getContainerTabErrors(
      topLevelErrors
    );

    it("returns the error data from the path that matches the 'containers' regex", function() {
      Object.keys(containerTabErrors).forEach((tabName, i) => {
        containerTabErrors[tabName].forEach(error => {
          expect(JSON.stringify(containerErrors[i])).toEqual(
            JSON.stringify(error.errorObj)
          );
        });
      });
    });

    it("returns the error data from the path that matches the 'containers' regex", function() {
      const tabErrorKeys = Object.keys(containerTabErrors).map(
        tabName => tabName
      );
      const tabIds = containerErrors.map(error => `container${error.path[1]}`);

      expect(tabErrorKeys).toEqual(tabIds);
    });
  });
});
