import {
  getFrameworksAction,
  frameworkAddedAction,
  frameworkUpdatedAction,
  frameworkRemovedAction,
} from "../frameworks";

describe("frameworks parser", () => {
  describe("#getFrameworksAction", () => {
    it("parses the correct message", () => {
      const state = {};
      const message = {
        type: "GET_FRAMEWORKS",
        get_frameworks: {
          frameworks: [
            {
              framework_info: {
                id: {
                  value: "628984d0-4213-4140-bcb0-99d7ef46b1df-0000",
                },
                name: "default",
                user: "root",
              },
            },
          ],
        },
      };

      const result = getFrameworksAction(state, message);

      expect(result).toEqual({
        frameworks: [
          {
            id: "628984d0-4213-4140-bcb0-99d7ef46b1df-0000",
            name: "default",
            user: "root",
          },
        ],
      });
    });
  });

  describe("#frameworkAddedAction", () => {
    it("parses the correct message", () => {
      const state = { frameworks: [] };
      const message = {
        type: "FRAMEWORK_ADDED",
        framework_added: {
          framework: {
            framework_info: {
              id: {
                value: "628984d0-4213-4140-bcb0-99d7ef46b1df-0000",
              },
              name: "default",
              user: "root",
            },
          },
        },
      };

      const result = frameworkAddedAction(state, message);

      expect(result).toEqual({
        frameworks: [
          {
            id: "628984d0-4213-4140-bcb0-99d7ef46b1df-0000",
            name: "default",
            user: "root",
          },
        ],
      });
    });
  });

  describe("#frameworkUpdatedAction", () => {
    it("parses the correct message", () => {
      const state = {
        frameworks: [
          {
            id: "628984d0-4213-4140-bcb0-99d7ef46b1df-0000",
            name: "default",
            user: "root",
          },
        ],
      };
      const message = {
        type: "FRAMEWORK_UPDATED",
        framework_updated: {
          framework: {
            framework_info: {
              id: {
                value: "628984d0-4213-4140-bcb0-99d7ef46b1df-0000",
              },
              name: "default-1",
              user: "root",
            },
          },
        },
      };

      const result = frameworkUpdatedAction(state, message);

      expect(result).toEqual({
        frameworks: [
          {
            id: "628984d0-4213-4140-bcb0-99d7ef46b1df-0000",
            name: "default-1",
            user: "root",
          },
        ],
      });
    });
  });

  describe("#frameworkRemovedAction", () => {
    it("parses the correct message", () => {
      const state = {
        frameworks: [
          {
            id: "628984d0-4213-4140-bcb0-99d7ef46b1df-0000",
            name: "default",
            user: "root",
          },
        ],
      };
      const message = {
        type: "FRAMEWORK_REMOVED",
        framework_removed: {
          framework_info: {
            id: {
              value: "628984d0-4213-4140-bcb0-99d7ef46b1df-0000",
            },
            name: "default",
            user: "root",
          },
        },
      };

      const result = frameworkRemovedAction(state, message);

      expect(result).toEqual({ frameworks: [] });
    });
  });
});
