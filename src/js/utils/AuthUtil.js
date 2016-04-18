const AuthUtil = {
  isSubjectRemote(subject) {
    return typeof subject.isRemote === 'function' && subject.isRemote();
  }
};

module.exports = AuthUtil;
