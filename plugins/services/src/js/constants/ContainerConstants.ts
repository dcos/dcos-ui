import { i18nMark } from "@lingui/react";

export default {
  type: {
    MESOS: "MESOS",
    DOCKER: "DOCKER"
  },
  labelMap: {
    DOCKER: i18nMark("Docker Engine"),
    MESOS: i18nMark("Universal Container Runtime (UCR)")
  }
};
