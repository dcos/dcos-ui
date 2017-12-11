#!/usr/bin/env groovy
pipeline {
  agent {
    dockerfile {
      args  '--shm-size=1g'
    }
  }

  environment {
    JENKINS_VERSION = 'yes'
    NODE_PATH = 'node_modules'
  }

  options {
    timeout(time: 1, unit: 'HOURS')
  }

  stages {
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


//    stage('System Test') {
//      steps {
//        withCredentials(
//          [
//            string(
//              credentialsId: '8e2b2400-0f14-4e4d-b319-e1360f97627d',
//              variable: 'CCM_AUTH_TOKEN'
//            )
//          ]
//        ) {
//          unstash 'dist'
//
//          ansiColor('xterm') {
//            retry(2) {
//              sh '''dcos-system-test-driver -v ./system-tests/driver-config/jenkins.sh'''
//            }
//          }
//        }
//
//      }
//
//      post {
//        always {
//          archiveArtifacts 'results/**/*'
//          junit 'results/results.xml'
//        }
//      }
//    }
  }
}
