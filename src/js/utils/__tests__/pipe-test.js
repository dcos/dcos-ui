import pipe from "../pipe";

function duplicate(x) {
  return 2 * x;
}
function square(x) {
  return x * x;
}

describe("#pipe", function() {
  it("composes two functions", function() {
    expect(
      pipe(
        duplicate,
        square
      )(1)
    ).toEqual(square(duplicate(1)));
  });

  it("composes a function with a sub-pipe", function() {
    expect(
      pipe(
        duplicate,
        pipe(
          square,
          duplicate
        )
      )(1)
    ).toEqual(duplicate(square(duplicate(1))));
  });
});
