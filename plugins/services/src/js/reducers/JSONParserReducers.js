import ParserUtil from '../../../../../src/js/utils/ParserUtil';

module.exports = [
  ParserUtil.simpleParser(['id']),
  ParserUtil.simpleParser(['cpus']),
  ParserUtil.simpleParser(['mem']),
  ParserUtil.simpleParser(['disk']),
  ParserUtil.simpleParser(['instances']),
  ParserUtil.simpleParser(['cmd'])
];
