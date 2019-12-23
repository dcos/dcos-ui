import { getOutput } from "./helper";

test("tslint snapshot should be up to date", async () => {
  expect(
    (await getOutput("tslint", ["--project", "tsconfig.json"])).replace(
      // strip exact error position to reduce noise in the snapshots and detect actual errors more easily
      //   ERROR: /plugins/NodesTable.tsx:123:42 - Multiline JS expressions inside JSX are forbidden
      // ->ERROR: /plugins/NodesTable.tsx - Multiline JS expressions inside JSX are forbidden
      /ERROR: (\S*):\d*:\d* -/gm,
      "$1 -"
    )
  ).toMatchSnapshot();
}, 60000);
