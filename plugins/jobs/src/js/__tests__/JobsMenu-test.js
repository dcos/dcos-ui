/* eslint-disable no-unused-vars */
import React from "react";
/* eslint-enable no-unused-vars */

import Job from "#SRC/js/structs/Job";
import JobTree from "#SRC/js/structs/JobTree";

import Page from "#SRC/js/components/Page";
import JobsMenu from "../JobsMenu";

describe("LicensingExpirationRow", function() {
  describe("#render", function() {
    it("renders jobs menu", function() {
      const job = new Job({ id: "test" });
      const jobTree = new JobTree();

      const instance = (
        <Page>
          <JobsMenu
            actions={[""]}
            isPageHeader={true}
            job={job}
            tree={jobTree}
          />
          <div />
        </Page>
      );

      expect(instance).toMatchSnapshot();
    });
  });
});
