const AuthUtil = {
  isSubjectRemote(subject) {
    return typeof subject.isRemote === "function" && subject.isRemote();
  },
};

export default AuthUtil;
