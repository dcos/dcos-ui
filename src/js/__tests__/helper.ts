import execa from "execa";
import path from "path";

const projectRoot = path.resolve(__dirname, "../../../");
const replaceRoot = new RegExp(projectRoot, "g");

export const getOutput = (cmd: string, params: string[]) =>
  execa(cmd, params)
    .then((out) => {
      console.log(cmd, params, "does not yield any errors anymore!", out);
      return "";
    })
    .catch(({ stdout }) =>
      stdout
        .toString()
        .replace(replaceRoot, "")
        .split("\n")
        // output from tslint and tsc has no deterministic order.
        .sort()
        .join("\n")
    );
