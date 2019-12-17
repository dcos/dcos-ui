import * as React from "react";
import { shallow, mount } from "enzyme";

import SplitPanel, {
  PrimaryPanel,
  SidePanel,
  getSidePanelWidth,
  getSidePanelProps
} from "../SplitPanel";

describe("SplitPanel", () => {
  it("renders default", () => {
    const component = shallow(
      <SplitPanel>
        <PrimaryPanel>PrimaryPanel</PrimaryPanel>
        <SidePanel>SidePanel</SidePanel>
      </SplitPanel>
    );
    expect(component).toMatchSnapshot();
  });
  it("renders with SidePanel isActive prop set to true", () => {
    const component = shallow(
      <SplitPanel>
        <PrimaryPanel>PrimaryPanel</PrimaryPanel>
        <SidePanel isActive={true}>SidePanel</SidePanel>
      </SplitPanel>
    );
    expect(component).toMatchSnapshot();
  });
  it("renders SidePanel and PrimaryPanel with className passed", () => {
    const component = shallow(
      <SplitPanel>
        <PrimaryPanel className="className">PrimaryPanel</PrimaryPanel>
        <SidePanel className="className">SidePanel</SidePanel>
      </SplitPanel>
    );
    expect(component).toMatchSnapshot();
  });

  describe("resizing", () => {
    const mockContainerWidth = 100;
    const resizeAmount = 10;

    beforeEach(() => {
      Element.prototype.getBoundingClientRect = jest.fn(() => ({
        width: mockContainerWidth,
        height: 0,
        top: 0,
        left: 0,
        bottom: 0,
        right: 0
      }));
    });
    it("calls onResize callback when finished dragging", () => {
      const onResizeCallback = jest.fn();
      const component = mount(
        <SplitPanel onResize={onResizeCallback}>
          <PrimaryPanel>PrimaryPanel</PrimaryPanel>
          <SidePanel isActive={true}>SidePanel</SidePanel>
        </SplitPanel>
      );
      const separator = component.find(".splitPanels-separator");
      const panelContainer = component.find(".splitPanels"); // target the documentElement

      Element.prototype.getBoundingClientRect = jest.fn(() => ({
        width: mockContainerWidth,
        height: 0,
        top: 0,
        left: 0,
        bottom: 0,
        right: 0
      }));

      separator.simulate("mousedown");
      panelContainer.simulate("mousemove", { clientX: resizeAmount });
      separator.simulate("mouseup");
      expect(onResizeCallback).toHaveBeenCalledWith(
        mockContainerWidth - resizeAmount
      );
    });
    describe("#getSidePanelWidth", () => {
      it("returns difference between drag delta and full component width in pixels", () => {
        const element = document.createElement("span");
        const rect = element.getBoundingClientRect();
        expect(getSidePanelWidth(rect, resizeAmount)).toBe(
          mockContainerWidth - resizeAmount
        );
      });
      it("returns 0 if difference between drag delta and full component width is =< 0", () => {
        const element = document.createElement("span");
        const rect = element.getBoundingClientRect();
        expect(getSidePanelWidth(rect, mockContainerWidth + resizeAmount)).toBe(
          0
        );
      });
      it("returns full component width if difference between drag delta is >= full component width", () => {
        const element = document.createElement("span");
        const rect = element.getBoundingClientRect();
        expect(
          getSidePanelWidth(
            rect,
            parseInt((mockContainerWidth + resizeAmount) * -1, 10)
          )
        ).toBe(100);
      });
    });
  });
  describe("#getSidePanelProps", () => {
    it("returns the props passed to the SidePanel child", () => {
      const component = shallow(
        <SplitPanel>
          <PrimaryPanel>PrimaryPanel</PrimaryPanel>
          <SidePanel isActive={true}>SidePanel</SidePanel>
        </SplitPanel>
      );
      expect(component.find(SidePanel).props()).toEqual(
        getSidePanelProps(component.prop("children"))
      );
    });
  });
});
