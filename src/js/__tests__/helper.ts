import execa from "execa";
import path from "path";

const projectRoot = path.resolve(__dirname, "../../../");
const replaceRoot = new RegExp(projectRoot, "g");

export const getOutput = (cmd: string, params: string[]) =>
  execa(cmd, params)
    .then(out => {
      console.log(cmd, params, "does not yield any errors anymore!", out);
      return "";
    })
    .catch(({ stdout }) =>
      stdout
        .toString()
        .replace(replaceRoot, "")
        .split("\n")
        .filter(
          line =>
            // let's ignore errors in plugins-ee for now as those are most likely
            // inlined mid-term anyway
            !line.includes("plugins-ee") &&
            // Those are included if plugins-ee is around.
            // Ignoring those here is a quickfix, to evade trouble between
            // machines and CI.
            !line.includes("CheckboxTable") &&
            !line.includes("ServiceAccountForm") &&
            !line.includes("TextInput") &&
            !line.includes("Typeahead") &&
            !line.includes("ServiceAccountFormModal")
        )
        // output from tslint and tsc has no deterministic order.
        .sort()
        .join("\n")
    );
