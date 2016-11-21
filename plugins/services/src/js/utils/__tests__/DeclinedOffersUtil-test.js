jest.dontMock('../DeclinedOffersUtil');

const DeclinedOffersUtil = require('../DeclinedOffersUtil');

describe('DeclinedOffersUtil', function () {

  describe('#getSummaryFromQueue', function () {

    it('returns null when processedOffersSummary undefined', function () {
      expect(DeclinedOffersUtil.getSummaryFromQueue({})).toEqual(null);
    });

    it('returns null when unusedOffersCount is 0', function () {
      expect(DeclinedOffersUtil.getSummaryFromQueue({
        processedOffersSummary: {
          unusedOffersCount: 0
        }
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

    it('transforms the API response into the expected format', function () {
      const summary = DeclinedOffersUtil.getSummaryFromQueue({
        app: {
          acceptedRole: ['*'],
          constraints: [['hostname', 'UNIQUE']],
          cpus: 0.5,
          mem: 128,
          disk: 0,
          ports: [10010]
        },
        processedOffersSummary: {
          processedOffersCount: 10,
          unusedOffersCount: 1,
          rejectSummaryLastOffers: [
            {
              reason: 'UnfulfilledRole',
              declined: 0,
              processed: 123
            },
            {
              reason: 'UnfulfilledConstraint',
              declined: 0,
              processed: 123
            },
            {
              reason: 'NoCorrespondingReservationFound',
              declined: 0,
              processed: 123
            },
            {
              reason: 'InsufficientCpus',
              declined: 75,
              processed: 123
            },
            {
              reason: 'InsufficientMemory',
              declined: 15,
              processed: 48
            },
            {
              reason: 'InsufficientDisk',
              declined: 10,
              processed: 33
            },
            {
              reason: 'InsufficientGpus',
              declined: 0,
              processed: 23
            },
            {
              reason: 'InsufficientPorts',
              declined: 23,
              processed: 23
            }
          ]
        },
        lastUnusedOffers: [
          {
            foo: 'bar'
          }
        ]
      });

      expect(summary).toEqual({
        role: {
          requested: ['*'],
          offers: 123,
          matched: 123
        },
        constraint: {
          requested: [['hostname', 'UNIQUE']],
          offers: 123,
          matched: 123
        },
        cpu: {
          requested: 0.5,
          offers: 123,
          matched: 48
        },
        mem: {
          requested: 128,
          offers: 48,
          matched: 33
        },
        disk: {
          requested: 0,
          offers: 33,
          matched: 23
        },
        ports: {
          requested: [10010],
          offers: 23,
          matched: 0
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
      const unusedOffers = DeclinedOffersUtil.getOffersFromQueue({
        lastUnusedOffers: [
          {
            offer: {
              id: 'offer_123',
              agentId: 'slave_123',
              hostname: '1.2.3.4',
              resources: [
                {
                  name: 'cpus',
                  scalar: 23,
                  ranges: [
                    {
                      begin: 1,
                      end: 5
                    }
                  ],
                  set: [
                    'a',
                    'b'
                  ],
                  role: '*'
                }
              ],
              attributes: [
                {
                  name: 'foo',
                  scalar: 23,
                  ranges: [
                    {
                      begin: 1,
                      end: 5
                    }
                  ],
                  set: [
                    'a',
                    'b'
                  ]
                }
              ]
            },
            timestamp: '2016-02-28T16:41:41.090Z',
            reason: [
              'InsufficientMemory'
            ]
          }
        ]
      });

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
