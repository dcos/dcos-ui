import { getOutput } from "./helper";

test("TypeScript snapshot should be up to date", async () => {
  expect(
    (await getOutput("npx", ["tsc"]))
      .split("\n")
      // we're having trouble with paths here. on CI the paths given by that
      // error message are // project-relative. on my machine they are absolute.
      // we ignoring those for now.
      .filter(
        (line: string) =>
          !line.includes("has no exported member") && !line.startsWith(" ")
      )
      // strip exact error position to reduce noise in the snapshots and detect actual errors more easily:
      //    src/File.tsx(230,24): error TS7030: Not all code paths return a value.
      // -> src/File.tsx: error TS7030: Not all code paths return a value.
      .join("\n")
      .replace(/^(\S*)\(\S*\):/gm, "$1:")
  ).toMatchSnapshot();
}, 120000);
