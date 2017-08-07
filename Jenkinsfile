#!/usr/bin/env groovy
pipeline {
  agent {
     dockerfile true
  }

  environment {
    JENKINS_VERSION = 'yes'
    NODE_PATH = 'node_modules'
  }

  stages {

    stage('Initialization') {
      steps {
        ansiColor('xterm') {
          echo 'Setting-up environment...'

          // Install might fail with 'unexpected eof'
          retry(2) {
            sh '''npm --unsafe-perm install'''
          }

          // Install npm dependencies
          sh '''npm run scaffold'''
        }
      }
    }

    stage('Lint') {
      steps {
        ansiColor('xterm') {
          sh ''''npm run lint'''
        }
      }
    }

    stage('Unit Tests') {
      steps {
        ansiColor('xterm') {
          sh '''npm run test'''
        }

        junit 'jest/test-results/*.xml'
      }
    }

    stage('Build') {
      steps {
        ansiColor('xterm') {
          sh '''npm run build-assets'''
        }
        stash includes: 'dist/*', name: 'dist'
      }
    }

    stage('Integration Tests') {
      steps {

        unstash 'dist'

        // Run a simple webserver serving the dist folder statically
        // before we run the cypress tests
        writeFile file: 'integration-tests.sh', text: [
          'export PATH=`pwd`/node_modules/.bin:$PATH',
          'http-server -p 4200 dist&',
          'SERVER_PID=$!',
          'cypress run --reporter junit --reporter-options \'mochaFile=cypress/results.xml\'',
          'RET=$?',
          'kill $SERVER_PID',
          'exit $RET'
        ].join('\n')

        ansiColor('xterm') {
          retry(2) {
            sh '''bash integration-tests.sh'''
          }
        }

        archiveArtifacts 'cypress/**/*'
        junit 'cypress/*.xml'
      }
    }

    stage('System Tests') {
      steps {

        withCredentials(
          [
            string(
              credentialsId: '8e2b2400-0f14-4e4d-b319-e1360f97627d',
              variable: 'CCM_AUTH_TOKEN'
            )
          ]
        ) {
          echo 'Running integration tests..'
          unstash 'dist'

          // Run the `dcos-system-test-driver` locally, that will use
          // the .systemtest-dev.sh bootstrap config and provision a
          // cluster for the test.
          ansiColor('xterm') {
            retry(2) {
              sh '''dcos-system-test-driver -v ./system-tests/driver-config/jenkins.sh'''
            }
          }
        }
        archiveArtifacts 'results/**/*'
        junit 'results/results.xml'
      }
    }
  }
}
