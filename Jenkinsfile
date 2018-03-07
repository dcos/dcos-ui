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
          sh '''npm run test -- --maxWorkers=2'''
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
    stage('Tests') {
      parallel {
        stage('Integration Test') {
          agent {
              dockerfile {
                label "mesos-med"
                args  '--shm-size=2g'
              }
          }
          steps {
            sh "ls -la"
            // Run a simple webserver serving the dist folder statically
            // before we run the cypress tests
            writeFile file: 'integration-tests.sh', text: [
              'export PATH=`pwd`/node_modules/.bin:$PATH',
              'http-server -p 4200 dist&',
              'SERVER_PID=$!',
              './scripts/ci/run-integration-tests',
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
              junit 'cypress/results.xml'
            }
          }
        }

        stage('System Test') {
          agent {
              dockerfile {
                label "mesos-med"
                args  '--shm-size=2g'
              }
          }
          steps {
            withCredentials([
                [
                  $class: 'AmazonWebServicesCredentialsBinding',
                  credentialsId: 'f40eebe0-f9aa-4336-b460-b2c4d7876fde',
                  accessKeyVariable: 'AWS_ACCESS_KEY_ID',
                  secretKeyVariable: 'AWS_SECRET_ACCESS_KEY'
                ]
              ]) {
            unstash 'dist'

              ansiColor('xterm') {
                retry(2) {
                  sh '''dcos-system-test-driver -j1 -v ./system-tests/driver-config/jenkins.sh'''
                }
              }
            }
          }
          post {
            always {
              archiveArtifacts 'results/**/*'
              junit 'results/results.xml'
            }
          }
        }
      }
    }
  }
}
