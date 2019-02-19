import { JobFormUIData, UcrContainer } from "./JobFormData";
import { getDefaultContainer } from "./DefaultFormData";
import { JobFormHistory } from "./JobFormHistory";

interface JobsJSONParser {
  [key: string]: ParserFunction | ParserFunctionWithHistory;
}

export type ParserFunction = (value: any, formData: JobFormUIData) => void;

export type ParserFunctionWithHistory = (
  value: any,
  formData: JobFormUIData,
  history: JobFormHistory
) => void;

const Parser: JobsJSONParser = {
  containerImage: (image: string, formData: JobFormUIData) => {
    if (formData.job.run.ucr) {
      const prevUcrImage = { ...formData.job.run.ucr.image };
      const newUcrImage = {
        id: image
      };
      formData.job.run.ucr.image = {
        ...prevUcrImage,
        ...newUcrImage
      };
    }
    if (formData.job.run.docker) {
      formData.job.run.docker.image = image;
    }
  },
  cmdOnly: (
    value: "true" | "false",
    formData: JobFormUIData,
    history: JobFormHistory
  ) => {
    if (value === "true") {
      formData.cmdOnly = true;
      if (formData.job.run.ucr) {
        history.add("ucr", formData.job.run.ucr);
        history.add("gpus", formData.job.run.gpus);
        delete formData.job.run.ucr;
        delete formData.job.run.gpus;
      }
      if (formData.job.run.docker) {
        history.add("docker", formData.job.run.docker);
        delete formData.job.run.docker;
      }
    }
    if (value === "false") {
      formData.cmdOnly = false;
      // TODO: once container section is implemented, add the last container
      // configuration that was used (based on history) instead of defaulting to
      // ucr. For ex: if the user adds a docker container, then switches to command only,
      // then switches back to container, we should add their last docker configuration
      // as the container.
      const ucrFromHistory = history.get("ucr");
      formData.job.run.ucr = Object.keys(ucrFromHistory).length
        ? (ucrFromHistory as UcrContainer)
        : getDefaultContainer();
      formData.job.run.gpus = history.get("gpus") as number;
    }
  }
};

export default Parser;
