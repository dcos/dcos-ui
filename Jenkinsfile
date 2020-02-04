#!/usr/bin/env groovy

@Library("sec_ci_libs@v2-latest") _

def master_branches = ["master", ] as String[]
def aws_creds = [
  $class: "AmazonWebServicesCredentialsBinding",
  credentialsId: "f40eebe0-f9aa-4336-b460-b2c4d7876fde",
  accessKeyVariable: "AWS_ACCESS_KEY_ID",
  secretKeyVariable: "AWS_SECRET_ACCESS_KEY"
]
def slack_creds = string(credentialsId: "8b793652-f26a-422f-a9ba-0d1e47eb9d89", variable: "SLACK_TOKEN")


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
        sh "npm config set externalplugins ./plugins-ee"
        sh "npm --unsafe-perm ci"
      }
    }


    stage("Lint Commits") {
      when {
        expression {
          !master_branches.contains(BRANCH_NAME)
        }
      }

      steps {
        sh 'npm run lint:commits -- --from "${CHANGE_TARGET}"'
      }
    }

    stage("Check Translations") {
      steps { sh "npm run util:lingui:check" }
    }
    stage("Lint") {
      steps { sh "npm run lint" }
    }
    stage("build") {
      steps { sh "npm run build" }
    }
    stage("Test Types") {
      // we separate type-related tests for now as they seem to be flaky
      steps { sh "npx jest typecheck tslint" }
    }

    stage("Setup Data Dog") {
      steps {
        withCredentials([
          string(credentialsId: '66c40969-a46d-470e-b8a2-6f04f2b3f2d5', variable: 'DATADOG_API_KEY'),
          string(credentialsId: 'MpukWtJqTC3OUQ1aClsA', variable: 'DATADOG_APP_KEY'),
        ]) {
          sh "./scripts/ci/createDatadogConfig.sh"
        }
      }
    }

    stage("Test current versions") {
      parallel {
        stage("Unit Tests") {
          // runInBand to not starve cypress-processes
          steps { sh "npm run test -- --runInBand --testPathIgnorePatterns tslint typecheck" }
        }

        stage("Integration Test") {
          environment {
            REPORT_TO_DATADOG = master_branches.contains(BRANCH_NAME)
          }
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

        stage("System Test OSS") {
          environment {
            REPORT_TO_DATADOG = master_branches.contains(BRANCH_NAME)
          }
          steps {
            withCredentials([ aws_creds ]) {
              sh '''
                export VARIANT=OSS
                export DCOS_DIR=/tmp/.dcos-OSS
                INSTALLER_URL="https://downloads.dcos.io/dcos/testing/master/dcos_generate_config.sh" ./system-tests/_scripts/launch-cluster.sh
                export CLUSTER_URL=\$(cat /tmp/cluster_url_OSS.txt)
                . scripts/utils/load_auth_env_vars
                DCOS_CLUSTER_SETUP_ACS_TOKEN="\$CLUSTER_AUTH_TOKEN" dcos cluster setup "\$CLUSTER_URL" --provider=dcos-oidc-auth0 --insecure
                npm run test:system
              '''
            }
          }

          post {
            always {
              archiveArtifacts "cypress/**/*"
              junit "cypress/result-system.xml"
              withCredentials([ aws_creds ]) {
                sh "VARIANT=OSS ./system-tests/_scripts/delete-cluster.sh"
              }
            }
          }
        }

        stage("System Test EE") {
          environment {
            REPORT_TO_DATADOG = master_branches.contains(BRANCH_NAME)
          }
          steps {
            withCredentials([ aws_creds, [
              $class: "StringBinding",
              credentialsId: "8667643a-6ad9-426e-b761-27b4226983ea",
              variable: "LICENSE_KEY"
            ]]) {
              sh '''
                export VARIANT=EE
                export DCOS_DIR=/tmp/.dcos-EE
                rsync -aH ./system-tests/ ./system-tests-ee/
                export ADDITIONAL_CYPRESS_CONFIG=",integrationFolder=system-tests-ee"
                INSTALLER_URL="http://downloads.mesosphere.com/dcos-enterprise/testing/master/dcos_generate_config.ee.sh" ./system-tests/_scripts/launch-cluster.sh
                export CLUSTER_URL=\$(cat /tmp/cluster_url_EE.txt)
                . scripts/utils/load_auth_env_vars
                ls -al ./system-tests-ee/
                DCOS_CLUSTER_SETUP_ACS_TOKEN="\$CLUSTER_AUTH_TOKEN" dcos cluster setup "\$CLUSTER_URL" --provider=dcos-users --insecure
                PROXY_PORT=4201 TESTS_FOLDER=system-tests-ee REPORT_DISTRIBUTION='ee' npm run test:system
              '''
            }
          }

          post {
            always {
              archiveArtifacts "cypress/**/*"
              junit "cypress/result-system.xml"
              withCredentials([ aws_creds ]) {
                sh "VARIANT=EE ./system-tests/_scripts/delete-cluster.sh"
              }
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
          string(credentialsId: "1ddc25d8-0873-4b6f-949a-ae803b074e7a", variable: "AWS_ACCESS_KEY_ID"),
          string(credentialsId: "875cfce9-90ca-4174-8720-816b4cb7f10f", variable: "AWS_SECRET_ACCESS_KEY"),
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
