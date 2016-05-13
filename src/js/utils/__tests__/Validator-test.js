jest.dontMock('../Validator');

describe('Validator', function () {
  var Validator = require('../Validator');

  describe('#isEmail', function () {

    // RFC822 email address validator
    // http://sphinx.mythic-beasts.com/~pdw/cgi-bin/emailvalidate?address=

    it('should have at least an username, an @ and one peroid', function () {
      expect(Validator.isEmail('user@foo.bar')).toBe(true);
      expect(Validator.isEmail('Abc.123@example.com')).toBe(true);
      expect(Validator.isEmail('!#$%&\'*+-/=?^_`.{|}~@example.com')).toBe(true);
      expect(Validator.isEmail('"Abc@def"@example.com')).toBe(true);
      expect(Validator.isEmail('user+mailbox/department=shipping@example.com')).toBe(true);
      expect(Validator.isEmail('"Joe.\Blow"@example.com')).toBe(true);
    });

    it('should have an @', function () {
      expect(Validator.isEmail('foobar')).toBe(false);
      expect(Validator.isEmail('userfoo.bar')).toBe(false);
    });

    it('should have an username', function () {
      expect(Validator.isEmail('@foo.bar')).toBe(false);
      expect(Validator.isEmail('user@foo.bar')).toBe(true);
    });

    it('should have at least one peroid after @', function () {
      expect(Validator.isEmail('user@foobar')).toBe(false);
      expect(Validator.isEmail('Abc.123@examplecom')).toBe(false);
      expect(Validator.isEmail('user@foo.bar')).toBe(true);
      expect(Validator.isEmail('user@baz.foo.bar')).toBe(true);
    });

    it('should treat IDN emails as valid', function () {
      expect(Validator.isEmail('伊昭傑@郵件.商務')).toBe(true);
      expect(Validator.isEmail('θσερ@εχαμπλε.ψομ')).toBe(true);
      expect(Validator.isEmail('test@könig.de')).toBe(true);

      expect(Validator.isEmail('伊昭傑郵件.商務')).toBe(false);
      expect(Validator.isEmail('θσερ@εχαμπλεψομ')).toBe(false);
      expect(Validator.isEmail('@könig.de')).toBe(false);
    });

    it('should treat long unknown TLDs as valid', function () {
      expect(Validator.isEmail('user@foobar.hamburg')).toBe(true);
      expect(Validator.isEmail('user@foobar.københavn')).toBe(true);
      expect(Validator.isEmail('test@asdf.com.asd.fasd.f.asdf.asd.fa.xn--sdf-x68do18h')).toBe(true);
    });

    it('shouldn\'t have whitespaces', function () {
      expect(Validator.isEmail('"Fred Bloggs"@example.com')).toBe(false);
      expect(Validator.isEmail('user@f o o.om')).toBe(false);
      expect(Validator.isEmail('  user  @foo.com')).toBe(false);
    });

  });

  describe('#hasNoWhitespaces', function () {

    it('detects white spaces', function () {
      expect(Validator.hasNoWhitespaces('has white spaces')).toBe(false);
    });

    it('does not create false positives', function () {
      expect(Validator.hasNoWhitespaces('notempty')).toBe(true);
    });

    it('detects white spaces in any position', function () {
      expect(Validator.hasNoWhitespaces(' has  spaces ')).toBe(false);
    });

  });

  describe('#isValidServiceId', function () {

    it('detects valid characters', function () {
      expect(Validator.hasValidServiceIdChars('./app-1.b')).toBe(true);
    });

    it('detects disallowed characters', function () {
      expect(Validator.hasValidServiceIdChars('Uppercase')).toBe(false);
      expect(Validator.hasValidServiceIdChars('app#1')).toBe(false);
      expect(Validator.hasValidServiceIdChars('app_1')).toBe(false);
      expect(Validator.hasValidServiceIdChars('+1')).toBe(false);
    });

  });

  describe('#isWellFormedServiceIdPath', function () {

    it('has well-formed path', function () {
      expect(Validator.isWellFormedServiceIdPath('app.1')).toBe(true);
      expect(Validator.isWellFormedServiceIdPath('/app.1')).toBe(true);
      expect(Validator.isWellFormedServiceIdPath('/app.1/app-2')).toBe(true);
      expect(Validator.isWellFormedServiceIdPath('/app.1/app-2/')).toBe(true);

      expect(Validator.isWellFormedServiceIdPath('.')).toBe(true);
      expect(Validator.isWellFormedServiceIdPath('..')).toBe(true);
      expect(Validator.isWellFormedServiceIdPath('../')).toBe(true);
      expect(Validator.isWellFormedServiceIdPath('app-1/..')).toBe(true);
      expect(Validator.isWellFormedServiceIdPath('app-1/.')).toBe(true);
      expect(Validator.isWellFormedServiceIdPath('./app-1/../app-1a/'))
        .toBe(true);
      expect(Validator.isWellFormedServiceIdPath('../app-1/./app-1a'))
        .toBe(true);
      expect(Validator.isWellFormedServiceIdPath('/app-1/.')).toBe(true);
    });

    it('has non-well-formed path', function () {
      expect(Validator.isWellFormedServiceIdPath('App1')).toBe(false);
      expect(Validator.isWellFormedServiceIdPath('-app.1')).toBe(false);
      expect(Validator.isWellFormedServiceIdPath('app.1-')).toBe(false);
      expect(Validator.isWellFormedServiceIdPath('/-app.1')).toBe(false);
      expect(Validator.isWellFormedServiceIdPath('app......1')).toBe(false);
      expect(Validator.isWellFormedServiceIdPath('/app-1.')).toBe(false);
      expect(Validator.isWellFormedServiceIdPath('app-1..')).toBe(false);
      expect(Validator.isWellFormedServiceIdPath('.app-1')).toBe(false);
      expect(Validator.isWellFormedServiceIdPath('..app-1/')).toBe(false);
      expect(Validator.isWellFormedServiceIdPath('..../app-1')).toBe(false);
      expect(Validator.isWellFormedServiceIdPath('./app-1../app-1a/'))
        .toBe(false);
      expect(Validator.isWellFormedServiceIdPath('/app-1/........'))
        .toBe(false);
    });
  });
});
