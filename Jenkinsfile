#!/usr/bin/env groovy

@Library("sec_ci_libs@v2-latest") _

def master_branches = ["master", ] as String[]
def slack_creds = string(credentialsId: "8b793652-f26a-422f-a9ba-0d1e47eb9d89", variable: "SLACK_TOKEN")
def aws_id = string(credentialsId: "1ddc25d8-0873-4b6f-949a-ae803b074e7a", variable: "AWS_ACCESS_KEY_ID")
def aws_key = string(credentialsId: "875cfce9-90ca-4174-8720-816b4cb7f10f", variable: "AWS_SECRET_ACCESS_KEY")
def cluster_suffix = BRANCH_NAME.replaceAll("[^a-zA-Z0-9]", "");

pipeline {
  agent {
    dockerfile {
      args  "--shm-size=2g"
    }
  }

  options {
    timeout(time: 2, unit: "HOURS")
    disableConcurrentBuilds()
  }

  stages {
    stage("Authorization") {
      steps {
        user_is_authorized(master_branches, "8b793652-f26a-422f-a9ba-0d1e47eb9d89", "#frontend-dev")
      }
    }

    stage("Prepare Repository") {
      steps {
        // clean up existing files
        sh "rm -rfv .* || ls -la ; rm -rfv ./* || ls -la"

        // cloning oss repo, we need this for commit history
        withCredentials([
          usernamePassword(credentialsId: "a7ac7f84-64ea-4483-8e66-bb204484e58f", passwordVariable: "GIT_PASSWORD", usernameVariable: "GIT_USER")
        ]) {
          sh "git clone https://\$GIT_USER:\$GIT_PASSWORD@github.com/dcos/dcos-ui.git ."
        }
        sh "git fetch -a"

        // checking out correct branch
        sh 'git checkout "$([ -z "$CHANGE_BRANCH" ] && echo $BRANCH_NAME || echo $CHANGE_BRANCH )"'

        // when on PR rebase to target
        sh '[ -z "$CHANGE_TARGET" ] && echo "on release branch" || git rebase origin/${CHANGE_TARGET}'
      }
    }

    stage("Install") {
      steps {
        sh "npm --unsafe-perm ci"
      }
    }

    stage("Lint / Build") {
      parallel {
        stage("Lint") {
          steps { sh "npm run lint" }
        }
        stage("build") {
          steps { sh "npm run build" }
        }
        stage("Test Types") {
          // we separate type-related tests for now as they seem to be flaky
          steps { sh "npx jest typecheck" }
        }
        stage("Check Translations") {
          steps { sh "npm run util:lingui:check" }
        }
      }
    }

    // We need to split system tests, as the CI-node can't handle 5 cypresses and the unit tests at once.
    stage("Most System Tests") {
      parallel {
        stage("Unit Tests") {
          // at this point we already ran tslint and the typecheck, see above!
          steps { sh "npm run test -- --runInBand --testPathIgnorePatterns tslint typecheck" }
        }
        stage("Integration Test") {
          steps {
            sh "npm run test:integration"
          }

          post {
            always {
              archiveArtifacts "cypress/**/*"
              junit "cypress/result-integration.xml"
            }
          }
        }

        stage("System Test OSS 1.13.9") {
          environment {
            DCOS_DIR = "/tmp/.dcos-OSS-1139"
            PROXY_PORT = "4300"
            TERRAFORM_DIR = "./scripts/terraform-oss-1139"
            TF_VAR_cluster_name = "ui-o1139-${cluster_suffix}-${BUILD_NUMBER}"
            TF_VAR_custom_dcos_download_path = "https://downloads.dcos.io/dcos/stable/1.13.9/dcos_generate_config.sh"
            TF_VAR_variant = "open"
          }
          steps {
            withCredentials([ aws_id, aws_key ]) {
              sh '''
                rsync -aH ./scripts/terraform/ $TERRAFORM_DIR
                export CLUSTER_URL=$(cd $TERRAFORM_DIR && ./up.sh | tail -n1)

                . scripts/utils/load_auth_env_vars
                dcos cluster setup $CLUSTER_URL --provider=dcos-oidc-auth0 --insecure
                npm run test:system
              '''
            }
          }

          post {
            always {
              withCredentials([ aws_id, aws_key ]) {
                sh "cd $TERRAFORM_DIR && ./down.sh"
              }
              archiveArtifacts "cypress/**/*"
              junit "cypress/result-system.xml"
            }
          }
        }

        stage("System Test OSS 2.0.2") {
          environment {
            DCOS_DIR = "/tmp/.dcos-OSS-202"
            PROXY_PORT = "4301"
            TERRAFORM_DIR = "./scripts/terraform-oss-202"
            TF_VAR_cluster_name = "ui-o202-${cluster_suffix}-${BUILD_NUMBER}"
            TF_VAR_custom_dcos_download_path = "https://downloads.dcos.io/dcos/stable/2.0.2/dcos_generate_config.sh"
            TF_VAR_variant = "open"
          }
          steps {
            withCredentials([ aws_id, aws_key ]) {
              sh '''
                rsync -aH ./scripts/terraform/ $TERRAFORM_DIR
                export CLUSTER_URL=$(cd $TERRAFORM_DIR && ./up.sh | tail -n1)

                . scripts/utils/load_auth_env_vars
                dcos cluster setup $CLUSTER_URL --provider=dcos-oidc-auth0 --insecure
                npm run test:system
              '''
            }
          }

          post {
            always {
              withCredentials([ aws_id, aws_key ]) {
                sh "cd $TERRAFORM_DIR && ./down.sh"
              }
              archiveArtifacts "cypress/**/*"
              junit "cypress/result-system.xml"
            }
          }
        }
      }
    }

    stage("System Tests EE") {
      parallel {
        stage("System Test EE 1.13.9") {
          environment {
            DCOS_DIR = "/tmp/.dcos-EE-113"
            PROXY_PORT = "4400"
            TERRAFORM_DIR = "./scripts/terraform-ee-1337"
            TF_VAR_cluster_name = "ui-ee113-${cluster_suffix}-${BUILD_NUMBER}"
            TF_VAR_custom_dcos_download_path = "https://downloads.mesosphere.com/dcos-enterprise/stable/1.13.9/dcos_generate_config.ee.sh"
            TF_VAR_variant = "ee"

            // EE-stuff
            ADDITIONAL_CYPRESS_CONFIG = ",integrationFolder=system-tests-ee"
            TESTS_FOLDER = "system-tests-ee"
          }
          steps {
            withCredentials([ aws_id, aws_key, string(credentialsId: "8667643a-6ad9-426e-b761-27b4226983ea", variable: "TF_VAR_license_key")]) {
              sh '''
                rsync -aH ./scripts/terraform/ $TERRAFORM_DIR
                export CLUSTER_URL=$(cd $TERRAFORM_DIR && ./up.sh | tail -n1)

                . scripts/utils/load_auth_env_vars
                dcos cluster setup $CLUSTER_URL --provider=dcos-users --insecure

                rsync -aH ./system-tests/ ./system-tests-ee/
                npm run test:system
              '''
            }
          }

          post {
            always {
              withCredentials([ aws_id, aws_key ]) {
                sh "cd $TERRAFORM_DIR && ./down.sh"
              }
              archiveArtifacts "cypress/**/*"
              junit "cypress/result-system.xml"
            }
          }
        }

        stage("System Test EE 2.0.2") {
          environment {
            DCOS_DIR = "/tmp/.dcos-EE-202"
            PROXY_PORT = "4401"
            TERRAFORM_DIR = "./scripts/terraform-ee-202"
            TF_VAR_cluster_name = "ui-ee202-${cluster_suffix}-${BUILD_NUMBER}"
            TF_VAR_custom_dcos_download_path = "https://downloads.mesosphere.com/dcos-enterprise/stable/2.0.2/dcos_generate_config.ee.sh"
            TF_VAR_variant = "ee"

            // EE-stuff
            ADDITIONAL_CYPRESS_CONFIG = ",integrationFolder=system-tests-ee"
            TESTS_FOLDER = "system-tests-ee"
          }
          steps {
            withCredentials([ aws_id, aws_key, string(credentialsId: "8667643a-6ad9-426e-b761-27b4226983ea", variable: "TF_VAR_license_key")]) {
              sh '''
                rsync -aH ./scripts/terraform/ $TERRAFORM_DIR
                export CLUSTER_URL=$(cd $TERRAFORM_DIR && ./up.sh | tail -n1)

                . scripts/utils/load_auth_env_vars
                dcos cluster setup $CLUSTER_URL --provider=dcos-users --insecure

                rsync -aH ./system-tests/ ./system-tests-ee/
                npm run test:system
              '''
            }
          }

          post {
            always {
              withCredentials([ aws_id, aws_key ]) {
                sh "cd $TERRAFORM_DIR && ./down.sh"
              }
              archiveArtifacts "cypress/**/*"
              junit "cypress/result-system.xml"
            }
          }
        }
      }
    }

    stage("Semantic Release") {
      steps {
        withCredentials([
          string(credentialsId: "d146870f-03b0-4f6a-ab70-1d09757a51fc", variable: "GH_TOKEN"), // semantic-release
          string(credentialsId: "sentry_io_token", variable: "SENTRY_AUTH_TOKEN"), // upload-build
          usernamePassword(credentialsId: "a7ac7f84-64ea-4483-8e66-bb204484e58f", passwordVariable: "GIT_PASSWORD", usernameVariable: "GIT_USER"), // update-dcos-repo
          usernamePassword(credentialsId: "6c147571-7145-410a-bf9c-4eec462fbe02", passwordVariable: "JIRA_PASS", usernameVariable: "JIRA_USER") // semantic-release-jira
        ]) {
          sh "npm run release"
        }
      }
    }
  }

  post {
    failure {
      withCredentials([ slack_creds ]) {
        slackSend (
          channel: "#frontend-ci-status",
          color: "danger",
          message: "FAILED\nBranch: ${env.CHANGE_BRANCH}\nJob: <${env.RUN_DISPLAY_URL}|${env.JOB_NAME} [${env.BUILD_NUMBER}]>",
          teamDomain: "mesosphere",
          token: "${env.SLACK_TOKEN}",
        )
      }
    }
    unstable {
      withCredentials([ slack_creds ]) {
        slackSend (
          channel: "#frontend-ci-status",
          color: "warning",
          message: "UNSTABLE\nBranch: ${env.CHANGE_BRANCH}\nJob: <${env.RUN_DISPLAY_URL}|${env.JOB_NAME} [${env.BUILD_NUMBER}]>",
          teamDomain: "mesosphere",
          token: "${env.SLACK_TOKEN}",
        )
      }
    }
  }
}
