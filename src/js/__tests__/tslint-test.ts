import { getOutput } from "./helper";

test("tslint snapshot should be up to date", async () => {
  expect(
    await getOutput("tslint", ["--project", "tsconfig.json"])
  ).toMatchSnapshot();
}, 60000);
