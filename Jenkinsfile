pipeline {
    agent any

    parameters {
        string(defaultValue: 'main', description: '', name: 'branch')
    }

    stages {
        stage('Checkout code') {
            steps {
                git branch: params.branch,
                credentialsId: 'GutHub',
                url: 'https://github.com/adamsjoe/SZ_Test.git'
            }
        }

        stage('Install Dependancies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Run Tests') {
            steps {
                sh 'npm runScript allTests'
            }
        }        
    }

    post {
        always {
            publishHTML( target:
                [allowMissing: false, 
                alwaysLinkToLastBuild: false, 
                keepAll: true, 
                reportDir: 'playwright-report', 
                reportFiles: 'index.html', 
                reportName: 'HTML Report']
            )            
        }
    }
}