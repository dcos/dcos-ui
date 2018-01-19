#!/usr/bin/env groovy
pipeline {
  agent {
    dockerfile {
      args '--shm-size=2g'
    }
  }

  environment {
    JENKINS_VERSION = 'yes'
    NODE_PATH = 'node_modules'
  }

  options {
    timeout(time: 3, unit: 'HOURS')
  }



  stages {
    wrap([$class: 'MesosSingleUseSlave']) {
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

      stage('Lint') {
        steps {
          ansiColor('xterm') {
            sh '''npm run lint'''
          }
        }
      }

      stage('Unit Test') {
        steps {
          ansiColor('xterm') {
            sh '''npm run test -- --coverage'''
          }
        }

        post {
          always {
            junit 'jest/test-results/*.xml'
            step([$class             : 'CoberturaPublisher',
                  autoUpdateHealth   : false,
                  autoUpdateStability: false,
                  coberturaReportFile: 'coverage/cobertura-coverage.xml',
                  failUnhealthy      : true,
                  failUnstable       : true,
                  maxNumberOfBuilds  : 0,
                  onlyStable         : false,
                  sourceEncoding     : 'ASCII',
                  zoomCoverageChart  : false])
          }
        }
      }

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

      stage('Integration Test') {
        steps {
          // Run a simple webserver serving the dist folder statically
          // before we run the cypress tests
          writeFile file: 'integration-tests.sh', text: [
            'export PATH=`pwd`/node_modules/.bin:$PATH',
            'http-server -p 4200 dist&',
            'SERVER_PID=$!',
            'cypress run --reporter junit --reporter-options \'mochaFile=cypress/results.xml\'',
            'RET=$?',
            'echo "cypress exit status: ${RET}"',
            'sleep 10',
            'echo "kill server"',
            'kill $SERVER_PID',
            'exit $RET'
          ].join('\n')

          unstash 'dist'

          ansiColor('xterm') {
            retry(2) {
              sh '''bash integration-tests.sh'''
            }
          }
        }

        post {
          always {
            archiveArtifacts 'cypress/**/*'
            junit 'cypress/*.xml'
          }
        }
      }
    }
  }
}
