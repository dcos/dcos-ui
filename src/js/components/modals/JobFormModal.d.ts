import { Component } from "react";
import Job from "#SRC/js/structs/Job";

interface JobFormModalProps {
  isEdit?: boolean;
  job?: Job;
  open?: boolean;
  onClose?: () => void;
}

interface JobFormModalState {
  defaultTab: string;
  errorMessage: any;
  job: Job;
  jobFormModel: any;
  jobJsonString: string;
  jsonMode: boolean;
}

export default class JobFormModal extends Component<
  JobFormModalProps,
  JobFormModalState
> {}
