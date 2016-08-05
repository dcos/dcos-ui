jest.dontMock('../CRONValidatorUtil');

describe('CRONValidatorUtil', function () {
  var CRONValidatorUtil = require('../CRONValidatorUtil');

  describe('#testCronString', function () {

    it('should detect wrong number of components', function () {
      expect(CRONValidatorUtil.testCronString('*')).not.toBeNull();
      expect(CRONValidatorUtil.testCronString('* *')).not.toBeNull();
      expect(CRONValidatorUtil.testCronString('* * *')).not.toBeNull();
      expect(CRONValidatorUtil.testCronString('* * * *')).not.toBeNull();
      expect(CRONValidatorUtil.testCronString('* * * * * *')).not.toBeNull();
      expect(CRONValidatorUtil.testCronString('* * * * * * *')).not.toBeNull();
    });

    it('should detect invalid minute values', function () {
      expect(CRONValidatorUtil.testCronString('60 * * * *')).not.toBeNull();
      expect(CRONValidatorUtil.testCronString('-1 * * * *')).not.toBeNull();
      expect(CRONValidatorUtil.testCronString('*/60 * * * *')).not.toBeNull();
      expect(CRONValidatorUtil.testCronString('*/-1 * * * *')).not.toBeNull();
    });

    it('should detect invalid hour values', function () {
      expect(CRONValidatorUtil.testCronString('* 24 * * *')).not.toBeNull();
      expect(CRONValidatorUtil.testCronString('* -1 * * *')).not.toBeNull();
      expect(CRONValidatorUtil.testCronString('* */24 * * *')).not.toBeNull();
      expect(CRONValidatorUtil.testCronString('* */-1 * * *')).not.toBeNull();
    });

    it('should detect invalid date values', function () {
      expect(CRONValidatorUtil.testCronString('* * 32 * *')).not.toBeNull();
      expect(CRONValidatorUtil.testCronString('* * 0 * *')).not.toBeNull();
      expect(CRONValidatorUtil.testCronString('* * */32 * *')).not.toBeNull();
      expect(CRONValidatorUtil.testCronString('* * */0 * *')).not.toBeNull();
    });

    it('should detect invalid month values', function () {
      expect(CRONValidatorUtil.testCronString('* * * 13 *')).not.toBeNull();
      expect(CRONValidatorUtil.testCronString('* * * 0 *')).not.toBeNull();
      expect(CRONValidatorUtil.testCronString('* * * */13 *')).not.toBeNull();
      expect(CRONValidatorUtil.testCronString('* * * */0 *')).not.toBeNull();
    });

    it('should detect invalid weekday values', function () {
      expect(CRONValidatorUtil.testCronString('* * * * 7')).not.toBeNull();
      expect(CRONValidatorUtil.testCronString('* * * * -1')).not.toBeNull();
      expect(CRONValidatorUtil.testCronString('* * * * */7')).not.toBeNull();
      expect(CRONValidatorUtil.testCronString('* * * * */-1')).not.toBeNull();
    });

    it('should accept month aliases', function () {
      expect(CRONValidatorUtil.testCronString('* * * jan *')).toBeNull();
      expect(CRONValidatorUtil.testCronString('* * * feb *')).toBeNull();
      expect(CRONValidatorUtil.testCronString('* * * mar *')).toBeNull();
      expect(CRONValidatorUtil.testCronString('* * * apr *')).toBeNull();
      expect(CRONValidatorUtil.testCronString('* * * may *')).toBeNull();
      expect(CRONValidatorUtil.testCronString('* * * jun *')).toBeNull();
      expect(CRONValidatorUtil.testCronString('* * * jul *')).toBeNull();
      expect(CRONValidatorUtil.testCronString('* * * aug *')).toBeNull();
      expect(CRONValidatorUtil.testCronString('* * * sep *')).toBeNull();
      expect(CRONValidatorUtil.testCronString('* * * oct *')).toBeNull();
      expect(CRONValidatorUtil.testCronString('* * * nov *')).toBeNull();
      expect(CRONValidatorUtil.testCronString('* * * dec *')).toBeNull();
    });

    it('should accept weekday aliases', function () {
      expect(CRONValidatorUtil.testCronString('* * * * mon')).toBeNull();
      expect(CRONValidatorUtil.testCronString('* * * * tue')).toBeNull();
      expect(CRONValidatorUtil.testCronString('* * * * wed')).toBeNull();
      expect(CRONValidatorUtil.testCronString('* * * * thu')).toBeNull();
      expect(CRONValidatorUtil.testCronString('* * * * fri')).toBeNull();
      expect(CRONValidatorUtil.testCronString('* * * * sat')).toBeNull();
      expect(CRONValidatorUtil.testCronString('* * * * sun')).toBeNull();
    });

    it('should accept month ranges in correct order', function () {
      expect(CRONValidatorUtil.testCronString('* * * jan-feb,feb-mar,mar-apr,apr-may,may-jun,jun-jul,jul-aug,aug-sep,sep-oct,oct-nov,nov-dec *')).toBeNull();
    });

    it('should accept day ranges in correct order', function () {
      expect(CRONValidatorUtil.testCronString('* * * * mon-tue,tue-wed,wed-thu,thu-fri,fri-sat,sat-sun')).toBeNull();
    });

  });

  describe('#testCronComponent', function () {
    const SOME_DISCREET = ['a','b','c'];

    it('should validate against default wildcards', function () {
      expect(CRONValidatorUtil.testCronComponent('*', 1, 100, [])).toBeNull();
      expect(CRONValidatorUtil.testCronComponent('*/5', 1, 100, [])).toBeNull();
      expect(CRONValidatorUtil.testCronComponent('1/*', 1, 100, [])).not.toBeNull();
    });

    it('should disallow negative values', function () {
      expect(CRONValidatorUtil.testCronComponent('-1', 1, 100, [])).not.toBeNull();
      expect(CRONValidatorUtil.testCronComponent('1/-1', 1, 100, [])).not.toBeNull();
      expect(CRONValidatorUtil.testCronComponent('5,10,1-20,-5,12,20', 1, 100, [])).not.toBeNull();
      expect(CRONValidatorUtil.testCronComponent('1,6,-412', 1, 100, [])).not.toBeNull();
    });

    it('should validate against plain numeric ranges', function () {
      expect(CRONValidatorUtil.testCronComponent('1', 1, 100, [])).toBeNull();
      expect(CRONValidatorUtil.testCronComponent('50', 1, 100, [])).toBeNull();
      expect(CRONValidatorUtil.testCronComponent('100', 1, 100, [])).toBeNull();
      // Negative cases
      expect(CRONValidatorUtil.testCronComponent('0', 1, 100, [])).not.toBeNull();
      expect(CRONValidatorUtil.testCronComponent('-10', 1, 100, [])).not.toBeNull();
      expect(CRONValidatorUtil.testCronComponent('101', 1, 100, [])).not.toBeNull();
    });

    it('should validate against discreet values', function () {
      expect(CRONValidatorUtil.testCronComponent('a', 1, 100, SOME_DISCREET)).toBeNull();
      expect(CRONValidatorUtil.testCronComponent('b', 1, 100, SOME_DISCREET)).toBeNull();
      expect(CRONValidatorUtil.testCronComponent('c', 1, 100, SOME_DISCREET)).toBeNull();
      // Negative cases
      expect(CRONValidatorUtil.testCronComponent('d', 1, 100, SOME_DISCREET)).not.toBeNull();
      expect(CRONValidatorUtil.testCronComponent('e', 1, 100, SOME_DISCREET)).not.toBeNull();
      expect(CRONValidatorUtil.testCronComponent('f', 1, 100, SOME_DISCREET)).not.toBeNull();
    });

    it('should validate against mixed values', function () {
      expect(CRONValidatorUtil.testCronComponent('1', 1, 100, SOME_DISCREET)).toBeNull();
      expect(CRONValidatorUtil.testCronComponent('b', 1, 100, SOME_DISCREET)).toBeNull();
      expect(CRONValidatorUtil.testCronComponent('100', 1, 100, SOME_DISCREET)).toBeNull();
      // Negative cases
      expect(CRONValidatorUtil.testCronComponent('d', 1, 100, SOME_DISCREET)).not.toBeNull();
      expect(CRONValidatorUtil.testCronComponent('0', 1, 100, SOME_DISCREET)).not.toBeNull();
      expect(CRONValidatorUtil.testCronComponent('f', 1, 100, SOME_DISCREET)).not.toBeNull();
    });

    it('should validate continuous and discreet values in comma list', function () {
      expect(CRONValidatorUtil.testCronComponent('1', 1, 100, SOME_DISCREET)).toBeNull();
      expect(CRONValidatorUtil.testCronComponent('1,50', 1, 100, SOME_DISCREET)).toBeNull();
      expect(CRONValidatorUtil.testCronComponent('1,50,100', 1, 100, SOME_DISCREET)).toBeNull();
      expect(CRONValidatorUtil.testCronComponent('1,50,100,a', 1, 100, SOME_DISCREET)).toBeNull();
      expect(CRONValidatorUtil.testCronComponent('1,50,100,a,b,c', 1, 100, SOME_DISCREET)).toBeNull();
      expect(CRONValidatorUtil.testCronComponent('a,1,50,100,b', 1, 100, SOME_DISCREET)).toBeNull();
      expect(CRONValidatorUtil.testCronComponent('a,1,b,50,c,100', 1, 100, SOME_DISCREET)).toBeNull();
      expect(CRONValidatorUtil.testCronComponent('a,b,c', 1, 100, SOME_DISCREET)).toBeNull();
      // Negative cases
      expect(CRONValidatorUtil.testCronComponent('1,0', 1, 100, SOME_DISCREET)).not.toBeNull();
      expect(CRONValidatorUtil.testCronComponent('1,50,101', 1, 100, SOME_DISCREET)).not.toBeNull();
      expect(CRONValidatorUtil.testCronComponent('1,d,100', 1, 100, SOME_DISCREET)).not.toBeNull();
      expect(CRONValidatorUtil.testCronComponent('a,b,d', 1, 100, SOME_DISCREET)).not.toBeNull();
    });

    it('should validate continuous and discreet values in ranges', function () {
      expect(CRONValidatorUtil.testCronComponent('1-10', 1, 100, SOME_DISCREET)).toBeNull();
      expect(CRONValidatorUtil.testCronComponent('20-90', 1, 100, SOME_DISCREET)).toBeNull();
      expect(CRONValidatorUtil.testCronComponent('50-100', 1, 100, SOME_DISCREET)).toBeNull();
      expect(CRONValidatorUtil.testCronComponent('1-100', 1, 100, SOME_DISCREET)).toBeNull();
      expect(CRONValidatorUtil.testCronComponent('a-b', 1, 100, SOME_DISCREET)).toBeNull();
      expect(CRONValidatorUtil.testCronComponent('a-c', 1, 100, SOME_DISCREET)).toBeNull();
      expect(CRONValidatorUtil.testCronComponent('b-c', 1, 100, SOME_DISCREET)).toBeNull();
      // Negative cases
      expect(CRONValidatorUtil.testCronComponent('10-1', 1, 100, SOME_DISCREET)).not.toBeNull();
      expect(CRONValidatorUtil.testCronComponent('0-10', 1, 100, SOME_DISCREET)).not.toBeNull();
      expect(CRONValidatorUtil.testCronComponent('50-101', 1, 100, SOME_DISCREET)).not.toBeNull();
      expect(CRONValidatorUtil.testCronComponent('a-d', 1, 100, SOME_DISCREET)).not.toBeNull();
      expect(CRONValidatorUtil.testCronComponent('b-a', 1, 100, SOME_DISCREET)).not.toBeNull();
    });

    it('should validate combinations of lists and ranges', function () {
      expect(CRONValidatorUtil.testCronComponent('1-2,3-4,50-100,5,10', 1, 100, SOME_DISCREET)).toBeNull();
      expect(CRONValidatorUtil.testCronComponent('1-20,b,30-40,a-c', 1, 100, SOME_DISCREET)).toBeNull();
      // Negative cases
      expect(CRONValidatorUtil.testCronComponent('0,1-20', 1, 100, SOME_DISCREET)).not.toBeNull();
      expect(CRONValidatorUtil.testCronComponent('1,2-20,30,d', 1, 100, SOME_DISCREET)).not.toBeNull();
      expect(CRONValidatorUtil.testCronComponent('1,2-20,a-d', 1, 100, SOME_DISCREET)).not.toBeNull();
    });

    it('should catch invalid range definitions', function () {
      expect(CRONValidatorUtil.testCronComponent('-1-10', 1, 100, SOME_DISCREET)).not.toBeNull();
      expect(CRONValidatorUtil.testCronComponent('5-', 1, 100, SOME_DISCREET)).not.toBeNull();
      expect(CRONValidatorUtil.testCronComponent('1,2,1-10,-1-10,2', 1, 100, SOME_DISCREET)).not.toBeNull();
    });

  });
});
