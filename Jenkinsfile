#!/usr/bin/env groovy

@Library('sec_ci_libs@v2-latest') _

def master_branches = ["master", ] as String[]

pipeline {
  agent none

  environment {
    JENKINS_VERSION       = 'YES'
    AWS_ACCESS_KEY_ID     = credentials('3f0dbb48-de33-431f-b91c-2366d2f0e1cf')
    AWS_SECRET_ACCESS_KEY = credentials('f585ec9a-3c38-4f67-8bdb-79e5d4761937')
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
    stage('Execute') {
      agent {
        dockerfile true
      }
      steps {
        sh 'node --version'
      }
    }
  }
}
