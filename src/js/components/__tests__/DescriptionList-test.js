import React from "react";

import { shallow, mount } from "enzyme";

const HashMapDisplay = require("../HashMapDisplay");

describe("HashMapDisplay", function() {
  it("returns null if hash is not passed", function() {
    const instance = shallow(<HashMapDisplay />);
    expect(instance.type()).toEqual(null);
  });

  it("returns null if hash is not passed with headline", function() {
    const instance = shallow(<HashMapDisplay headline="foo" />);

    expect(instance.type()).toEqual(null);
  });

  it("returns null if undefined is passed to hash", function() {
    const instance = shallow(<HashMapDisplay hash={undefined} />);

    expect(instance.type()).toEqual(null);
  });

  it("returns null if empty object is passed to hash", function() {
    const instance = shallow(<HashMapDisplay hash={{}} />);

    expect(instance.type()).toEqual(null);
  });

  it("returns a node of elements if node exists", function() {
    var instance = shallow(<HashMapDisplay hash={{ foo: "bar" }} />);

    expect(instance.find("ConfigurationMapLabel").length).toEqual(1);
    expect(instance.find("ConfigurationMapValue").length).toEqual(1);
  });

  it("returns a headline if headline string is given", function() {
    var instance = mount(
      <HashMapDisplay hash={{ foo: "bar" }} headline="baz" />
    );

    expect(instance.find("ConfigurationMapHeading").text()).toEqual("baz");
  });
});
