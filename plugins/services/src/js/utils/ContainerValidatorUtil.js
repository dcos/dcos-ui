const ContainerValidatorUtil = {
  isValidDockerImage(dockerImage) {
    if (typeof dockerImage !== "string" || dockerImage === "") {
      return false;
    }

    // The pattern is based on Dockers `validContainerName` regexp:
    // https://github.com/docker/docker/blob/f63cdf0260/runtime.go#L33
    return /^[a-zA-Z0-9_\-/:.]+$/.test(dockerImage);
  }
};

module.exports = ContainerValidatorUtil;
