#!/bin/bash
set -e

# Configuration
AWS_REGION="eu-central-1"
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ECR_REPO_NAME="monitoring-dashboard-grafana"
IMAGE_TAG="latest"
FUNCTION_NAME="monitoring-dashboard-grafana"

echo "=== Deploying Grafana to AWS Lambda ==="
echo "Region: $AWS_REGION"
echo "Account: $AWS_ACCOUNT_ID"

# Step 1: Create ECR repository if it doesn't exist
echo ""
echo "Step 1: Creating ECR repository..."
aws ecr describe-repositories --repository-names $ECR_REPO_NAME --region $AWS_REGION 2>/dev/null || \
  aws ecr create-repository \
    --repository-name $ECR_REPO_NAME \
    --region $AWS_REGION \
    --image-scanning-configuration scanOnPush=true

# Step 2: Login to ECR
echo ""
echo "Step 2: Logging into ECR..."
aws ecr get-login-password --region $AWS_REGION | \
  docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

# Step 3: Build Docker image
echo ""
echo "Step 3: Building Docker image..."
docker build --platform linux/amd64 -t $ECR_REPO_NAME:$IMAGE_TAG .

# Step 4: Tag image for ECR
echo ""
echo "Step 4: Tagging image..."
docker tag $ECR_REPO_NAME:$IMAGE_TAG \
  $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO_NAME:$IMAGE_TAG

# Step 5: Push to ECR
echo ""
echo "Step 5: Pushing to ECR..."
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO_NAME:$IMAGE_TAG

# Step 6: Get image URI
IMAGE_URI="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO_NAME:$IMAGE_TAG"
echo ""
echo "Image URI: $IMAGE_URI"

# Step 7: Create or update Lambda function
echo ""
echo "Step 7: Creating/updating Lambda function..."

# Check if function exists
if aws lambda get-function --function-name $FUNCTION_NAME --region $AWS_REGION 2>/dev/null; then
  echo "Function exists, updating..."
  aws lambda update-function-code \
    --function-name $FUNCTION_NAME \
    --image-uri $IMAGE_URI \
    --region $AWS_REGION
else
  echo "Creating new function..."

  # Create IAM role first
  ROLE_NAME="${FUNCTION_NAME}-role"

  # Check if role exists
  if ! aws iam get-role --role-name $ROLE_NAME 2>/dev/null; then
    echo "Creating IAM role..."

    # Create trust policy
    cat > /tmp/trust-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF

    aws iam create-role \
      --role-name $ROLE_NAME \
      --assume-role-policy-document file:///tmp/trust-policy.json

    # Attach basic execution policy
    aws iam attach-role-policy \
      --role-name $ROLE_NAME \
      --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole

    # Create and attach CloudWatch read policy
    cat > /tmp/cloudwatch-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "cloudwatch:GetMetricData",
        "cloudwatch:GetMetricStatistics",
        "cloudwatch:ListMetrics"
      ],
      "Resource": "*"
    }
  ]
}
EOF

    aws iam put-role-policy \
      --role-name $ROLE_NAME \
      --policy-name CloudWatchReadAccess \
      --policy-document file:///tmp/cloudwatch-policy.json

    echo "Waiting for role to propagate..."
    sleep 10
  fi

  ROLE_ARN=$(aws iam get-role --role-name $ROLE_NAME --query 'Role.Arn' --output text)

  # Prompt for Grafana password
  read -sp "Enter Grafana admin password: " GRAFANA_PASSWORD
  echo ""

  # Create function
  aws lambda create-function \
    --function-name $FUNCTION_NAME \
    --package-type Image \
    --code ImageUri=$IMAGE_URI \
    --role $ROLE_ARN \
    --timeout 30 \
    --memory-size 1536 \
    --environment "Variables={GRAFANA_ADMIN_PASSWORD=$GRAFANA_PASSWORD,GF_PATHS_DATA=/tmp/grafana,GF_PATHS_LOGS=/tmp/grafana/logs,GF_PATHS_PLUGINS=/tmp/grafana/plugins}" \
    --region $AWS_REGION

  echo "Waiting for function to be active..."
  aws lambda wait function-active --function-name $FUNCTION_NAME --region $AWS_REGION

  # Create Function URL
  echo "Creating Function URL..."
  FUNCTION_URL=$(aws lambda create-function-url-config \
    --function-name $FUNCTION_NAME \
    --auth-type NONE \
    --region $AWS_REGION \
    --query 'FunctionUrl' \
    --output text)

  # Add public invoke permission
  aws lambda add-permission \
    --function-name $FUNCTION_NAME \
    --statement-id FunctionURLAllowPublicAccess \
    --action lambda:InvokeFunctionUrl \
    --principal "*" \
    --function-url-auth-type NONE \
    --region $AWS_REGION

  echo ""
  echo "=== Deployment Complete! ==="
  echo "Grafana URL: $FUNCTION_URL"
  echo "Username: admin"
  echo "Password: [as entered]"
fi

echo ""
echo "Done!"
