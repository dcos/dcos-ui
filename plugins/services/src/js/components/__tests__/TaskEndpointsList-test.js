import React from "react";
import { shallow } from "enzyme";

const Node = require("#SRC/js/structs/Node");
const TaskEndpointsList = require("../TaskEndpointsList");

describe("TaskEndpointsList", function() {
  describe("#getTaskEndpoints", function() {
    it("returns N/A if ipAddresses, ports and host is not set", function() {
      const instance = shallow(<TaskEndpointsList task={{}} />);
      expect(instance.text()).toEqual("N/A");
    });

    it("returns N/A if task is undefined", function() {
      const instance = shallow(<TaskEndpointsList />);
      expect(instance.text()).toEqual("N/A");
    });

    it("returns a list of linked ipAddresses if ports is not defined", function() {
      const instance = shallow(
        <TaskEndpointsList
          task={{
            statuses: [
              {
                container_status: {
                  network_infos: [
                    {
                      ip_addresses: [
                        { ip_address: "foo" },
                        { ip_address: "bar" }
                      ]
                    }
                  ]
                }
              }
            ],
            container: { type: "FOO", foo: { network: "BRIDGE" } }
          }}
        />
      );
      const links = instance.find("a");
      expect(links.at(0).text()).toEqual("foo");
      expect(links.at(0).prop("href")).toEqual("//foo");
      expect(links.at(1).text()).toEqual("bar");
      expect(links.at(1).prop("href")).toEqual("//bar");
    });

    it("returns a list of linked hosts ports and ipAddresses are not defined", function() {
      const instance = shallow(
        <TaskEndpointsList task={{}} node={new Node({ hostname: "foo" })} />
      );
      const links = instance.find("a");

      expect(links.at(0).text()).toEqual("foo");
      expect(links.at(0).prop("href")).toEqual("//foo");
    });

    it("returns host with ports if ipAddresses are not defined", function() {
      const instance = shallow(
        <TaskEndpointsList
          task={{ ports: [1, 2] }}
          node={new Node({ hostname: "foo" })}
        />
      );
      const links = instance.find("a");

      expect(instance.text()).toEqual("foo: [1, 2]");
      expect(links.at(0).text()).toEqual("1");
      expect(links.at(0).prop("href")).toEqual("//foo:1");
      expect(links.at(1).text()).toEqual("2");
      expect(links.at(1).prop("href")).toEqual("//foo:2");
    });

    it("returns truncated list if more than 3 ports are provided", function() {
      const instance = shallow(
        <TaskEndpointsList
          task={{ ports: [1, 2, 3, 4, 5] }}
          node={new Node({ hostname: "foo" })}
        />
      );
      const links = instance.find("a");
      const moreLink = links.at(3);

      expect(instance.text()).toEqual("foo: [1, 2, 3, 2 more...]");
      expect(moreLink.text()).toEqual("2 more...");
    });

    it('expands truncated list when "more" is clicked', function() {
      const instance = shallow(
        <TaskEndpointsList
          task={{ ports: [1, 2, 3, 4, 5] }}
          node={new Node({ hostname: "foo" })}
        />
      );
      let links = instance.find("a");
      const moreLink = links.at(3);
      moreLink.simulate("click");
      links = instance.find("a");
      const lessLink = links.at(5);

      expect(instance.text()).toEqual("foo: [1, 2, 3, 4, 5, less]");
      expect(lessLink.text()).toEqual("less");
    });

    it('collapses truncated list when "less" is clicked', function() {
      const instance = shallow(
        <TaskEndpointsList
          task={{ ports: [1, 2, 3, 4, 5] }}
          node={new Node({ hostname: "foo" })}
        />
      );

      let links = instance.find("a");
      const moreLink = links.at(3);
      moreLink.simulate("click");
      // Make sure it actually expanded the list.
      expect(instance.text()).toEqual("foo: [1, 2, 3, 4, 5, less]");
      links = instance.find("a");
      const lessLink = links.at(5);
      lessLink.simulate("click");

      expect(instance.text()).toEqual("foo: [1, 2, 3, 2 more...]");
    });
  });
});
