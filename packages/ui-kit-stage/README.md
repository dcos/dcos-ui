# UI Kit Stage Package

This package (folder) is about components that will go into UI Kit, but we wanted to move forward without waiting for the PR to be merged and release to be cut.

## How to add Components here

1.  Add the component in this folder
2.  Make sure it is not importing anything from dcos-ui project, try to make the component as complete as possible (including styles!)
3.  Add JIRA Issue for moving the Component to UI-Kit (see example below)
4.  Add a short header to the file stating the name, date added and JIRA link:
    ```
    /**
    * Component: HeaderBar
    * Added: 2018-07-08
    * JIRA: https://jira.mesosphere.com/browse/DCOS-39074
    */
    ```
