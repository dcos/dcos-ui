import TemplateUtil from "../TemplateUtil";

const React = require("react");

let thisDummyPage;

describe("Template Util", () => {
  const DummyHeader = () => <h1>Header</h1>;
  const DummyHeader2 = () => <h2>Header 2</h2>;
  const DummyFooter = () => <p>Footer</p>;

  beforeEach(() => {
    thisDummyPage = () => (
      <div>
        <DummyHeader />
        <p>A regular child 1</p>
        <p>A regular child 2</p>
      </div>
    );
    TemplateUtil.defineChildren(thisDummyPage, { Header: DummyHeader });
  });

  describe("#defineChildren", () => {
    it("makes children accessible via the parent constructor", () => {
      expect(thisDummyPage.Header).toBe(DummyHeader);
    });

    it("tracks the type of each child", () => {
      TemplateUtil.defineChildren(thisDummyPage, { Footer: DummyFooter });
      expect(TemplateUtil.getTypesOfTemplateChildren(thisDummyPage)).toEqual([
        DummyHeader,
        DummyFooter
      ]);
    });

    it("allows a template children to be overridden", () => {
      TemplateUtil.defineChildren(thisDummyPage, { Header: DummyHeader2 });
      expect(thisDummyPage.Header).toBe(DummyHeader2);
    });
  });

  describe("#filterTemplateChildren", () => {
    it("returns all children of an instance which are not template children", () => {
      const children = TemplateUtil.filterTemplateChildren(thisDummyPage, [
        <DummyHeader />,
        <p>A regular child 1</p>,
        <p>A regular child 2</p>
      ]);
      expect(children.map(child => child.type)).toEqual(["p", "p"]);
    });
  });

  describe("#getChildOfType", () => {
    it("returns the first child of an instance with the appropriate type", () => {
      const child = TemplateUtil.getChildOfType(
        [<DummyHeader />, <p>A regular child 1</p>, <p>A regular child 2</p>],
        DummyHeader
      );
      expect(child.type).toBe(DummyHeader);
    });
  });
});
