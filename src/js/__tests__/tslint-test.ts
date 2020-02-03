import fs from "fs";
import execa from "execa";
import path from "path";

const projectRoot = path.resolve(__dirname, "../../../");
const replaceRoot = new RegExp(projectRoot, "g");

test("tslint snapshot should be up to date", async () => {
  await execa("tslint", [
    "--project",
    "tsconfig.json",
    "-o",
    "/tmp/tslint"
  ]).catch(() => {
    return "that's ok!";
  });

  const file = fs.readFileSync("/tmp/tslint", "utf-8");
  expect(
    file
      .replace(replaceRoot, "")
      .replace(
        // strip exact error position to reduce noise in the snapshots and detect actual errors more easily
        //   ERROR: /plugins/NodesTable.tsx:123:42 - Multiline JS expressions inside JSX are forbidden
        // ->ERROR: /plugins/NodesTable.tsx - Multiline JS expressions inside JSX are forbidden
        /ERROR: (\S*):\d*:\d* -/gm,
        "$1 -"
      )
      .split("\n")
      .sort()
      .join("\n")
  ).toMatchSnapshot();
}, 120000);
