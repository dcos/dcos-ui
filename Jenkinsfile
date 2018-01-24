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

    stage('Debug') {
      parallel {
        stage('Collect') {
          steps {
            sh 'touch collected.txt; while [ ! -f done ]; do echo $(date) >> collected.txt; df -h >> collected.txt; sleep 5; done'
          }
        }
        stage('Run') {
          steps {
            sleep(5)

            sh 'npm --unsafe-perm install'

            sh 'npm run scaffold'
            
            sh 'npm run stylelint'
            
            sh 'npm run eslint'

            sh 'npm run test -- --coverage'

            sh 'echo "done" > done'
          }
        }
      }
    }
  }
}
