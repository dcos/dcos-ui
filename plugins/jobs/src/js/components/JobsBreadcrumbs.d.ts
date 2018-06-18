import { Component } from "react";
import JobTree from "#SRC/js/structs/JobTree";
import Job from "#SRC/js/structs/Job";

// TODO: type this correctly
export default class JobsBreadcrumbs extends Component {
  props: {
    tree: JobTree;
    item: JobTree | Job;
  };
}
