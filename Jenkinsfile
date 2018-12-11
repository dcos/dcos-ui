#!/usr/bin/env groovy

@Library("sec_ci_libs@v2-latest") _

def master_branches = ["master", ] as String[]

pipeline {
  agent {
    dockerfile {
      args  "--shm-size=1g"
    }
  }

  environment {
    JENKINS_VERSION = "yes"
    NODE_PATH = "node_modules"
    INSTALLER_URL= "https://downloads.dcos.io/dcos/testing/master/dcos_generate_config.sh"
  }

  options {
    timeout(time: 3, unit: "HOURS")
    disableConcurrentBuilds()
  }

  stages {
    stage("Authorization") {
      steps {
        user_is_authorized(master_branches, "8b793652-f26a-422f-a9ba-0d1e47eb9d89", "#frontend-dev")
      }
    }

    stage("Build") {
      steps {
        sh "npm --unsafe-perm install"
        sh "npm run build"
      }
    }

    stage("Tests") {
      parallel {
        stage("Integration Test") {
          steps {
            sh "npm run integration-tests"
          }

          post {
            always {
              archiveArtifacts "cypress/**/*"
              // We currently want flaky test runs be marked as success
              // junit "cypress/results.xml"
            }
          }
        }

        stage("System Test") {
          steps {
            withCredentials([
              [
                $class: "AmazonWebServicesCredentialsBinding",
                credentialsId: "f40eebe0-f9aa-4336-b460-b2c4d7876fde",
                accessKeyVariable: "AWS_ACCESS_KEY_ID",
                secretKeyVariable: "AWS_SECRET_ACCESS_KEY"
              ]
            ]) {
              retry(3) {
                sh "dcos-system-test-driver -j1 -v ./system-tests/driver-config/jenkins.sh"
              }
            }
          }

          post {
            always {
              archiveArtifacts "results/**/*"
              junit "results/results.xml"
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
          string(credentialsId: "3f0dbb48-de33-431f-b91c-2366d2f0e1cf",variable: "AWS_ACCESS_KEY_ID"), // upload-build
          string(credentialsId: "f585ec9a-3c38-4f67-8bdb-79e5d4761937",variable: "AWS_SECRET_ACCESS_KEY"), // upload-build
          usernamePassword(credentialsId: "a7ac7f84-64ea-4483-8e66-bb204484e58f", passwordVariable: "GIT_PASSWORD", usernameVariable: "GIT_USER"), // update-dcos-repo
          usernamePassword(credentialsId: "6c147571-7145-410a-bf9c-4eec462fbe02", passwordVariable: "JIRA_PASS", usernameVariable: "JIRA_USER") // semantic-release-jira
        ]) {
          sh "npx semantic-release"
        }
      }
    }

    stage("Publish Universe") {
      when {
        expression {
          master_branches.contains(BRANCH_NAME)
        }
      }
      steps {
        withCredentials([
          string(credentialsId: "1ddc25d8-0873-4b6f-949a-ae803b074e7a", variable: "AWS_ACCESS_KEY_ID"),
          string(credentialsId: "875cfce9-90ca-4174-8720-816b4cb7f10f", variable: "AWS_SECRET_ACCESS_KEY"),
        ]) {
          sh "git clone https://github.com/mesosphere/dcos-commons.git ../dcos-commons"
          sh "tar czf release.tar.gz dist"
          sh "S3_BUCKET='dcos-ui-universe' S3_DIR_PATH='oss' S3_DIR_NAME='latest' ../dcos-commons/tools/build_package.sh 'dcos-ui' ./ -a ./release.tar.gz aws"
        }
      }
    }

    stage("Run Enterprise Pipeline") {
      when {
        expression {
          master_branches.contains(BRANCH_NAME)
        }
      }
      steps {
        build job: "frontend/dcos-ui-ee-pipeline/" + env.BRANCH_NAME.replaceAll("/", "%2F"), wait: false
      }
    }
  }

  post {
    failure {
      withCredentials([
        string(credentialsId: "8b793652-f26a-422f-a9ba-0d1e47eb9d89", variable: "SLACK_TOKEN")
      ]) {
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
      withCredentials([
        string(credentialsId: "8b793652-f26a-422f-a9ba-0d1e47eb9d89", variable: "SLACK_TOKEN")
      ]) {
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
