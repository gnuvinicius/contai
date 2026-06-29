pipeline {
    agent any

    environment {
        AWS_REGION = 'us-east-1'
        ECR_REPOSITORY = 'garage474/contai-service'
        EC2_HOST = 'ec2-user@ec2-52-201-48-83.compute-1.amazonaws.com'
        CONTAINER_NAME = 'contai-service'
        HOST_PORT = '8000'
        NETWORK_NAME = 'contai-network'
        CONTAINER_PORT = '8000'
        IMAGE_TAG = "0.0.${env.BUILD_NUMBER}"
        IMAGE_NAME = "${env.ECR_REPOSITORY}:${env.IMAGE_TAG}"
        POSTGRES_HOST = 'db'
        POSTGRES_PORT = '5432'
    }

    options {
        timestamps()
    }

    stages {
        stage('Build Docker Image') {
            steps {
                sh '''
                    docker version
                    docker build --pull -f Dockerfile -t "$IMAGE_NAME" -t "$ECR_REPOSITORY:latest" .
                '''
            }
        }

        stage('Push Docker Image to ECR') {
            steps {
                withCredentials([
                    string(credentialsId: 'aws-account-id', variable: 'AWS_ACCOUNT_ID'),
                    string(credentialsId: 'aws-access-key-id', variable: 'AWS_ACCESS_KEY_ID'),
                    string(credentialsId: 'aws-secret-access-key', variable: 'AWS_SECRET_ACCESS_KEY')
                ]) {
                    sh '''
                        ECR_REGISTRY="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com"
                        FULL_IMAGE_NAME="$ECR_REGISTRY/$IMAGE_NAME"

                        docker run --rm \
                          -e AWS_ACCESS_KEY_ID="$AWS_ACCESS_KEY_ID" \
                          -e AWS_SECRET_ACCESS_KEY="$AWS_SECRET_ACCESS_KEY" \
                          -e AWS_DEFAULT_REGION="$AWS_REGION" \
                          amazon/aws-cli:latest \
                          ecr describe-repositories --repository-names "$ECR_REPOSITORY" >/dev/null 2>&1 \
                          || docker run --rm \
                          -e AWS_ACCESS_KEY_ID="$AWS_ACCESS_KEY_ID" \
                          -e AWS_SECRET_ACCESS_KEY="$AWS_SECRET_ACCESS_KEY" \
                          -e AWS_DEFAULT_REGION="$AWS_REGION" \
                          amazon/aws-cli:latest \
                          ecr create-repository --repository-name "$ECR_REPOSITORY"

                        docker run --rm \
                          -e AWS_ACCESS_KEY_ID="$AWS_ACCESS_KEY_ID" \
                          -e AWS_SECRET_ACCESS_KEY="$AWS_SECRET_ACCESS_KEY" \
                          -e AWS_DEFAULT_REGION="$AWS_REGION" \
                          amazon/aws-cli:latest \
                          ecr get-login-password \
                          | docker login --username AWS --password-stdin "$ECR_REGISTRY"

                        docker tag "$IMAGE_NAME" "$FULL_IMAGE_NAME"
                        docker tag "$ECR_REPOSITORY:latest" "$ECR_REGISTRY/$ECR_REPOSITORY:latest"
                        docker push "$FULL_IMAGE_NAME"
                        docker push "$ECR_REGISTRY/$ECR_REPOSITORY:latest"
                    '''
                }
            }
        }

        stage('Deploy on EC2') {
            steps {
                withCredentials([
                    string(credentialsId: 'aws-account-id', variable: 'AWS_ACCOUNT_ID'),
                    string(credentialsId: 'aws-access-key-id', variable: 'AWS_ACCESS_KEY_ID'),
                    string(credentialsId: 'aws-secret-access-key', variable: 'AWS_SECRET_ACCESS_KEY'),
                    string(credentialsId: 'postgres-db', variable: 'POSTGRES_DB'),
                    string(credentialsId: 'postgres-user', variable: 'POSTGRES_USER'),
                    string(credentialsId: 'postgres-password', variable: 'POSTGRES_PASSWORD'),
                    string(credentialsId: 'allowed-hosts', variable: 'ALLOWED_HOSTS'),
                    string(credentialsId: 'csrf-trusted-origins', variable: 'CSRF_TRUSTED_ORIGINS'),
                    string(credentialsId: 'openai-api-key', variable: 'OPENAI_API_KEY'),
                    string(credentialsId: 'secret-key', variable: 'SECRET_KEY'),
                    sshUserPrivateKey(credentialsId: 'ec2-ssh-key', keyFileVariable: 'EC2_SSH_KEY')
                ]) {
                    sh '''
                        ECR_REGISTRY="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com"
                        FULL_IMAGE_NAME="$ECR_REGISTRY/$IMAGE_NAME"

                        ssh -i "$EC2_SSH_KEY" -o StrictHostKeyChecking=no "$EC2_HOST" "
                            export AWS_ACCESS_KEY_ID='$AWS_ACCESS_KEY_ID' && \
                            export AWS_SECRET_ACCESS_KEY='$AWS_SECRET_ACCESS_KEY' && \
                            export AWS_DEFAULT_REGION='$AWS_REGION' && \
                            docker run --rm \
                              -e AWS_ACCESS_KEY_ID='$AWS_ACCESS_KEY_ID' \
                              -e AWS_SECRET_ACCESS_KEY='$AWS_SECRET_ACCESS_KEY' \
                              -e AWS_DEFAULT_REGION='$AWS_REGION' \
                              amazon/aws-cli:latest \
                              ecr get-login-password --region '$AWS_REGION' | docker login --username AWS --password-stdin '$ECR_REGISTRY' && \
                            docker pull '$FULL_IMAGE_NAME' && \
                            docker rm -f '$CONTAINER_NAME' || true && \
                            docker run -d --name '$CONTAINER_NAME' \
                                --network '$NETWORK_NAME' \
                                -e POSTGRES_DB='$POSTGRES_DB' \
                                -e POSTGRES_USER='$POSTGRES_USER' \
                                -e POSTGRES_PASSWORD='$POSTGRES_PASSWORD' \
                                -e POSTGRES_HOST='$POSTGRES_HOST' \
                                -e POSTGRES_PORT='$POSTGRES_PORT' \
                                -e ALLOWED_HOSTS='$ALLOWED_HOSTS' \
                                -e CSRF_TRUSTED_ORIGINS='$CSRF_TRUSTED_ORIGINS' \
                                -e OPENAI_API_KEY='$OPENAI_API_KEY' \
                                -e SECRET_KEY='$SECRET_KEY' \
                                --restart unless-stopped -p '$HOST_PORT:$CONTAINER_PORT' '$FULL_IMAGE_NAME'
                        "
                    '''
                }
            }
        }

        stage('Run Production Migrations') {
            steps {
                withCredentials([
                    sshUserPrivateKey(credentialsId: 'ec2-ssh-key', keyFileVariable: 'EC2_SSH_KEY')
                ]) {
                    sh '''
                        ssh -i "$EC2_SSH_KEY" -o StrictHostKeyChecking=no "$EC2_HOST" "
                            docker exec '$CONTAINER_NAME' python manage.py migrate --noinput
                        "
                    '''
                }
            }
        }

        stage('Collect Production Static Files') {
            steps {
                withCredentials([
                    sshUserPrivateKey(credentialsId: 'ec2-ssh-key', keyFileVariable: 'EC2_SSH_KEY')
                ]) {
                    sh '''
                        ssh -i "$EC2_SSH_KEY" -o StrictHostKeyChecking=no "$EC2_HOST" "
                            docker exec '$CONTAINER_NAME' python manage.py collectstatic --noinput
                        "
                    '''
                }
            }
        }
    }
}
