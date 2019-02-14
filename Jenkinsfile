#!/usr/bin/env groovy

@Library("sec_ci_libs@v2-latest") _

def master_branches = ["master", ] as String[]

pipeline {
  agent {
    label 'dcos-ui' 
  }

  environment {
    JENKINS_VERSION = "yes"
    NODE_PATH = "node_modules"
    INSTALLER_URL= "https://downloads.dcos.io/dcos/testing/master/dcos_generate_config.sh"
  }

  options {
    timeout(time: 4, unit: "HOURS")
    disableConcurrentBuilds()
  }

  stages {
    stage("Build") {
      steps {
        withCredentials([
          usernamePassword(credentialsId: "a7ac7f84-64ea-4483-8e66-bb204484e58f", passwordVariable: "GIT_PASSWORD", usernameVariable: "GIT_USER")
        ]) {
          // Clone the repository again with a full git clone
          sh "rm -rf {.*,*} || ls -la && git clone https://\$GIT_USER:\$GIT_PASSWORD@github.com/dcos/dcos-ui.git ."
        }
        sh "git fetch"
        sh "git checkout \"\$([ -z \"\$CHANGE_BRANCH\" ] && echo \$BRANCH_NAME || echo \$CHANGE_BRANCH )\""

        // This is entered to update node + npm as part of a test
        // TODO: update main image
        sh "curl -o- https://nodejs.org/dist/v8.9.4/node-v8.9.4-linux-x64.tar.gz | tar -C /usr/local --strip-components=1 -zx"
        sh "npm install -g npm@5.7.1"
        sh "npm run validate-tests"
        sh "npm --unsafe-perm ci"
        sh "npm run build"
      }
    }


    stage("Lint Commits") {
      when {
        expression {
          !master_branches.contains(BRANCH_NAME)
        }
      }

      steps {
        sh 'npm run commitlint -- --from "${CHANGE_TARGET}"'
      }
    }

    stage("Tests") {
      parallel {
        stage("Integration Test") {
          environment {
            REPORT_TO_DATADOG = master_branches.contains(BRANCH_NAME)
          }
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
                credentialsId: "a20fbd60-2528-4e00-9175-ebe2287906cf",
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


  }

}
