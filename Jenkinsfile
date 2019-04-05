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

        // jenkins seem to have this variable set for no reason, explicitly removing it…
        sh "npm config delete externalplugins"
      }
    }

    stage("Setup System Test Cluster") {
      steps {
        withCredentials([
          [
            $class: "AmazonWebServicesCredentialsBinding",
            credentialsId: "f40eebe0-f9aa-4336-b460-b2c4d7876fde",
            accessKeyVariable: "AWS_ACCESS_KEY_ID",
            secretKeyVariable: "AWS_SECRET_ACCESS_KEY"
          ]
        ]) {
          sh '''
            ./system-tests/_scripts/launch-cluster.sh
          '''
          }
      }
    }

    stage("Install") {
      steps {
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

    stage("Build") {
      steps {
        sh "npm run build"
      }
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

    stage("Test") {
      parallel {
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
              sh '''
                export CLUSTER_URL=\$(cat /tmp/cluster_url.txt)
                export CLUSTER_AUTH_TOKEN=\$(./system-tests/_scripts/get_cluster_auth.sh)
                export CLUSTER_AUTH_INFO=\$(echo '{ "uid": "albert@bekstil.net", "description": "albert" }' | base64)
                DCOS_CLUSTER_SETUP_ACS_TOKEN="\$CLUSTER_AUTH_TOKEN" dcos cluster setup "\$CLUSTER_URL" --provider=dcos-oidc-auth0 --insecure
                npm run test:system
              '''
            }
          }
        }
      }

      post {
        always {
          archiveArtifacts "results/**/*"
          junit "results/results.xml"
          withCredentials([
            [
              $class: "AmazonWebServicesCredentialsBinding",
              credentialsId: "f40eebe0-f9aa-4336-b460-b2c4d7876fde",
              accessKeyVariable: "AWS_ACCESS_KEY_ID",
              secretKeyVariable: "AWS_SECRET_ACCESS_KEY"
            ]
          ]) {
            sh "./system-tests/_scripts/delete-cluster.sh"
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
          sh "npm run release"
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
    always {
      withCredentials([
        [
          $class: "AmazonWebServicesCredentialsBinding",
          credentialsId: "f40eebe0-f9aa-4336-b460-b2c4d7876fde",
          accessKeyVariable: "AWS_ACCESS_KEY_ID",
          secretKeyVariable: "AWS_SECRET_ACCESS_KEY"
        ]
      ]) {
        sh "./system-tests/_scripts/delete-cluster.sh"
      }
    }

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
