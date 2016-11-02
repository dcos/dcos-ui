import {simpleParser} from '../../../../../src/js/utils/ParserUtil';

module.exports = [
  simpleParser(['id']),
  simpleParser(['cpus']),
  simpleParser(['mem']),
  simpleParser(['disk']),
  simpleParser(['instances']),
  simpleParser(['cmd'])
];
