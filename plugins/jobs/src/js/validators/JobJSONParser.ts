import { JobFormUIData } from "./JobFormData";
import { DefaultContainer } from "./DefaultFormData";

export default {
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
  cmdOnly: (value: "true" | "false", formData: JobFormUIData) => {
    if (value === "true") {
      formData.cmdOnly = true;
      delete formData.job.run.ucr;
      delete formData.job.run.docker;
      delete formData.job.run.gpus;
    }
    if (value === "false") {
      formData.cmdOnly = false;
      formData.job.run.ucr = DefaultContainer;
    }
  }
};
