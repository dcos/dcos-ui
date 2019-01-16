import {
  ServicePlanPhase,
  compare as comparePhases
} from "#PLUGINS/services/src/js/types/ServicePlanPhase";
import { ServicePlanStatus } from "#PLUGINS/services/src/js/types/ServicePlanStatus";
import { ServicePlanStep } from "#PLUGINS/services/src/js/types/ServicePlanStep";

export interface ServicePlan {
  name: string;
  phases: ServicePlanPhase[];
  status: ServicePlanStatus;
  errors: string[];
  strategy: string;
}

export interface ServicePlanElement {
  type: "phase" | "step" | "nodata";
  id: string;
  name: string;
  status: ServicePlanStatus;
  strategy?: string;
  phaseId?: string;
  message?: string;
  steps?: ServicePlanElement[];
}

export function flattenServicePlan(plan: ServicePlan): ServicePlanElement[] {
  return plan.phases.reduce(
    (acc: ServicePlanElement[], phase: ServicePlanPhase) => {
      const stepElements = phase.steps.map(
        (step: ServicePlanStep): ServicePlanElement => ({
          type: "step",
          phaseId: phase.id,
          ...step
        })
      );
      acc.push({
        type: "phase",
        id: phase.id,
        name: phase.name,
        strategy: phase.strategy,
        status: phase.status,
        steps: stepElements
      });
      return acc.concat(stepElements);
    },
    []
  );
}

export function compare(a: ServicePlan, b: ServicePlan): boolean {
  if (
    a.name !== b.name ||
    a.status !== b.status ||
    a.strategy !== b.strategy ||
    a.phases.length !== b.phases.length
  ) {
    return false;
  }

  for (let i = 0; i < a.phases.length; i++) {
    if (!comparePhases(a.phases[i], b.phases[i])) {
      return false;
    }
  }
  return true;
}

export const ServicePlanSchema = `
type ServicePlan {
  name: String!
  phases: [ServicePlanPhase!]!
  errors: [String!]!
  strategy: String!
  status: ServicePlanStatus!
}
`;
