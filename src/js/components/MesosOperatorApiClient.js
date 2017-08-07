const EventEmitter = require("events").EventEmitter;
const util = require("util");
const http = require("http");

const helpers = require("../utils/mesos-operator-api/MesosOperatorApiUtil");

/**
 * Represents a mesos Event Bus Client
 * @constructor
 * @param {object} options - The option map object.
 */
function MesosOperatorApiClient(options) {
  if (!(this instanceof MesosOperatorApiClient)) {
    return new MesosOperatorApiClient(options);
  }

  // Inherit from EventEmitter
  EventEmitter.call(this);

  const self = this;

  // See http://mesos.apache.org/documentation/latest/operator-http-api/
  self.allowedEventTypes = [
    "SUBSCRIBED",
    "TASK_ADDED",
    "TASK_UPDATED",
    "AGENT_ADDED",
    "AGENT_REMOVED",
    "FRAMEWORK_ADDED",
    "FRAMEWORK_UPDATED",
    "FRAMEWORK_REMOVED",
    "HEARTBEAT"
  ];

  // Setup the backoff
  self.connectionBackoffTime = 0;
  self.maxConnectionBackoffTime = 500000;

  // Add the allowed Operator API methods
  self.allowedApiMethods = helpers.getSupportedMasterApiCalls();

  // Options dict
  self.options = {};

  // mesos endpoint discovery
  if (options.masterHost) {
    self.options.masterHost = options.masterHost;
  }
  if (options.masterPort) {
    self.options.masterPort = parseInt(options.masterPort, 10);
  }
  self.options.masterProtocol = options.masterProtocol || "http";
  self.options.masterApiUri = options.masterApiUri || "/api/v1";
  self.options.masterConnectionTimeout =
    options.masterConnectionTimeout || 5000;

  // Logging
  self.logger = helpers.getLogger(
    options.logging && options.logging.path ? options.logging.path : null,
    options.logging && options.logging.fileName
      ? options.logging.fileName
      : null,
    options.logging && options.logging.level ? options.logging.level : null
  );

  // Set the used eventTypes
  if (options.eventTypes && options.eventTypes.length > 0) {
    self.options.eventTypes = [];
    options.eventTypes.forEach(function(eventType) {
      if (self.allowedEventTypes.indexOf(eventType) > -1) {
        self.options.eventTypes.push(eventType);
      }
    });
  } else {
    // Default events
    self.options.eventTypes = self.allowedEventTypes;
  }

  // Template for issuing Mesos Scheduler HTTP API requests
  self.requestTemplate = {};

  // Poplate request template
  self.generateRequestTemplate = function() {
    self.requestTemplate = {
      path: self.options.masterApiUri,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      }
    };
    if (self.options.masterHost) {
      self.requestTemplate.host = self.options.masterHost;
    }
    if (self.options.masterPort) {
      self.requestTemplate.port = self.options.masterPort;
    }
  };

  // Fill the requestTemplate
  self.generateRequestTemplate();

  // Event handlers
  self.eventHandlers = {};

  // Add custom event handlers if present
  if (
    options.handlers &&
    Object.getOwnPropertyNames(options.handlers).length > 0
  ) {
    Object.getOwnPropertyNames(options.handlers).forEach(function(handlerName) {
      const ucHandlerName = handlerName.toUpperCase();
      // Check if name is in defined event types, is a function
      if (
        self.options.eventTypes.indexOf(ucHandlerName) > -1 &&
        helpers.isFunction(options.handlers[handlerName])
      ) {
        self.eventHandlers[ucHandlerName] = function(data) {
          // Emit according event
          self.emit(ucHandlerName, data);
          // Call custom event handler
          options.handlers[handlerName](data);
        };
      }
    });
  }

  // Check if an event handlers has been defined for each event type
  self.options.eventTypes.forEach(function(eventType) {
    // If there's no event handler defined yet, set a default event handler which just prints the event name
    if (!Object.prototype.hasOwnProperty.call(self.eventHandlers, eventType)) {
      self.eventHandlers[eventType] = function(data) {
        // Emit according event
        self.emit(eventType, data);
        // Handling the special case SUBSCRIBED
        if (eventType === "SUBSCRIBED") {
          self.emit(eventType.toLowerCase(), {
            timestamp: (new Date().getTime() / 1000).toFixed(0)
          });
        }
        // Log event name
        self.logger.info(
          "Default handler for " +
            eventType +
            ". Emit event '" +
            eventType +
            "'."
        );
        self.logger.info(JSON.stringify(data));
      };
    }
  });

  // Add supported Operator API methods as functions
  self.allowedApiMethods.forEach(function(apiCall) {
    // Add supported methods
    self[helpers.getFunctionNameFromApiCalls(apiCall)] = function(callback) {
      // Populate request body
      const requestBody = {
        type: apiCall
      };
      // Do the call to the Operator API
      helpers.doRequest.call(self, requestBody, function(error, response) {
        if (error) {
          // Emit error event
          self.emit("error", error.message);
          // Check if callback is added, if so, trigger it
          if (callback) {
            callback(error, null);
          }
        } else {
          // Parse response
          const body = JSON.parse(response.body)[apiCall.toLowerCase()];
          // Emit individual event for method
          self.emit(helpers.getEventNameFromApiMethod(apiCall), body);
          // Check if callback is added, if so, trigger it
          if (callback) {
            callback(null, body);
          }
        }
      });
    };
  });
}

