import { i18nMark } from "@lingui/react";

interface ServiceActionLabelsInterface {
  edit: string;
  delete: string;
  restart: string;
  resume: string;
  open: string;
  scale: string;
  scale_by: string;
  stop: string;
}

const ServiceActionLabels: ServiceActionLabelsInterface = {
  edit: i18nMark("Edit"),
  delete: i18nMark("Delete"),
  restart: i18nMark("Restart"),
  resume: i18nMark("Resume"),
  open: i18nMark("Open Service"),
  scale: i18nMark("Scale"),
  scale_by: i18nMark("Scale By"),
  stop: i18nMark("Stop")
};

export default ServiceActionLabels;
