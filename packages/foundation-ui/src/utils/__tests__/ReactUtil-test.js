/* eslint-disable no-unused-vars */
import React from "react";
/* eslint-enable no-unused-vars */

const ReactUtil = require("../ReactUtil");

describe("ReactUtil", function() {
  it("wraps the elements if there is more than one", function() {
    const result = ReactUtil.wrapElements([
      <span key="1">test</span>,
      <span key="2">test</span>
    ]);

    expect(result.type).toBe("div");
  });

  it("does not wrap if not necessary", function() {
    const elements = ReactUtil.wrapElements(<span>test</span>);

    expect(elements.type).toEqual("span");
  });

  it("always wraps elements if configured", function() {
    const elements = ReactUtil.wrapElements(<span>test</span>, "div", true);

    expect(elements.type).toEqual("div");
  });

  it("wraps elements with provided wrapper", function() {
    const elements = ReactUtil.wrapElements(<span>test</span>, "p", true);

    expect(elements.type).toEqual("p");
  });

  it("handles undefined elements", function() {
    const elements = ReactUtil.wrapElements(undefined);

    expect(elements).toEqual(null);
  });

  it("does not wrap elements if they are an array with a single item", function() {
    const elements = ReactUtil.wrapElements([<span key={0}>test</span>], "p");

    expect(elements.type).toEqual("span");
  });

  it("wraps elements if they are an array with a single item when alwaysWrap is true", function() {
    const elements = ReactUtil.wrapElements(
      [<span key={0}>test</span>],
      "p",
      true
    );

    expect(elements.type).toEqual("p");
  });
});
