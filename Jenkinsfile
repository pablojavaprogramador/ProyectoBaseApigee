pipeline {
    parameters {
       choice(name: 'env', choices: ['test', 'prod'], description: 'Pick environment')
    }

    agent {
      dockerfile true
    }

    environment {
        APIGEE_CREDS = credentials('apigee')
        APIGEE_DEVPORTAL_CREDS = credentials('apigee-devportal')
        HOME = '.'
    }

    stages {
        stage('Clean') {
            steps {
              script{
                if (env.GIT_BRANCH == "master") {
                    env.APIGEE_PREFIX = ""
                    env.APIGEE_PROFILE = "test"
                } else if (env.GIT_BRANCH == "prod") {
                    env.APIGEE_PREFIX = ""
                    env.APIGEE_PROFILE = "prod"
                } else { //feature branches
                    env.APIGEE_PREFIX = "jenkins"
                    env.APIGEE_PROFILE = "test"
                }
              }
              sh "mvn clean"
            }
        }
        stage('Static Code Analysis, Unit Test and Coverage') {
            steps {
              sh "mvn -ntp test -P${env.APIGEE_PROFILE} -Ddeployment.suffix=${env.APIGEE_PREFIX} -Dcommit=${env.GIT_COMMIT} -Dbranch=${env.GIT_BRANCH} -Duser.name=jenkins"
            }
        }
        stage('Configurations') {
            steps {
              sh "mvn -ntp apigee-config:keyvaluemaps apigee-config:targetservers apigee-config:caches -P${env.APIGEE_PROFILE} -Dusername=${APIGEE_CREDS_USR} -Dpassword=${APIGEE_CREDS_PSW} -Dapigee.config.options=update -Dapigee.config.dir=${WORKSPACE}/resources/edge"
            }
        }
        stage('Package proxy bundle') {
            steps { 
              sh "mvn -ntp apigee-enterprise:configure -P${env.APIGEE_PROFILE} -Ddeployment.suffix=${env.APIGEE_PREFIX}"
            }
        }
        stage('Deploy proxy bundle') {
            steps {
              sh "mvn -ntp apigee-enterprise:deploy -P${env.APIGEE_PROFILE} -Ddeployment.suffix=${env.APIGEE_PREFIX} -Dusername=${APIGEE_CREDS_USR} -Dpassword=${APIGEE_CREDS_PSW}"
            }
        }
        stage('Functional Test') {
          steps {
            sh "node ./node_modules/cucumber/bin/cucumber.js target/test/integration/features --format json:target/reports.json"
          }
        }
    }

    post { 
        always {
            publishHTML(target: [
                                  allowMissing: false,
                                  alwaysLinkToLastBuild: false,
                                  keepAll: false,
                                  reportDir: "coverage/lcov-report",
                                  reportFiles: 'index.html',
                                  reportName: 'HTML Report'
                                ]
                        )

            step([
                    $class: 'CucumberReportPublisher',
                    fileExcludePattern: '',
                    fileIncludePattern: "**/reports.json",
                    ignoreFailedTests: false,
                    jenkinsBasePath: '',
                    jsonReportDirectory: "target",
                    missingFails: false,
                    parallelTesting: false,
                    pendingFails: false,
                    skippedFails: false,
                    undefinedFails: false
                    ])
        }
        /*success {
            script{
                if (env.GIT_BRANCH == "master") {
                    //dev portal
                    sh "mvn -ntp install -Pdevportal -Dportal.username=${APIGEE_DEVPORTAL_CREDS_USR} -Dportal.password=${APIGEE_DEVPORTAL_CREDS_PSW} -Dapigee.smartdocs.config.options=update -f pom-devportal.xml"
                }
            }
            
        }*/
    }
}