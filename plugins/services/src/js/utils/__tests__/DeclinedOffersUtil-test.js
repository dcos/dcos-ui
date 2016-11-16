jest.dontMock('../DeclinedOffersUtil');

const DeclinedOffersUtil = require('../DeclinedOffersUtil');
const QueueFixture = require('./fixtures/QueueFixture.json');

describe('DeclinedOffersUtil', function () {

  describe('#getSummaryFromQueue', function () {

    it('returns null when processedOffersSummary undefined', function () {
      expect(DeclinedOffersUtil.getSummaryFromQueue({})).toEqual(null);
    });

    it('returns null when unusedOffersCount is 0', function () {
      expect(DeclinedOffersUtil.getSummaryFromQueue({
        processedOffersSummary: 0
      })).toEqual(null);
    });

    it('returns null when lastUnusedOffers is undefined, null, or an empty array', function () {
      expect(DeclinedOffersUtil.getSummaryFromQueue({})).toEqual(null);
      expect(DeclinedOffersUtil.getSummaryFromQueue({
        lastUnusedOffers: null
      })).toEqual(null);
      expect(DeclinedOffersUtil.getSummaryFromQueue({
        lastUnusedOffers: []
      })).toEqual(null);
    });

    it('cascades matched offers from roles to subsequent offers', function () {
      const summary = DeclinedOffersUtil.getSummaryFromQueue({
        app: {},
        processedOffersSummary: {
          processedOffersCount: 10,
          unusedOffersCount: 1,
          rejectReason: {
            UnfulfilledRole: 1,
            UnfulfilledConstraint: 0,
            InsufficientCpus: 0,
            InsufficientMemory: 0,
            InsufficientDisk: 0,
            InsufficientPorts: 0
          }
        },
        lastUnusedOffers: [
          {
            foo: 'bar'
          }
        ]
      });

      expect(summary.role.matched).toEqual(9);
      expect(summary.constraint.offers).toEqual(9);
      expect(summary.constraint.matched).toEqual(9);
      expect(summary.cpu.offers).toEqual(9);
      expect(summary.cpu.matched).toEqual(9);
      expect(summary.mem.offers).toEqual(9);
      expect(summary.mem.matched).toEqual(9);
      expect(summary.disk.offers).toEqual(9);
      expect(summary.disk.matched).toEqual(9);
      expect(summary.ports.offers).toEqual(9);
      expect(summary.ports.matched).toEqual(9);
    });

    it('transforms the API response into the expected format', function () {
      const summary = DeclinedOffersUtil.getSummaryFromQueue(QueueFixture.queue[1]);

      expect(summary).toEqual({
        role: {
          requested: ['*'],
          offers: 100,
          matched: 90
        },
        constraint: {
          requested: [['hostname', 'UNIQUE']],
          offers: 90,
          matched: 80
        },
        cpu: {
          requested: 0.5,
          offers: 80,
          matched: 70
        },
        mem: {
          requested: 128,
          offers: 80,
          matched: 60
        },
        disk: {
          requested: 0,
          offers: 80,
          matched: 50
        },
        ports: {
          requested: [10010],
          offers: 80,
          matched: 40
        }
      });
    });
  });

  describe('#getOffersFromQueue', function () {

    it('returns null when lastUnusedOffers is undefined, null, or empty array', function () {
      expect(DeclinedOffersUtil.getOffersFromQueue({})).toEqual(null);
      expect(DeclinedOffersUtil.getOffersFromQueue({
        lastUnusedOffers: null
      })).toEqual(null);
      expect(DeclinedOffersUtil.getOffersFromQueue({
        lastUnusedOffers: []
      })).toEqual(null);
    });

    it('returns an array of offer details from API response', function () {
      const unusedOffers = DeclinedOffersUtil
        .getOffersFromQueue(QueueFixture.queue[1]);

      expect(unusedOffers).toEqual(
        [
          {
            hostname: '1.2.3.4',
            timestamp: '2016-02-28T16:41:41.090Z',
            unmatchedResource: ['InsufficientMemory']
          }
        ]
      );
    });

  });

});
