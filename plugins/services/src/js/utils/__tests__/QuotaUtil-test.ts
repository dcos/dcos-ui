import * as QuotaUtil from "../QuotaUtil";
import {
  ServiceGroup,
  ServiceGroupQuota,
  ServiceGroupQuotaRoles
} from "#PLUGINS/services/src/js/types/ServiceGroup";
import { MesosRole } from "#PLUGINS/services/src/js/types/MesosRoles";

describe("QuotaUtil", () => {
  describe("#quotaHasLimit", () => {
    it("returns false if quota is null", () => {
      expect(QuotaUtil.quotaHasLimit(null)).toEqual(false);
    });
    it("returns false if quota is undefined", () => {
      expect(QuotaUtil.quotaHasLimit(undefined)).toEqual(false);
    });
    it("returns true if cpu limit set", () => {
      const value: ServiceGroupQuota = {
        enforced: false,
        limitStatus: "N/A",
        cpus: {
          limit: 1
        }
      };
      expect(QuotaUtil.quotaHasLimit(value)).toEqual(true);
    });
    it("returns true if memory limit set", () => {
      const value: ServiceGroupQuota = {
        enforced: false,
        limitStatus: "N/A",
        memory: {
          limit: 1
        }
      };
      expect(QuotaUtil.quotaHasLimit(value)).toEqual(true);
    });
    it("returns true if disk limit set", () => {
      const value: ServiceGroupQuota = {
        enforced: false,
        limitStatus: "N/A",
        disk: {
          limit: 1
        }
      };
      expect(QuotaUtil.quotaHasLimit(value)).toEqual(true);
    });
    it("returns true if gpus limit set", () => {
      const value: ServiceGroupQuota = {
        enforced: false,
        limitStatus: "N/A",
        gpus: {
          limit: 1
        }
      };
      expect(QuotaUtil.quotaHasLimit(value)).toEqual(true);
    });
    it("returns false if no limits set", () => {
      const value: ServiceGroupQuota = {
        enforced: false,
        limitStatus: "N/A",
        cpus: {
          guarantee: 1
        },
        memory: {
          guarantee: 1
        },
        disk: {
          guarantee: 1
        },
        gpus: {
          guarantee: 1
        }
      };
      expect(QuotaUtil.quotaHasLimit(value)).toEqual(false);
    });
  });

  describe("#groupHasQuotaLimit", () => {
    it("returns false if quota is null", () => {
      const value: ServiceGroup = {
        id: "/unit-test",
        name: "unit-test",
        quota: null
      };
      expect(QuotaUtil.groupHasQuotaLimit(value)).toEqual(false);
    });
    it("returns false if quota is undefined", () => {
      const value: ServiceGroup = {
        id: "/unit-test",
        name: "unit-test"
      };
      expect(QuotaUtil.groupHasQuotaLimit(value)).toEqual(false);
    });
    it("returns true if cpu limit set", () => {
      const value: ServiceGroup = {
        id: "/unit-test",
        name: "unit-test",
        quota: {
          enforced: false,
          limitStatus: "N/A",
          cpus: {
            limit: 1
          }
        }
      };
      expect(QuotaUtil.groupHasQuotaLimit(value)).toEqual(true);
    });
    it("returns true if memory limit set", () => {
      const value: ServiceGroup = {
        id: "/unit-test",
        name: "unit-test",
        quota: {
          enforced: false,
          limitStatus: "N/A",
          memory: {
            limit: 1
          }
        }
      };
      expect(QuotaUtil.groupHasQuotaLimit(value)).toEqual(true);
    });
    it("returns true if disk limit set", () => {
      const value: ServiceGroup = {
        id: "/unit-test",
        name: "unit-test",
        quota: {
          enforced: false,
          limitStatus: "N/A",
          disk: {
            limit: 1
          }
        }
      };
      expect(QuotaUtil.groupHasQuotaLimit(value)).toEqual(true);
    });
    it("returns true if gpus limit set", () => {
      const value: ServiceGroup = {
        id: "/unit-test",
        name: "unit-test",
        quota: {
          enforced: false,
          limitStatus: "N/A",
          gpus: {
            limit: 1
          }
        }
      };
      expect(QuotaUtil.groupHasQuotaLimit(value)).toEqual(true);
    });
    it("returns false if no limits set", () => {
      const value: ServiceGroup = {
        id: "/unit-test",
        name: "unit-test",
        quota: {
          enforced: false,
          limitStatus: "N/A",
          cpus: {
            guarantee: 1
          },
          memory: {
            guarantee: 1
          },
          disk: {
            guarantee: 1
          },
          gpus: {
            guarantee: 1
          }
        }
      };
      expect(QuotaUtil.groupHasQuotaLimit(value)).toEqual(false);
    });
  });

  describe("#populateResourcesFromRole", () => {
    it("populates limit values", () => {
      const value: ServiceGroupQuota = {
        enforced: false,
        limitStatus: "N/A"
      };
      const role: MesosRole = {
        name: "unit-test",
        weight: 0,
        quota: {
          limit: {
            cpus: 3,
            mem: 100,
            disk: 0
          }
        }
      };
      expect(QuotaUtil.populateResourcesFromRole(value, role)).toEqual({
        enforced: false,
        limitStatus: "N/A",
        cpus: {
          limit: 3
        },
        memory: {
          limit: 100
        },
        disk: {
          limit: 0
        },
        gpus: {}
      });
    });
    it("populates guarantee values", () => {
      const value: ServiceGroupQuota = {
        enforced: false,
        limitStatus: "N/A"
      };
      const role: MesosRole = {
        name: "unit-test",
        weight: 0,
        quota: {
          guarantee: {
            cpus: 3,
            mem: 100,
            gpus: 1
          }
        }
      };
      expect(QuotaUtil.populateResourcesFromRole(value, role)).toEqual({
        enforced: false,
        limitStatus: "N/A",
        cpus: {
          guarantee: 3
        },
        memory: {
          guarantee: 100
        },
        disk: {},
        gpus: {
          guarantee: 1
        }
      });
    });
    it("populates consumption values", () => {
      const value: ServiceGroupQuota = {
        enforced: false,
        limitStatus: "N/A"
      };
      const role: MesosRole = {
        name: "unit-test",
        weight: 0,
        quota: {
          consumed: {
            cpus: 3,
            mem: 100,
            disk: 0,
            gpus: 1
          }
        }
      };
      expect(QuotaUtil.populateResourcesFromRole(value, role)).toEqual({
        enforced: false,
        limitStatus: "N/A",
        cpus: {
          consumed: 3
        },
        memory: {
          consumed: 100
        },
        disk: {
          consumed: 0
        },
        gpus: {
          consumed: 1
        }
      });
    });
    it("doesn't set resources if role doesn't have quota", () => {
      const value: ServiceGroupQuota = {
        enforced: false,
        limitStatus: "N/A"
      };
      const role: MesosRole = {
        name: "unit-test",
        weight: 0
      };
      expect(QuotaUtil.populateResourcesFromRole(value, role)).toEqual({
        enforced: false,
        limitStatus: "N/A"
      });
    });
  });

  describe("#getQuotaLimit", () => {
    it("returns N/A for null roles", () => {
      expect(QuotaUtil.getQuotaLimit(null)).toEqual("N/A");
    });
    it("returns N/A for undefined roles", () => {
      expect(QuotaUtil.getQuotaLimit(undefined)).toEqual("N/A");
    });
    it("return Enforced for 0 roles", () => {
      const value: ServiceGroupQuotaRoles = {
        count: 0,
        groupRoleCount: 0
      };
      expect(QuotaUtil.getQuotaLimit(value)).toEqual("Enforced");
    });

    it("return Enforced for all roles", () => {
      const value: ServiceGroupQuotaRoles = {
        count: 10,
        groupRoleCount: 10
      };
      expect(QuotaUtil.getQuotaLimit(value)).toEqual("Enforced");
    });
    it("return Not Enforced for 0 group roles", () => {
      const value: ServiceGroupQuotaRoles = {
        count: 10,
        groupRoleCount: 0
      };
      expect(QuotaUtil.getQuotaLimit(value)).toEqual("Not Enforced");
    });

    it("return Partially Enforced for > 0 group roles", () => {
      const value: ServiceGroupQuotaRoles = {
        count: 10,
        groupRoleCount: 5
      };
      expect(QuotaUtil.getQuotaLimit(value)).toEqual("Partially Enforced");
    });
  });
});
