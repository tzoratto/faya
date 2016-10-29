#!groovy

try {
    properties([[$class: 'BuildDiscarderProperty',
                strategy: [$class: 'LogRotator',
                            artifactDaysToKeepStr: '',
                            artifactNumToKeepStr: '30',
                            daysToKeepStr: '',
                            numToKeepStr: '30']
                ]])
    currentBuild.result = "SUCCESS"
    node('linux') {

        stage 'Checkout'

            checkout scm

        stage 'Tests & Reports'

            docker.image('mongo:3.3.6').withRun {c ->
                def nodeHome = tool 'node6'
                withEnv(["MONGO_TEST_URL=mongodb://${containerIp(c)}/faya_test", "PATH+NODE=${nodeHome}/bin"]) {
                    sh "${nodeHome}/bin/node -v"
                    sh "${nodeHome}/bin/npm prune"
                    sh "${nodeHome}/bin/npm install"
                    sh "${nodeHome}/bin/npm run test"
                    sh "${nodeHome}/bin/npm run coverage"
                }
            }

        if (env.BRANCH_NAME == 'master') {

            stage 'Quality analysis'

                archive excludes: 'node_modules/**', includes: '**'
                build job: 'faya-sonar'

            stage 'Build & Push Docker hub'

                docker.withRegistry('https://index.docker.io/v1/', 'docker_hub_tzoratto') {
                    def img = docker.build 'tzoratto/faya:dev'
                    img.push()
                }
        }
    }
}
catch (err) {

    currentBuild.result = "FAILURE"

        mail bcc: '',
        body: "Build number : ${env.BUILD_NUMBER}, error : ${err}. Go to ${env.BUILD_URL}",
        cc: '',
        from: '',
        replyTo: '',
        subject: "${env.JOB_NAME} : pipeline failed",
        to: 'thomas.zoratto@gmail.com'

    throw err
}

def containerIp(container) {
    sh "docker inspect -f {{.NetworkSettings.IPAddress}} ${container.id} > containerIp"
    readFile('containerIp').trim()
}