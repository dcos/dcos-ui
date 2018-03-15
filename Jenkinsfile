#!/usr/bin/env groovy

@Library('sec_ci_libs@v2-latest') _

def master_branches = ["master", ] as String[]

pipeline {
  agent {
    dockerfile {
      args  '--shm-size=2g'
    }
  }

  environment {
    JENKINS_VERSION = 'yes'
    NODE_PATH = 'node_modules'
    INSTALLER_URL= 'https://downloads.dcos.io/dcos/testing/master/dcos_generate_config.sh'
  }

  options {
    timeout(time: 3, unit: 'HOURS')
  }

  stages {
    stage('Authorization') {
      steps {
        user_is_authorized(master_branches, '8b793652-f26a-422f-a9ba-0d1e47eb9d89', '#frontend-dev')
      }
    }

    stage('Initialization') {
      steps {
        ansiColor('xterm') {
          retry(2) {
            sh '''npm --unsafe-perm install'''
          }

          sh '''npm run scaffold'''
        }
      }
    }

    // stage('Lint') {
    //   steps {
    //     ansiColor('xterm') {
    //       sh '''npm run lint'''
    //     }
    //   }
    // }

    // stage('Unit Test') {
    //   steps {
    //     ansiColor('xterm') {
    //       sh '''npm run test -- --maxWorkers=2'''
    //     }
    //   }
    // }

    stage('Build') {
      steps {
        ansiColor('xterm') {
          sh '''npm run build-assets'''
        }
      }

      post {
        always {
          stash includes: 'dist/*', name: 'dist'
        }
      }
    }

    // stage('Integration Test') {
    //   steps {
    //     // Run a simple webserver serving the dist folder statically
    //     // before we run the cypress tests
    //     writeFile file: 'integration-tests.sh', text: [
    //       'export PATH=`pwd`/node_modules/.bin:$PATH',
    //       'http-server -p 4200 dist&',
    //       'SERVER_PID=$!',
    //       './scripts/ci/run-integration-tests',
    //       'RET=$?',
    //       'echo "cypress exit status: ${RET}"',
    //       'sleep 10',
    //       'echo "kill server"',
    //       'kill $SERVER_PID',
    //       'exit $RET'
    //     ].join('\n')

    //     unstash 'dist'

    //     ansiColor('xterm') {
    //       retry(2) {
    //         sh '''bash integration-tests.sh'''
    //       }
    //     }
    //   }

    //   post {
    //     always {
    //       archiveArtifacts 'cypress/**/*'
    //       junit 'cypress/results.xml'
    //     }
    //   }
    // }

    // stage('System Test') {
    //  steps {
    //    withCredentials([
    //       [
    //         $class: 'AmazonWebServicesCredentialsBinding',
    //         credentialsId: 'f40eebe0-f9aa-4336-b460-b2c4d7876fde',
    //         accessKeyVariable: 'AWS_ACCESS_KEY_ID',
    //         secretKeyVariable: 'AWS_SECRET_ACCESS_KEY'
    //       ]
    //     ]) {
    //      unstash 'dist'

    //      ansiColor('xterm') {
    //        retry(2) {
    //          sh '''dcos-system-test-driver -j1 -v ./system-tests/driver-config/jenkins.sh'''
    //        }
    //      }
    //    }
    //  }

    //  post {
    //    always {
    //      archiveArtifacts 'results/**/*'
    //      junit 'results/results.xml'
    //    }
    //  }
    // }

    // when env.BRANCH_NAME == 'master', we will update the mesosphere:dcos-ui/latest branch
    // when env.BRANCH_NAME =~ /(tag-name-regex)/, we will open a release PR against dcos/dcos
    stage('Upload Build') {
      when {
        expression { env.BRANCH_NAME == 'master' || env.BRANCH_NAME =~ /^v?(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(-(0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(\.(0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*)?(\+[0-9a-zA-Z-]+(\.[0-9a-zA-Z-]+)*)?/ }
      }

      steps {
        withCredentials([
            string(credentialsId: '3f0dbb48-de33-431f-b91c-2366d2f0e1cf',variable: 'AWS_ACCESS_KEY_ID'),
            string(credentialsId: 'f585ec9a-3c38-4f67-8bdb-79e5d4761937',variable: 'AWS_SECRET_ACCESS_KEY')
        ]) {
          sh "BRANCH_NAME=${env.BRANCH_NAME} ./scripts/ci/upload-build"
        }
      }

      post {
        always {
          archiveArtifacts 'buildinfo.json'
        }
      }
    }

    stage('Update Github'){
      when {
        expression { env.BRANCH_NAME == 'master' || env.BRANCH_NAME =~ /^v?(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(-(0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(\.(0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*)?(\+[0-9a-zA-Z-]+(\.[0-9a-zA-Z-]+)*)?/ }
      }

      steps {
        withCredentials([
          usernamePassword(credentialsId: 'a7ac7f84-64ea-4483-8e66-bb204484e58f', passwordVariable: 'GIT_PASSWORD', usernameVariable: 'GIT_USER')
        ]) {
          sh "GIT_PASSWORD=${GIT_PASSWORD} GIT_USER=${GIT_USER} ./scripts/ci/update-github"
        }
      }
    }
  }
}
