FROM cypress/base:14.15.0

# Expose the 4200 port
EXPOSE 4200

# Copy required files in order to be able to do npm install
WORKDIR /dcos-ui

ENV TERRAFORM_VERSION=0.12.29

# Install required components & prepare environment
RUN set -x \
  && apt-get update \
  && apt-get install -y awscli lsof wget jq curl rsync openssh-client \
  && apt-get clean \
  && curl -o /usr/local/bin/dcos https://downloads.dcos.io/cli/testing/binaries/dcos/linux/x86-64/master/dcos \
  && chmod +x /usr/local/bin/dcos \
  && npm install -g dogapi

RUN cd /tmp \
  && wget https://releases.hashicorp.com/terraform/${TERRAFORM_VERSION}/terraform_${TERRAFORM_VERSION}_linux_amd64.zip \
  && unzip terraform_${TERRAFORM_VERSION}_linux_amd64.zip -d /usr/bin

# Export mountable volumes
VOLUME /dcos-ui
