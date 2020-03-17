#!/usr/bin/env groovy

@Library("sec_ci_libs@v2-latest") _

def master_branches = ["master", ] as String[]
def slack_creds = string(credentialsId: "8b793652-f26a-422f-a9ba-0d1e47eb9d89", variable: "SLACK_TOKEN")
def aws_id = string(credentialsId: "1ddc25d8-0873-4b6f-949a-ae803b074e7a", variable: "AWS_ACCESS_KEY_ID")
def aws_key = string(credentialsId: "875cfce9-90ca-4174-8720-816b4cb7f10f", variable: "AWS_SECRET_ACCESS_KEY")


pipeline {
  agent {
    dockerfile {
      args  "--shm-size=2g"
    }
  }

  stages {
    stage("Authorization") {
      steps {
        user_is_authorized(master_branches, "8b793652-f26a-422f-a9ba-0d1e47eb9d89", "#frontend-dev")
      }
    }

    stage("Prepare Repository") {
      steps {
        // clean up existing files
        sh "rm -rfv .* || ls -la ; rm -rfv ./* || ls -la"

        // cloning oss repo, we need this for commit history
        withCredentials([
          usernamePassword(credentialsId: "a7ac7f84-64ea-4483-8e66-bb204484e58f", passwordVariable: "GIT_PASSWORD", usernameVariable: "GIT_USER")
        ]) {
          sh "git clone https://\$GIT_USER:\$GIT_PASSWORD@github.com/dcos/dcos-ui.git ."
        }
        sh "git fetch -a"

        // checking out correct branch
        sh 'git checkout "$([ -z "$CHANGE_BRANCH" ] && echo $BRANCH_NAME || echo $CHANGE_BRANCH )"'

        // when on PR rebase to target
        sh '[ -z "$CHANGE_TARGET" ] && echo "on release branch" || git rebase origin/${CHANGE_TARGET}'
      }
    }


    stage("System Test EE") {
      steps {
        withCredentials([ aws_id, aws_key,
          string(credentialsId: "8667643a-6ad9-426e-b761-27b4226983ea", variable: "LICENSE_KEY")
        ]) {
          sh '''
            export TF_VAR_variant=ee
            export TF_VAR_license_key="$LICENSE_KEY"
            export TF_VAR_cluster_name="ui-\$(date +%s)"
            echo $TF_VAR_cluster_name > /tmp/cluster_name-ee
            rsync -aH ./system-tests/ ./system-tests-ee/

            export CLUSTER_URL=$(cd scripts/terraform && ./up.sh | tail -n1)

            . scripts/utils/load_auth_env_vars
            ls -al ./system-tests-ee/
            DCOS_CLUSTER_SETUP_ACS_TOKEN="\$CLUSTER_AUTH_TOKEN" dcos cluster setup "\$CLUSTER_URL" --provider=dcos-users --insecure
            export ADDITIONAL_CYPRESS_CONFIG=",integrationFolder=system-tests-ee"
            PROXY_PORT=4201 TESTS_FOLDER=system-tests-ee REPORT_DISTRIBUTION='ee' npm run test:system
          '''
        }
      }

      post {
        always {
          // archiveArtifacts "cypress/**/*"
          // junit "cypress/result-system.xml"
          withCredentials([ aws_id, aws_key ]) {
            sh '''
              export TF_VAR_variant=ee
              export TF_VAR_license_key="$LICENSE_KEY"
              export TF_VAR_cluster_name=$(cat /tmp/cluster_name-ee)
              cd scripts/terraform && ./down.sh
            '''
          }
        }
      }
    }
  }
}
