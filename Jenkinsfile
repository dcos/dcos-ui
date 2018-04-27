#!/usr/bin/env groovy

@Library('sec_ci_libs@v2-latest') _

def master_branches = ["release/1.11"] as String[]

pipeline {
  agent {
    dockerfile {
      args  '--shm-size=2g'
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
        unstash 'dist'
        sh "npm run integration-tests"
      }

      post {
        always {
          archiveArtifacts 'cypress/**/*'
          junit 'cypress/results.xml'
        }
      }
    }
  }
}
