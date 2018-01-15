/* eslint-disable no-unused-vars */
const React = require("react");
/* eslint-enable no-unused-vars */
const ReactDOM = require("react-dom");

const ProgressBar = require("../ProgressBar");

const testData = [
  {
    key: "#FFF",
    value: 40,
    className: "status"
  },
  {
    key: "#000",
    value: 60,
    className: "failed"
  }
];

describe("#ProgressBar", function() {
  beforeEach(function() {
    this.container = global.document.createElement("div");
    this.instance = ReactDOM.render(
      <ProgressBar data={testData} />,
      this.container
    );
  });

  afterEach(function() {
    ReactDOM.unmountComponentAtNode(this.container);
  });

  describe("PropTypes", function() {
    it("throws an error if no data prop is provided", function() {
      spyOn(console, "error");
      this.instance = ReactDOM.render(<ProgressBar />, this.container);
      expect(console.error).toHaveBeenCalledWith(
        "Warning: Failed prop type: " +
          "The prop `data` is marked as required in `ProgressBar`, but its value " +
          "is `undefined`.\n" +
          "    in ProgressBar"
      );
    });

    it("throws an error if a data item is missing a value", function() {
      spyOn(console, "error");
      this.instance = ReactDOM.render(
        <ProgressBar
          data={[
            {
              className: "status"
            }
          ]}
        />,
        this.container
      );
      expect(console.error).toHaveBeenCalledWith(
        "Warning: Failed prop type: " +
          "The prop `data[0].value` is marked as required in `ProgressBar`, but its value " +
          "is `undefined`.\n" +
          "    in ProgressBar"
      );
    });

    it("throws an error if one data item is missing a value", function() {
      spyOn(console, "error");
      this.instance = ReactDOM.render(
        <ProgressBar
          data={[
            {
              className: "status",
              value: 10
            },
            {
              className: "unknown"
            }
          ]}
        />,
        this.container
      );
      expect(console.error).toHaveBeenCalledWith(
        "Warning: Failed prop type: " +
          "The prop `data[1].value` is marked as required in `ProgressBar`, but its value " +
          "is `undefined`.\n" +
          "    in ProgressBar"
      );
    });

    it("does not throw an error if data does only contain a value field", function() {
      spyOn(console, "error");
      this.instance = ReactDOM.render(
        <ProgressBar
          data={[
            {
              value: 40
            }
          ]}
        />,
        this.container
      );
      expect(console.error).not.toHaveBeenCalled();
    });
  });

  describe("className", function() {
    it("contains status-bar (default)", function() {
      expect(
        this.container.querySelector("div").classList.contains("status-bar")
      ).toBeTruthy();
    });

    it("contains test-bar (custom)", function() {
      this.instance = ReactDOM.render(
        <ProgressBar data={testData} className="test-bar" />,
        this.container
      );
      expect(
        this.container.querySelector("div").classList.contains("test-bar")
      ).toBeTruthy();
    });
  });

  describe("bars", function() {
    it("contains 2 .bars", function() {
      expect(this.container.querySelectorAll(".bar").length).toEqual(
        testData.length
      );
    });

    describe("First .bar", function() {
      it("contains class name status", function() {
        expect(
          this.container
            .querySelector(".bar:first-child")
            .classList.contains("status")
        ).toBeTruthy();
      });

      it("has the class element-{index} if no classname is provided", function() {
        this.instance = ReactDOM.render(
          <ProgressBar
            data={[
              {
                value: 40
              }
            ]}
          />,
          this.container
        );
        expect(
          this.container.querySelector(".bar").classList.contains("element-0")
        ).toBeTruthy();
      });

      it("has a width of 40%", function() {
        expect(
          this.container.querySelector(".bar:first-child").style.width
        ).toEqual("40%");
      });
    });

    describe("Second .bar", function() {
      it("contains class name failed", function() {
        expect(
          this.container
            .querySelector(".bar:nth-child(2)")
            .classList.contains("failed")
        ).toBeTruthy();
      });

      it("has a width of 60%", function() {
        expect(
          this.container.querySelector(".bar:nth-child(2)").style.width
        ).toEqual("60%");
      });
    });

    describe("Growing small .bar portions to be visible when below threshold", function() {
      it("does not have .bar elements < 7% width", function() {
        ReactDOM.render(
          <ProgressBar
            data={[
              {
                value: 99
              },
              {
                value: 1
              }
            ]}
            className="test-bar"
          />,
          this.container
        );
        const percentages = [];
        [].slice
          .call(this.container.querySelectorAll(".bar"))
          .forEach(function(el) {
            percentages.push(parseInt(el.style.width.replace("%", ""), 10));
          });
        expect(percentages.length).toBe(2);
        expect(percentages.filter(percent => percent < 7).length).toBe(0);
      });

      it("does not have .bar elements < 7% width when using scale", function() {
        ReactDOM.render(
          <ProgressBar
            data={[
              {
                value: 0
              },
              {
                value: 1
              },
              {
                value: 1
              },
              {
                value: 6
              }
            ]}
            total={100}
            className="test-bar"
          />,
          this.container
        );
        const percentages = [];
        [].slice
          .call(this.container.querySelectorAll(".bar"))
          .forEach(function(el) {
            percentages.push(parseInt(el.style.width.replace("%", ""), 10));
          });
        expect(percentages.length).toBe(3);
        expect(percentages.filter(percent => percent < 7).length).toBe(0);
      });
    });
  });
});
