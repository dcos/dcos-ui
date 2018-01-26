FROM node:alpine

# Copy required files in order to be able to do npm install
WORKDIR /dcos-ui

# Define entrypoint
ENTRYPOINT [ "/bin/sh" ]

# Export mountable volumes
VOLUME /dcos-ui
VOLUME /dcos-ui-plugins