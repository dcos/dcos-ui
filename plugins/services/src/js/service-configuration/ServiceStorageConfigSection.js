import React from "react";
import { Table } from "reactjs-components";

import { formatResource } from "../../../../../src/js/utils/Units";
import {
  getColumnClassNameFn,
  getColumnHeadingFn,
  getDisplayValue
} from "../utils/ServiceConfigDisplayUtil";
import ConfigurationMapEditAction
  from "../components/ConfigurationMapEditAction";
import ServiceConfigBaseSectionDisplay from "./ServiceConfigBaseSectionDisplay";
import Util from "../../../../../src/js/utils/Util";

class ServiceStorageConfigSection extends ServiceConfigBaseSectionDisplay {
  /**
   * @override
   */
  shouldExcludeItem() {
    const { appConfig } = this.props;

    return !Util.findNestedPropertyInObject(
      appConfig,
      "container.volumes.length"
    );
  }

  /**
   * @override
   */
  getDefinition() {
    const { onEditClick } = this.props;

    return {
      tabViewID: "volumes",
      values: [
        {
          key: "container.volumes",
          heading: "Storage",
          headingLevel: 1
        },
        {
          key: "container.volumes",
          render(volumes) {
            if (volumes == null) {
              return null;
            }

            const columns = [
              {
                heading: getColumnHeadingFn("Volume"),
                prop: "volume",
                render(prop, row) {
                  let name = "";

                  if (row.name != null) {
                    name = ` (${row.name})`;
                  }

                  return `${row.type.join(" ")}${name}`;
                },
                className: getColumnClassNameFn(),
                sortable: true
              },
              {
                heading: getColumnHeadingFn("Size"),
                prop: "size",
                render(prop, row) {
                  let value = row[prop];

                  if (value == null) {
                    return getDisplayValue(value, row.isHostVolume);
                  }

                  if (row.type.join(" ") === "External" && !row.isHostVolume) {
                    // External volumes specify size in GiB
                    value = value * 1024;
                  }

                  return formatResource("disk", value);
                },
                className: getColumnClassNameFn(),
                sortable: true
              },
              {
                heading: getColumnHeadingFn("Mode"),
                prop: "mode",
                className: getColumnClassNameFn(),
                sortable: true
              },
              {
                heading: getColumnHeadingFn("Container Mount Path"),
                prop: "containerPath",
                className: getColumnClassNameFn(),
                sortable: true
              }
            ];

            let shouldDisplayHostPath = false;

            const volumesData = volumes.map(appVolume => {
              // We don't want to mutate the appVolume value.
              const volume = {
                name: null,
                size: null,
                type: [],
                isHostVolume: false
              };

              volume.containerPath = appVolume.containerPath;
              volume.mode = appVolume.mode;

              if (appVolume.persistent != null) {
                volume.size = appVolume.persistent.size;
                volume.type.push("Persistent", "Local");
              } else if (appVolume.external != null) {
                volume.size = appVolume.external.size;
                volume.type.push("External");
              } else {
                volume.isHostVolume = true;
                volume.type.push("Host", "Volume");
              }

              if (appVolume.external != null) {
                volume.name = appVolume.external.name;
              }

              if (appVolume.hostPath != null) {
                // Set this flag to true so that we render the hostPath column.
                shouldDisplayHostPath = true;
              }

              volume.hostPath = getDisplayValue(
                appVolume.hostPath,
                !volume.isHostVolume
              );

              return volume;
            });

            if (shouldDisplayHostPath) {
              columns.push({
                heading: getColumnHeadingFn("Host Path"),
                prop: "hostPath",
                className: getColumnClassNameFn(),
                sortable: true
              });
            }

            if (onEditClick) {
              columns.push({
                heading() {
                  return null;
                },
                className: "configuration-map-action",
                prop: "edit",
                render() {
                  return (
                    <ConfigurationMapEditAction
                      onEditClick={onEditClick}
                      tabViewID="volumes"
                    />
                  );
                }
              });
            }

            return (
              <Table
                key="service-volumes"
                className="table table-simple table-align-top table-break-word table-fixed-layout flush-bottom"
                columns={columns}
                data={volumesData}
              />
            );
          }
        }
      ]
    };
  }
}

module.exports = ServiceStorageConfigSection;
