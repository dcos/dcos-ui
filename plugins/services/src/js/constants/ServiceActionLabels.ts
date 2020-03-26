import { i18nMark } from "@lingui/react";

interface ServiceActionLabelsInterface {
  edit: string;
  delete: string;
  restart: string;
  resume: string;
  open: string;
  scale: string;
  scale_by: string;
  reset_delayed: string;
  stop: string;
  view_plans: string;
  view_endpoints: string;
}

const ServiceActionLabels: ServiceActionLabelsInterface = {
  edit: i18nMark("Edit"),
  delete: i18nMark("Delete"),
  restart: i18nMark("Restart"),
  resume: i18nMark("Resume"),
  open: i18nMark("Open Service"),
  scale: i18nMark("Scale"),
  reset_delayed: i18nMark("Reset Delay"),
  scale_by: i18nMark("Scale By"),
  stop: i18nMark("Stop"),
  view_plans: i18nMark("View Plans"),
  view_endpoints: i18nMark("View Endpoints"),
};

export default ServiceActionLabels;
