import read from "../read";

describe("read", function() {
  it("returns empty result given an empty input", function() {
    expect(read("")).toEqual([[], ""]);
  });

  it("returns a single record", function() {
    expect(read("5\n12345")).toEqual([["12345"], ""]);
  });

  it("returns multiple records", function() {
    expect(read("5\n123454\n12343\n123")).toEqual([
      ["12345", "1234", "123"],
      ""
    ]);
  });

  it("returns partial records", function() {
    expect(read("5\n1234")).toEqual([[], "5\n1234"]);
  });

  it("returns complete and partial records", function() {
    expect(read("5\n123452\n122\n21100\nf")).toEqual([
      ["12345", "12", "21"],
      "100\nf"
    ]);
  });

  it("works with a relatively long input", function() {
    expect(
      read(
        "1\n11\n11\n11\n11\n11\n11\n11\n11\n11\n11\n11\n11\n11\n11\n11\n11\n11\n11\n11\n11\n11\n11\n11\n11\n1"
      )
    ).toEqual([
      [
        "1",
        "1",
        "1",
        "1",
        "1",
        "1",
        "1",
        "1",
        "1",
        "1",
        "1",
        "1",
        "1",
        "1",
        "1",
        "1",
        "1",
        "1",
        "1",
        "1",
        "1",
        "1",
        "1",
        "1",
        "1"
      ],
      ""
    ]);
  });
});
