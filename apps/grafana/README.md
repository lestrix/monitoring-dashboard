# Grafana Dashboard - Phase 2

Beautiful, customizable monitoring dashboards for Kong's AWS projects.

## Architecture

**Grafana on AWS Lambda Container**
- Runtime: Grafana 11.4.0 in Docker container
- Deployment: AWS Lambda with Function URL
- Memory: 1536 MB
- Timeout: 30 seconds
- Authentication: Built-in Grafana user/password

## Features

- 📊 **Pre-built Dashboard:** AWS Cost Monitoring
- 🔐 **Password Protected:** Secure access with admin credentials
- ☁️ **CloudWatch Integration:** Direct connection to your metrics
- 💰 **Cost Effective:** Pay only when viewing (~$1-2/month)
- 🌐 **Public URL:** Access from anywhere via HTTPS

## Deployment

### Prerequisites

- Docker installed locally
- AWS CLI configured
- AWS account with ECR and Lambda permissions

### Deploy

```bash
cd apps/grafana
./deploy.sh
```

The script will:
1. Create ECR repository
2. Build Docker image
3. Push to ECR
4. Create Lambda function
5. Set up Function URL
6. Prompt for admin password

### Access

After deployment, you'll receive a Function URL like:
```
https://xxxxx.lambda-url.eu-central-1.on.aws/
```

**Login:**
- Username: `admin`
- Password: [as set during deployment]

## Dashboards

### AWS Cost Monitoring

Pre-configured dashboard with:

**Gauges:**
- Yesterday's Total Cost

**Time Series:**
- Total Daily Cost Trend (30 days)

**Pie Chart:**
- Cost by Service (last 7 days)

**Bar Chart:**
- Service Cost Breakdown Over Time

**Table:**
- Detailed Service Costs with statistics

## Data Source

**CloudWatch:**
- Namespace: `Kong/Monitoring`
- Region: `eu-central-1`
- Auth: Lambda IAM role (automatic)

**Metrics:**
- `TotalDailyCost` - Overall AWS spending
- `ServiceCost` - Per-service breakdown

## Configuration

### Environment Variables

```bash
GRAFANA_ADMIN_PASSWORD  # Admin password (required)
GF_PATHS_DATA          # /tmp/grafana (Lambda /tmp)
GF_PATHS_LOGS          # /tmp/grafana/logs
GF_PATHS_PLUGINS       # /tmp/grafana/plugins
```

### Files

```
apps/grafana/
├── Dockerfile                              # Container definition
├── grafana.ini                             # Grafana config
├── provisioning/
│   ├── datasources/cloudwatch.yml          # CloudWatch connection
│   └── dashboards/default.yml              # Dashboard provider
├── dashboards/
│   └── aws-cost-monitoring.json            # Pre-built dashboard
├── deploy.sh                               # Deployment script
└── README.md                               # This file
```

## Customization

### Add New Dashboard

1. Create dashboard in Grafana UI
2. Export as JSON
3. Save to `dashboards/` directory
4. Redeploy container

### Change Password

```bash
aws lambda update-function-configuration \
  --function-name monitoring-dashboard-grafana \
  --environment "Variables={GRAFANA_ADMIN_PASSWORD=new_password,...}"
```

### Update Grafana Version

1. Edit `Dockerfile`: Change `FROM grafana/grafana:X.Y.Z`
2. Run `./deploy.sh` to rebuild and push

## Cost Estimate

**Monthly Cost:**
- Lambda invocations: ~$0.50 (assuming 100 views/month)
- ECR storage: ~$0.10
- Data transfer: ~$0.10
- **Total: ~$0.70 - $1.50/month**

**Cost Breakdown:**
- Lambda: $0.0000166667/GB-second
- ECR: $0.10/GB/month
- Minimal compared to AWS Managed Grafana ($9/month)

## Troubleshooting

### Dashboard doesn't load

**Check Lambda logs:**
```bash
aws logs tail /aws/lambda/monitoring-dashboard-grafana --follow
```

### CloudWatch data not showing

**Verify IAM permissions:**
```bash
aws iam list-attached-role-policies \
  --role-name monitoring-dashboard-grafana-role
```

Should have `CloudWatchReadAccess` policy.

### "Database locked" error

Lambda's `/tmp` storage is ephemeral. Grafana uses SQLite stored in `/tmp/grafana/grafana.db`. This is expected - each Lambda invocation gets fresh storage. Dashboards are provisioned from files, so this is acceptable.

## Maintenance

### Update Dashboard

1. Edit `dashboards/aws-cost-monitoring.json`
2. Redeploy: `./deploy.sh`
3. Refresh Grafana browser

### View Metrics

Lambda function URL is always available at:
```bash
aws lambda get-function-url-config \
  --function-name monitoring-dashboard-grafana \
  --query 'FunctionUrl' \
  --output text
```

## Security Notes

- Function URL is public but Grafana requires login
- Consider adding API Gateway + WAF for production
- Rotate admin password regularly
- Use AWS Secrets Manager for password storage (future enhancement)

## Future Enhancements

- Custom domain with Route 53
- AWS Cognito authentication
- S3-backed persistent storage
- Multi-user access with IAM
- Alerting integration
- More pre-built dashboards

---

**Built with:** Grafana 11.4.0 + AWS Lambda + CloudWatch + Love ❤️
