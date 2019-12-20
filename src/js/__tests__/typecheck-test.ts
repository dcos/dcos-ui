import { getOutput } from "./helper";

test("TypeScript snapshot should be up to date", async () => {
  expect(
    (await getOutput("npx", ["tsc"]))
      .split("\n")
      // we're having trouble with paths here. on CI the paths given by that
      // error message are // project-relative. on my machine they are absolute.
      // we ignoring those for now.
      .filter((line: string) => !line.includes("has no exported member"))
      .join("\n")
  ).toMatchSnapshot();
}, 60000);
