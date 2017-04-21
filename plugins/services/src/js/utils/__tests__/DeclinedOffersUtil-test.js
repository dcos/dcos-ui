jest.dontMock("../DeclinedOffersUtil");
jest.dontMock("../../structs/Application");
jest.dontMock("../../structs/ServiceTree");

const DeclinedOffersUtil = require("../DeclinedOffersUtil");

describe("DeclinedOffersUtil", function() {
  describe("#getSummaryFromQueue", function() {
    it("returns null when processedOffersSummary undefined", function() {
      expect(DeclinedOffersUtil.getSummaryFromQueue({})).toEqual(null);
    });

    it("returns null when unusedOffersCount is 0", function() {
      expect(
        DeclinedOffersUtil.getSummaryFromQueue({
          processedOffersSummary: {
            unusedOffersCount: 0
          }
        })
      ).toEqual(null);
    });

    it("transforms the API response into the expected format for a service", function() {
      const summary = DeclinedOffersUtil.getSummaryFromQueue({
        app: {
          cpus: 0.5,
          mem: 128,
          disk: 0,
          ports: [10010],
          constraints: [["hostname", "UNIQUE"]],
          acceptedResourceRoles: ["*"]
        },
        processedOffersSummary: {
          processedOffersCount: 10,
          unusedOffersCount: 1,
          rejectSummaryLastOffers: [
            {
              reason: "UnfulfilledRole",
              declined: 0,
              processed: 123
            },
            {
              reason: "UnfulfilledConstraint",
              declined: 0,
              processed: 123
            },
            {
              reason: "NoCorrespondingReservationFound",
              declined: 0,
              processed: 123
            },
            {
              reason: "InsufficientCpus",
              declined: 75,
              processed: 123
            },
            {
              reason: "InsufficientMemory",
              declined: 15,
              processed: 48
            },
            {
              reason: "InsufficientDisk",
              declined: 10,
              processed: 33
            },
            {
              reason: "InsufficientGpus",
              declined: 0,
              processed: 23
            },
            {
              reason: "InsufficientPorts",
              declined: 23,
              processed: 23
            }
          ]
        },
        lastUnusedOffers: [
          {
            foo: "bar"
          }
        ]
      });

      expect(summary).toEqual({
        roles: {
          requested: "*",
          offers: 123,
          matched: 123
        },
        constraints: {
          requested: "hostname:UNIQUE",
          offers: 123,
          matched: 123
        },
        cpus: {
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
          requested: "10010",
          offers: 23,
          matched: 0
        }
      });
    });

    it("transforms the API response into the expected format for pods", function() {
      const summary = DeclinedOffersUtil.getSummaryFromQueue({
        pod: {
          containers: [
            {
              resources: {
                cpus: 1,
                mem: 100,
                disk: 200,
                ports: [100]
              }
            },
            {
              resources: {
                cpus: 2,
                mem: 200,
                disk: 400,
                ports: [200, 300]
              }
            },
            {
              resources: {
                cpus: 3,
                mem: 300,
                disk: 600,
                ports: [400, 500]
              }
            }
          ],
          scheduling: {
            placement: {
              acceptedResourceRoles: ["foo", "bar"],
              constraints: [
                { fieldName: "hostname", operator: "LIKE", value: "hostname" },
                { fieldName: "hostname", operator: "UNIQUE" }
              ]
            }
          }
        },
        processedOffersSummary: {
          processedOffersCount: 10,
          unusedOffersCount: 1,
          rejectSummaryLastOffers: [
            {
              reason: "UnfulfilledRole",
              declined: 0,
              processed: 123
            },
            {
              reason: "UnfulfilledConstraint",
              declined: 0,
              processed: 123
            },
            {
              reason: "NoCorrespondingReservationFound",
              declined: 0,
              processed: 123
            },
            {
              reason: "InsufficientCpus",
              declined: 75,
              processed: 123
            },
            {
              reason: "InsufficientMemory",
              declined: 15,
              processed: 48
            },
            {
              reason: "InsufficientDisk",
              declined: 10,
              processed: 33
            },
            {
              reason: "InsufficientGpus",
              declined: 0,
              processed: 23
            },
            {
              reason: "InsufficientPorts",
              declined: 23,
              processed: 23
            }
          ]
        },
        lastUnusedOffers: [
          {
            foo: "bar"
          }
        ]
      });

      expect(summary).toEqual({
        roles: {
          requested: "foo, bar",
          offers: 123,
          matched: 123
        },
        constraints: {
          requested: "hostname:LIKE:hostname, hostname:UNIQUE",
          offers: 123,
          matched: 123
        },
        cpus: {
          requested: 6,
          offers: 123,
          matched: 48
        },
        mem: {
          requested: 600,
          offers: 48,
          matched: 33
        },
        disk: {
          requested: 1200,
          offers: 33,
          matched: 23
        },
        ports: {
          requested: "100, 200, 300, 400, 500",
          offers: 23,
          matched: 0
        }
      });
    });

    it("adds executorResources to a pod's requested resources", function() {
      const summary = DeclinedOffersUtil.getSummaryFromQueue({
        pod: {
          containers: [
            {
              resources: {
                cpus: 1,
                mem: 100,
                disk: 200,
                ports: [100]
              }
            },
            {
              resources: {
                cpus: 2,
                mem: 200,
                disk: 400,
                ports: [200, 300]
              }
            },
            {
              resources: {
                cpus: 3,
                mem: 300,
                disk: 600,
                ports: [400, 500]
              }
            }
          ],
          scheduling: {
            placement: {
              acceptedResourceRoles: ["foo", "bar"],
              constraints: [
                ["foo.constraint.1", "foo.constraint.2", "foo.constraint.3"]
              ]
            }
          },
          executorResources: {
            cpus: 10,
            mem: 20,
            disk: 30
          }
        },
        processedOffersSummary: {
          processedOffersCount: 10,
          unusedOffersCount: 1,
          rejectSummaryLastOffers: [
            {
              reason: "UnfulfilledRole",
              declined: 0,
              processed: 123
            },
            {
              reason: "UnfulfilledConstraint",
              declined: 0,
              processed: 123
            },
            {
              reason: "NoCorrespondingReservationFound",
              declined: 0,
              processed: 123
            },
            {
              reason: "InsufficientCpus",
              declined: 75,
              processed: 123
            },
            {
              reason: "InsufficientMemory",
              declined: 15,
              processed: 48
            },
            {
              reason: "InsufficientDisk",
              declined: 10,
              processed: 33
            },
            {
              reason: "InsufficientGpus",
              declined: 0,
              processed: 23
            },
            {
              reason: "InsufficientPorts",
              declined: 23,
              processed: 23
            }
          ]
        },
        lastUnusedOffers: [
          {
            foo: "bar"
          }
        ]
      });

      expect(summary).toEqual({
        roles: {
          requested: "foo, bar",
          offers: 123,
          matched: 123
        },
        constraints: {
          requested: "foo.constraint.1:foo.constraint.2:foo.constraint.3",
          offers: 123,
          matched: 123
        },
        cpus: {
          requested: 16,
          offers: 123,
          matched: 48
        },
        mem: {
          requested: 620,
          offers: 48,
          matched: 33
        },
        disk: {
          requested: 1230,
          offers: 33,
          matched: 23
        },
        ports: {
          requested: "100, 200, 300, 400, 500",
          offers: 23,
          matched: 0
        }
      });
    });
  });

  describe("#getOffersFromQueue", function() {
    it("returns null when lastUnusedOffers is undefined or empty array", function() {
      expect(DeclinedOffersUtil.getOffersFromQueue({})).toEqual(null);
      expect(
        DeclinedOffersUtil.getOffersFromQueue({
          lastUnusedOffers: []
        })
      ).toEqual(null);
    });

    it("returns an array of offer details from API response", function() {
      const unusedOffers = DeclinedOffersUtil.getOffersFromQueue({
        lastUnusedOffers: [
          {
            offer: {
              id: "offer_123",
              agentId: "slave_123",
              hostname: "1.2.3.4",
              resources: [
                {
                  name: "cpus",
                  scalar: 23,
                  ranges: [
                    {
                      begin: 1,
                      end: 5
                    }
                  ],
                  set: ["a", "b"],
                  role: "*"
                }
              ],
              attributes: [
                {
                  name: "foo",
                  scalar: 23,
                  ranges: [
                    {
                      begin: 1,
                      end: 5
                    }
                  ],
                  set: ["a", "b"]
                }
              ]
            },
            timestamp: "2016-02-28T16:41:41.090Z",
            reason: ["InsufficientMemory"]
          }
        ]
      });

      expect(unusedOffers).toEqual([
        {
          hostname: "1.2.3.4",
          timestamp: "2016-02-28T16:41:41.090Z",
          unmatchedResource: ["InsufficientMemory"],
          offered: {
            constraints: "foo:1 – 5",
            cpus: 23,
            roles: ["*"]
          }
        }
      ]);
    });
  });
});
