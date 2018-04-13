#!/usr/bin/env groovy

@Library('sec_ci_libs@v2-latest') _

def release_branches = ["master", ] as String[]

pipeline {
  agent {
    dockerfile {
      args  '--shm-size=2g'
    }
  }

  parameters {
    booleanParam(defaultValue: false, description: 'Create release and bump package version in DC/OS', name: 'CREATE_RELEASE')
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
        user_is_authorized(release_branches, '8b793652-f26a-422f-a9ba-0d1e47eb9d89', '#frontend-dev')
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
          sh "npm run validate-build"
          sh "tar czf release.tar.gz dist"
        }
      }

      post {
        always {
          stash includes: 'dist/*', name: 'dist'
          stash includes: 'release.tar.gz', name: 'release'
        }
      }
    }

    stage("Tests") {
      parallel {
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

        stage('System Test') {
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

    // Upload the current master as "latest" to s3
    // and update the corresponding DC/OS branch:
    // For Example:
    // - dcos-ui/master/dcos-ui-latest
    // - dcos-ui/1.12/dcos-ui-latest
    stage('Release Latest') {
      when {
        expression {
          release_branches.contains(BRANCH_NAME)
        }
      }

      steps {
        withCredentials([
            string(credentialsId: '3f0dbb48-de33-431f-b91c-2366d2f0e1cf',variable: 'AWS_ACCESS_KEY_ID'),
            string(credentialsId: 'f585ec9a-3c38-4f67-8bdb-79e5d4761937',variable: 'AWS_SECRET_ACCESS_KEY'),
            usernamePassword(credentialsId: 'a7ac7f84-64ea-4483-8e66-bb204484e58f', passwordVariable: 'GIT_PASSWORD', usernameVariable: 'GIT_USER')
        ]) {
          sh "git config --global user.email $GIT_USER@users.noreply.github.com"
          sh "git config --global user.name 'MesosphereCI Robot'"
          sh "git config credential.helper 'cache --timeout=300'"

          sh "FORCE_UPLOAD=1 ./scripts/ci/release-latest"
        }
      }

      post {
        always {
          archiveArtifacts 'buildinfo.json'
        }
      }
    }

    stage('Release Version'){
      when {
        expression {
          release_branches.contains(BRANCH_NAME) && params.CREATE_RELEASE == true
        }
      }

      steps {
        withCredentials([
            string(credentialsId: '3f0dbb48-de33-431f-b91c-2366d2f0e1cf',variable: 'AWS_ACCESS_KEY_ID'),
            string(credentialsId: 'f585ec9a-3c38-4f67-8bdb-79e5d4761937',variable: 'AWS_SECRET_ACCESS_KEY'),
            usernamePassword(credentialsId: 'a7ac7f84-64ea-4483-8e66-bb204484e58f', passwordVariable: 'GIT_PASSWORD', usernameVariable: 'GIT_USER')
        ]) {
          sh "git config --global user.email $GIT_USER@users.noreply.github.com"
          sh "git config --global user.name 'MesosphereCI Robot'"
          sh "git config credential.helper 'cache --timeout=300'"

          sh "CREATE_RELEASE=1 PUSH_RELEASE=1 ./scripts/ci/bump-version"

          sh "./scripts/ci/release-version"
        }
      }
    }
  }
}
