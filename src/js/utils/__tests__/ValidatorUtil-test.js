jest.dontMock('../ValidatorUtil');

describe('ValidatorUtil', function () {
  var ValidatorUtil = require('../ValidatorUtil');

  describe('#isEmail', function () {

    // RFC822 email address validator
    // http://sphinx.mythic-beasts.com/~pdw/cgi-bin/emailvalidate?address=

    it('should have at least an username, an @ and one peroid', function () {
      expect(ValidatorUtil.isEmail('user@foo.bar')).toBe(true);
      expect(ValidatorUtil.isEmail('Abc.123@example.com')).toBe(true);
      expect(
        ValidatorUtil.isEmail('!#$%&\'*+-/=?^_`.{|}~@example.com')
      ).toBe(true);
      expect(ValidatorUtil.isEmail('"Abc@def"@example.com')).toBe(true);
      expect(
        ValidatorUtil.isEmail('user+mailbox/department=shipping@example.com')
      ).toBe(true);
      expect(ValidatorUtil.isEmail('"Joe.\\Blow"@example.com')).toBe(true);
    });

    it('should have an @', function () {
      expect(ValidatorUtil.isEmail('foobar')).toBe(false);
      expect(ValidatorUtil.isEmail('userfoo.bar')).toBe(false);
    });

    it('should have an username', function () {
      expect(ValidatorUtil.isEmail('@foo.bar')).toBe(false);
      expect(ValidatorUtil.isEmail('user@foo.bar')).toBe(true);
    });

    it('should have at least one peroid after @', function () {
      expect(ValidatorUtil.isEmail('user@foobar')).toBe(false);
      expect(ValidatorUtil.isEmail('Abc.123@examplecom')).toBe(false);
      expect(ValidatorUtil.isEmail('user@foo.bar')).toBe(true);
      expect(ValidatorUtil.isEmail('user@baz.foo.bar')).toBe(true);
    });

    it('should treat IDN emails as valid', function () {
      expect(ValidatorUtil.isEmail('伊昭傑@郵件.商務')).toBe(true);
      expect(ValidatorUtil.isEmail('θσερ@εχαμπλε.ψομ')).toBe(true);
      expect(ValidatorUtil.isEmail('test@könig.de')).toBe(true);
      expect(ValidatorUtil.isEmail('伊昭傑郵件.商務')).toBe(false);
      expect(ValidatorUtil.isEmail('θσερ@εχαμπλεψομ')).toBe(false);
      expect(ValidatorUtil.isEmail('@könig.de')).toBe(false);
    });

    it('should treat long unknown TLDs as valid', function () {
      expect(ValidatorUtil.isEmail('user@foobar.hamburg')).toBe(true);
      expect(ValidatorUtil.isEmail('user@foobar.københavn')).toBe(true);
      expect(
        ValidatorUtil.isEmail(
          'test@asdf.com.asd.fasd.f.asdf.asd.fa.xn--sdf-x68do18h'
        )
      ).toBe(true);
    });

    it('shouldn\'t have whitespaces', function () {
      expect(ValidatorUtil.isEmail('"Fred Bloggs"@example.com')).toBe(false);
      expect(ValidatorUtil.isEmail('user@f o o.om')).toBe(false);
      expect(ValidatorUtil.isEmail('  user  @foo.com')).toBe(false);
    });

  });

  describe('#hasNoWhitespaces', function () {

    it('detects white spaces', function () {
      expect(ValidatorUtil.hasNoWhitespaces('has white spaces')).toBe(false);
    });

    it('does not create false positives', function () {
      expect(ValidatorUtil.hasNoWhitespaces('notempty')).toBe(true);
    });

    it('detects white spaces in any position', function () {
      expect(ValidatorUtil.hasNoWhitespaces(' has  spaces ')).toBe(false);
    });

  });

  describe('#isValidServiceId', function () {

    it('detects valid characters', function () {
      expect(ValidatorUtil.hasValidServiceIdChars('./app-1.b')).toBe(true);
    });

    it('detects disallowed characters', function () {
      expect(ValidatorUtil.hasValidServiceIdChars('Uppercase')).toBe(false);
      expect(ValidatorUtil.hasValidServiceIdChars('app#1')).toBe(false);
      expect(ValidatorUtil.hasValidServiceIdChars('app_1')).toBe(false);
      expect(ValidatorUtil.hasValidServiceIdChars('+1')).toBe(false);
    });

  });

  describe('#isWellFormedServiceIdPath', function () {

    it('has well-formed path', function () {
      expect(ValidatorUtil.isWellFormedServiceIdPath('app.1')).toBe(true);
      expect(ValidatorUtil.isWellFormedServiceIdPath('/app.1')).toBe(true);
      expect(ValidatorUtil.isWellFormedServiceIdPath('/app.1/app-2'))
        .toBe(true);
      expect(ValidatorUtil.isWellFormedServiceIdPath('/app.1/app-2/'))
        .toBe(true);

      expect(ValidatorUtil.isWellFormedServiceIdPath('.')).toBe(true);
      expect(ValidatorUtil.isWellFormedServiceIdPath('..')).toBe(true);
      expect(ValidatorUtil.isWellFormedServiceIdPath('../')).toBe(true);
      expect(ValidatorUtil.isWellFormedServiceIdPath('app-1/..')).toBe(true);
      expect(ValidatorUtil.isWellFormedServiceIdPath('app-1/.')).toBe(true);
      expect(ValidatorUtil.isWellFormedServiceIdPath('./app-1/../app-1a/'))
        .toBe(true);
      expect(ValidatorUtil.isWellFormedServiceIdPath('../app-1/./app-1a'))
        .toBe(true);
      expect(ValidatorUtil.isWellFormedServiceIdPath('/app-1/.')).toBe(true);
    });

    it('has non-well-formed path', function () {
      expect(ValidatorUtil.isWellFormedServiceIdPath('App1')).toBe(false);
      expect(ValidatorUtil.isWellFormedServiceIdPath('-app.1')).toBe(false);
      expect(ValidatorUtil.isWellFormedServiceIdPath('app.1-')).toBe(false);
      expect(ValidatorUtil.isWellFormedServiceIdPath('/-app.1')).toBe(false);
      expect(ValidatorUtil.isWellFormedServiceIdPath('app......1')).toBe(false);
      expect(ValidatorUtil.isWellFormedServiceIdPath('/app-1.')).toBe(false);
      expect(ValidatorUtil.isWellFormedServiceIdPath('app-1..')).toBe(false);
      expect(ValidatorUtil.isWellFormedServiceIdPath('.app-1')).toBe(false);
      expect(ValidatorUtil.isWellFormedServiceIdPath('..app-1/')).toBe(false);
      expect(ValidatorUtil.isWellFormedServiceIdPath('..../app-1')).toBe(false);
      expect(ValidatorUtil.isWellFormedServiceIdPath('./app-1../app-1a/'))
        .toBe(false);
      expect(ValidatorUtil.isWellFormedServiceIdPath('/app-1/........'))
        .toBe(false);
    });
  });
});
