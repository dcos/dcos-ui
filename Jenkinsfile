#!/usr/bin/env groovy

@Library("sec_ci_libs@v2-latest") _

def master_branches = ["master", ] as String[]
def slack_creds = string(credentialsId: "8b793652-f26a-422f-a9ba-0d1e47eb9d89", variable: "SLACK_TOKEN")
def aws_creds = [ $class: "AmazonWebServicesCredentialsBinding", credentialsId: "f40eebe0-f9aa-4336-b460-b2c4d7876fde", accessKeyVariable: "AWS_ACCESS_KEY_ID", secretKeyVariable: "AWS_SECRET_ACCESS_KEY" ]

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
        stage("Check Translations") {
          steps { sh "npm run util:lingui:check" }
        }
      }
    }

    stage("Test current versions") {
      parallel {
        stage("Unit Tests") {
          // at this point we already ran tslint and the typecheck, see above!
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
            DCOS_DIR = "/tmp/.dcos-OSS"
            REPORT_TO_DATADOG = master_branches.contains(BRANCH_NAME)
            TF_VAR_variant = "open"
          }
          steps {
            withCredentials([ aws_creds ]) {
              sh '''
                export TF_VAR_cluster_name="ui-\$(date +%s)"
                echo $TF_VAR_cluster_name > /tmp/cluster_name-open
                export CLUSTER_URL=$(cd scripts/terraform && ./up.sh | tail -n1)

                . scripts/utils/load_auth_env_vars
                DCOS_CLUSTER_SETUP_ACS_TOKEN="\$CLUSTER_AUTH_TOKEN" dcos cluster setup "\$CLUSTER_URL" --provider=dcos-oidc-auth0 --insecure
                npm run test:system
              '''
            }
          }

          post {
            always {
              withCredentials([ aws_creds ]) {
                sh '''
                  export TF_VAR_cluster_name=$(cat /tmp/cluster_name-open)
                  cd scripts/terraform && ./down.sh
                '''
              }
              archiveArtifacts "cypress/**/*"
              junit "cypress/result-system.xml"
            }
          }
        }

        stage("System Test EE") {
          environment {
            DCOS_DIR = "/tmp/.dcos-EE"
            REPORT_TO_DATADOG = master_branches.contains(BRANCH_NAME)
            TF_VAR_variant = "ee"
          }
          steps {
            withCredentials([ aws_creds, string(credentialsId: "8667643a-6ad9-426e-b761-27b4226983ea", variable: "LICENSE_KEY")]) {
              sh '''
                export TF_VAR_license_key="$LICENSE_KEY"
                export TF_VAR_cluster_name="ui-\$(date +%s)-$TF_VAR_variant"
                echo $TF_VAR_cluster_name > /tmp/cluster_name-ee
                rsync -aH ./system-tests/ ./system-tests-ee/
                rsync -aH ./scripts/terraform/ ./scripts/terraform-ee/
                export CLUSTER_URL=$(cd scripts/terraform-ee && ./up.sh | tail -n1)

                . scripts/utils/load_auth_env_vars

                DCOS_CLUSTER_SETUP_ACS_TOKEN="\$CLUSTER_AUTH_TOKEN" dcos cluster setup "\$CLUSTER_URL" --provider=dcos-users --insecure
                export ADDITIONAL_CYPRESS_CONFIG=",integrationFolder=system-tests-ee"
                PROXY_PORT=4201 TESTS_FOLDER=system-tests-ee REPORT_DISTRIBUTION='ee' npm run test:system
              '''
            }
          }

          post {
            always {
              withCredentials([ aws_creds ]) {
                sh '''
                  export TF_VAR_cluster_name=$(cat /tmp/cluster_name-ee)
                  cd scripts/terraform-ee && ./down.sh
                '''
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
