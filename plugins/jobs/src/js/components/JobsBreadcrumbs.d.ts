import { Component } from "react";
import { Job } from "#PLUGINS/jobs/src/js/types/Job";

export default class JobsBreadcrumbs extends Component {
  props: {
    namespace?: string;
    job?: Job;
  };
}
