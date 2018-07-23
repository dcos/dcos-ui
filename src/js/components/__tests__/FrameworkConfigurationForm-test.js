import { isValidFormData } from "../FrameworkConfigurationForm";

describe("#isValidFormData", () => {
  it("returns true if valid formdata is provided", () => {
    expect(isValidFormData({ a: "test" }, { properties: { a: true } })).toBe(
      true
    );
  });

  it("returns false if invalid formdata is provided", () => {
    expect(isValidFormData({ b: "test" }, { properties: { a: true } })).toBe(
      false
    );
  });

  it("returns false if partily invalid formdata is provided", () => {
    expect(
      isValidFormData({ a: "test", b: "test" }, { properties: { a: true } })
    ).toBe(false);
  });

  it("returns true if nested valid formdata is provided", () => {
    expect(
      isValidFormData(
        { a: "test", b: { a: "test", b: "test" } },
        { properties: { a: true, b: { properties: { a: true, b: true } } } }
      )
    ).toBe(true);
  });

  it("returns false if nested invalid formdata is provided", () => {
    expect(
      isValidFormData(
        { a: "test", b: { a: "test", b: "test" } },
        { properties: { a: true, b: { properties: { a: true } } } }
      )
    ).toBe(false);
  });
  it("returns true if empty formdata is provided", () => {
    expect(
      isValidFormData(
        {},
        { properties: { a: true, b: { properties: { a: true } } } }
      )
    ).toBe(true);
  });
});
