import { getOutput } from "./helper";

test("TypeScript snapshot should be up to date", async () => {
  expect(
    (await getOutput("npx", ["tsc"]))
      .split("\n")
      .filter(
        (l: string) =>
          // additional lines emitted by tsc that don't contain a file path.
          !l.startsWith(" ") &&
          // newly compiled files (TSFILE: my/path/to/file.)
          !l.startsWith("TSFILE: ")
      )
      .join("\n")

      // strip exact error position to reduce noise in the snapshots and detect actual errors more easily:
      //    src/File.tsx(230,24): error TS7030: Not all code paths return a value.
      // -> src/File.tsx: error TS7030: Not all code paths return a value.
      .replace(/^(\S*)\(\S*\):/gm, "$1:")

      // strip the specifics of type errors as the order of properties varies between runs of tsc.
      .replace(/type '[^']+?\s[^']*?'/gim, "type *")

      // Modules are referenced in absolute paths in some circumstances (e.g. in CI).
      // thus we need to normalize those paths between machines.
      .replace(
        /Module '.*?' has no exported member (.*?)\..*$/gm,
        "Module has no exported member $1."
      )
  ).toMatchSnapshot();
}, 120000);
