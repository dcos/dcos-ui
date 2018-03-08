import React from "react";
import { mount } from "enzyme";

const Highlight = require("../Highlight");

describe("Highlight instance", function() {
  it("is what it says it is", function() {
    const instance = mount(
      <Highlight search="world">
        Hello World
      </Highlight>
    );

    expect(instance.type()).toEqual(Highlight);
    expect(instance.find(".highlight").text()).toEqual("World");
  });

  it("has children", function() {
    const instance = mount(
      <Highlight search="fox">
        The quick brown fox jumped over the lazy dog.
      </Highlight>
    );

    expect(instance.find("div").children().length).toBe(3);
    expect(instance.find(".highlight").length).toBe(1);
  });

  it("supports custom HTML tag for matching elements", function() {
    const instance = mount(
      <Highlight matchElement="em" search="world">
        Hello World
      </Highlight>
    );

    expect(instance.find("em").length).toEqual(1);
  });

  it("supports custom className for matching element", function() {
    const instance = mount(
      <Highlight matchClass="fffffound" search="Seek">
        Hide and Seek
      </Highlight>
    );

    expect(instance.find(".fffffound").length).toEqual(1);
  });

  it("supports passing props to parent element", function() {
    const instance = mount(
      <Highlight className="myHighlighter" search="world">
        Hello World
      </Highlight>
    );

    expect(instance.find("div").prop("className")).toEqual("myHighlighter");
    expect(instance.find("strong").prop("className")).toEqual("highlight");
  });

  it("supports regular expressions in search", function() {
    const instance = mount(
      <Highlight className="myHighlighter" search={/[A-Za-z]+/}>
        Easy as 123, ABC...
      </Highlight>
    );

    const matches = instance.find("strong").map(function(match) {
      return match.text();
    });

    expect(matches).toEqual(["Easy", "as", "ABC"]);
  });

  it("supports escaping arbitrary string in search", function() {
    function renderInstance() {
      mount(
        <Highlight className="myHighlighter" search="Test (">
          Test (should not throw)
        </Highlight>
      );
    }
    expect(renderInstance.bind(this)).not.toThrow();
  });
});
