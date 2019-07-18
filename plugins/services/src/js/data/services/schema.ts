import { ServicePlanStatusSchema } from "#PLUGINS/services/src/js/types/ServicePlanStatus";
import { ServicePlanStepSchema } from "#PLUGINS/services/src/js/types/ServicePlanStep";
import { ServicePlanPhaseSchema } from "#PLUGINS/services/src/js/types/ServicePlanPhase";
import { ServicePlanSchema } from "#PLUGINS/services/src/js/types/ServicePlan";
import { ServiceSchema } from "#PLUGINS/services/src/js/types/Service";

export const ServicesTypes = `
  ${ServicePlanStatusSchema}
  ${ServicePlanStepSchema}
  ${ServicePlanPhaseSchema}
  ${ServicePlanSchema}
  ${ServiceSchema}
`;