// Inherit from EventEmitter
util.inherits(MesosOperatorApiClient, EventEmitter);

/**
 * Subscribe to the Mesos Operator API events
 */
MesosOperatorApiClient.prototype.subscribe = function() {
  const self = this;

  /**
   * The handler functon for the incoming Mesos Operator API events
   * @param {object} eventData - The data object for an incoming event. Contains the event details (type etc.).
   */
  function handleEvent(eventData) {
    try {
      // Parse eventData as JSON
      const event = JSON.parse(eventData);

      // Determine event handler
      if (self.eventHandlers[event.type]) {
        // Call event handler
        self.eventHandlers[event.type].call(
          self,
          event[event.type.toLocaleLowerCase()]
        );
      } else {
        self.logger.info("Unhandled event " + event.type);
        self.logger.info(JSON.stringify(event));
      }
    } catch (error) {
      self.emit("error", {
        message: "Couldn't parse as JSON: " + eventData,
        stack: error.stack || ""
      });
    }
  }

  function handleRedirect(location) {
    // Redirection to another Master received
    self.logger.info("SUBSCRIBE: Redirect Location: " + location);

    // Derive the leader info
    const leaderInfo = location.replace(/\/\//g, "").split(":");

    // Check for scheme and move window accordingly
    const schemeIndex = leaderInfo.length > 2 ? 0 : -1;

    // Set new leading master info
    self.options.masterHost = leaderInfo[schemeIndex + 1];

    // If the port part contains slashes -> URLs, then fiix it by just getting the port
    if (leaderInfo[schemeIndex + 2].indexOf("/") > -1) {
      const temp = leaderInfo[schemeIndex + 2].split("/");
      self.options.masterPort = temp[0];
    } else {
      self.options.masterPort = leaderInfo[schemeIndex + 2];
    }

    self.logger.info(
      "SUBSCRIBE: Leader info: " +
        self.options.masterHost +
        ":" +
        self.options.masterPort
    );

    // Fill the requestTemplate with the new info
    self.generateRequestTemplate();
  }

  // Placeholder for tracking if a timeout has already been handled
  let handledTimeout = false;

  // Send HTTP request
  self.httpRequest = http.request(self.requestTemplate, function(res) {
    self.logger.info("SUBSCRIBE: Response status: " + res.statusCode);

    // Watching for close_request events. Will shutdown the application once received!
    self.on("close_request", function() {
      // Close response -> End connection!
      res.emit("close");
      // Stop the application
      process.exit(0);
    });

    if (res.statusCode === 307 && res.headers["location"]) {
      // Reset the connection backoff;
      self.connectionBackoffTime = 0;

      // Handle redirect information
      handleRedirect(res.headers["location"]);

      // Try to re-register
      self.subscribe();
    } else if (res.statusCode === 200) {
      // Reset the connection backoff;
      self.connectionBackoffTime = 0;

      // Set encoding to UTF8
      res.setEncoding("utf8");

      // Emit sent_subscribe event
      self.emit("sent_subscribe", {
        timestamp: (new Date().getTime() / 1000).toFixed(0)
      });

      // Local cache for chunked JSON messages
      let cache = "";
      let expectedLength = 0;

      function getIntIndex(cache) {
        const temp = cache.split("\n");
        if (temp.length > 1) {
          return temp[0].length;
        }

        return -1;
      }

      // Watch for data/chunks
      res.on("data", function(chunk) {
        if (chunk instanceof Buffer) {
          chunk = chunk.toString();
        }
        cache += chunk;

        if (expectedLength === 0) {
          const intIndex = getIntIndex(cache);
          expectedLength = parseInt(cache.substring(0, intIndex), 10);
          cache = cache.substring(intIndex + 1, cache.length);
        }
        if (expectedLength > 0 && cache.length >= expectedLength) {
          const msgStr = cache.substring(0, expectedLength);
          handleEvent(msgStr);

          cache = cache.substring(expectedLength, cache.length);
          expectedLength = 0;
        }
      });

      res.on("end", function() {
        self.emit("error", { message: "Long-running connection was closed!" });
        self.logger.info("END event on long-running connection!");
        if (!handledTimeout) {
          // Re-subscribe
          self.subscribe();
        }
      });

      res.on("finish", function() {
        self.logger.info("FINISH event on long-running connection!");
      });

      res.on("close", function() {
        self.logger.info("CLOSE event on long-running connection!");
      });
    } else {
      // Reset the connection backoff;
      self.connectionBackoffTime = 0;

      res.on("data", function(chunk) {
        if (chunk.length > 0) {
          self.emit("error", {
            message: "Error registering with mesos: " +
              chunk.toString() +
              " , code: " +
              res.statusCode.toString()
          });
        } else {
          self.emit("error", {
            message: "Error registering with mesos - empty response, code: " +
              res.statusCode.toString()
          });
        }
      });
    }
  });

  self.httpRequest.on("error", function(e) {
    if (self.connectionBackoffTime === 0) {
      self.connectionBackoffTime = 1000;
    } else {
      self.connectionBackoffTime = Math.min(
        self.connectionBackoffTime * 2,
        self.maxConnectionBackoffTime
      );
    }

    self.emit("error", {
      message: "There was a problem with the request, will retry in " +
        self.connectionBackoffTime / 1000 +
        " seconds. Error message: " +
        (e.message ? e.message : JSON.stringify(e))
    });

    setTimeout(function() {
      self.subscribe();
    }, self.connectionBackoffTime);
  });

  // Register a timeout for triggering of re-registrations of the scheduler
  self.httpRequest.on("socket", function(socket) {
    const httpRequest = self.httpRequest;
    socket.setTimeout(self.options.masterConnectionTimeout);
    socket.on("timeout", function() {
      self.logger.error(
        "Received a timeout on the long-running Master connection! Will try to re-register to the Mesos Operator API!"
      );
      handledTimeout = true;
      socket.destroy();
      // Make sure the timeout is not re-emitted.
      socket.setTimeout(0);
      if (httpRequest !== self.httpRequest) {
        self.logger.info("Already reconnected, not attempting again.");

        return;
      }

      // If we're using Mesos DNS, we can directy re-register, because Mesos DNS will discover the current leader automatically
      if (self.options.masterHost === "leader.mesos") {
        self.logger.info(
          "Using Mesos DNS, will re-register to 'leader.mesos'!"
        );
        // Subscribe
        self.subscribe();
      } else {
        self.logger.info(
          "Not using Mesos DNS, try to get new leader through redirection!"
        );
        // If not, it's more difficult. When a IP address is passed for the Master, and the Master is unavailable,
        // we cannot use the Master detection via location headers, as outlined at http://mesos.apache.org/documentation/latest/scheduler-http-api/ (chapter "Master detection"),
        // because the request will not be successful. So, first we'll try the redirect method (in case of a leader change), if that is not possible, we have to shut down our framework
        // unless there is a better way in the future.
        const redirectRequest = http.request(self.requestTemplate, function(
          res
        ) {
          // Check if we received a redirect
          if (res.statusCode === 307 && res.headers["location"]) {
            self.logger.info(
              "Received redirection information. Will attempt to re-register to the Mesos Operator API!"
            );
            // Handle redirect information
            handleRedirect(res.headers["location"]);
            // Subscribe
            self.subscribe();
          }
        });
        // Set timeout for redirect request. When it's triggered, we know that the last leading master is down and that we cannot get the current leader information from it.
        // So, we have to shutdown the framework scheduler, because we're out of options.
        redirectRequest.on("socket", function(socket) {
          socket.setTimeout(self.options.masterConnectionTimeout);
          socket.on("timeout", function() {
            self.logger.error(
              "Couldn't receive a response for the redirect request from the last leading master!"
            );
            self.logger.error(
              "There's no way to recover, the Mesos Operator API client will halt now!"
            );
            process.exit(1);
          });
        });
      }
    });
  });

  // Send SUBSCRIBE call
  self.httpRequest.write(
    JSON.stringify({
      type: "SUBSCRIBE"
    })
  );

  // End request
  self.httpRequest.end();
};

/**
 * Unsubscribes from the Mesos Operator API events
 */
MesosOperatorApiClient.prototype.unsubscribe = function() {
  const self = this;
  self.emit("unsubscribed");
  setTimeout(function() {
    self.emit("close_request");
  }, 100);
};

/**
 * Reconcile the state from the Operator API)
 */
MesosOperatorApiClient.prototype.reconcile = function() {
  const self = this;
  const reconcileRequestBody = {
    type: "GET_STATE"
  };
  helpers.doRequest.call(self, reconcileRequestBody, function(error, response) {
    if (error) {
      self.emit("error", error.message);
    } else {
      self.emit("reconciled", JSON.parse(response.body));
    }
  });
};

module.exports = MesosOperatorApiClient;
