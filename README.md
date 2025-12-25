# 📊 Monitoring Dashboard

> Centralized monitoring and cost tracking for Kong's serverless projects

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![SST](https://img.shields.io/badge/SST-v3-blueviolet)](https://sst.dev/)
[![AWS](https://img.shields.io/badge/AWS-CloudWatch-orange)](https://aws.amazon.com/)
[![Cost](https://img.shields.io/badge/Monthly%20Cost-~$0.67-green)](./docs/DEVELOPER_DIARY.md)

---

## 🎯 What Is This?

A serverless monitoring solution that tracks **costs**, **usage**, and **performance** across all Kong's AWS projects:

- 📈 **Developer Portfolio** - Project showcase website
- 💍 **Wedding Countdown** - Gift card website for Desiree & Kong
- ✅ **Effect Serverless Todo** - Full-stack todo application
- 📰 **Hacker News Blog** - Matrix-themed blog platform

**Key Features:**
- Real-time cost tracking per project
- Usage metrics (Lambda invocations, DynamoDB operations)
- Performance monitoring (latency, errors, cold starts)
- Automated hourly cost collection
- CloudWatch custom metrics
- Future: Grafana dashboards

---

## 🏗️ Architecture

```
CloudWatch Metrics (All Projects)
         │
         ├── Lambda Metrics (invocations, duration, errors)
         ├── DynamoDB Metrics (reads, writes, storage)
         ├── CloudFront Metrics (requests, data transfer)
         └── S3 Metrics (storage, requests)

EventBridge (Hourly)
         │
         ▼
Cost Collector Lambda
         │
         ├── Fetch AWS Cost Explorer data
         ├── Calculate per-service costs
         └── Publish to CloudWatch Metrics

CloudWatch Namespace: Kong/Monitoring
         │
         ├── TotalDailyCost
         ├── ServiceCost (per AWS service)
         └── (Future) Custom business metrics
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- pnpm 9+
- AWS Account with Cost Explorer enabled
- AWS CLI configured

### Installation

```bash
# Clone and install
git clone https://github.com/YOUR_USERNAME/monitoring-dashboard.git
cd monitoring-dashboard
pnpm install
```

### Local Development

```bash
# Start SST dev mode
cd infra
pnpm sst dev
```

### Deploy to Production

```bash
cd infra
pnpm sst deploy --stage production
```

---

## 📊 What Gets Monitored

### Cost Tracking
- **Total daily AWS costs**
- **Per-service costs** (Lambda, DynamoDB, CloudFront, S3)
- **Cost trends** over time
- **Budget alerts** (future)

### Usage Metrics
- **Lambda:**
  - Invocations per project
  - Average duration
  - Error rate
  - Cold starts
  - Concurrent executions

- **DynamoDB:**
  - Read/Write capacity units
  - Item count
  - Storage size
  - Throttled requests

- **CloudFront:**
  - Requests
  - Data transfer (GB)
  - Cache hit ratio
  - Error rates

- **S3:**
  - Storage size
  - Request counts
  - Data transfer

### Performance Metrics
- **API Latency:** P50, P90, P99
- **Error Rates:** 4xx, 5xx
- **Availability:** Uptime percentage

---

## 💰 Cost Analysis

### Current Monthly Costs

| Component | Usage | Cost |
|-----------|-------|------|
| Cost Collector Lambda | 720 invocations/month × 1s | $0.01 |
| CloudWatch Custom Metrics | 0 metrics | FREE |
| S3 Dashboard Storage | 1MB | $0.01 |
| EventBridge Rules | 1 rule, 720 invocations | FREE |
| **TOTAL** | | **~$0.02/month** |

**Note:** This is for the monitoring infrastructure itself. Monitored projects cost ~$0.08/month total.

---

## 📁 Project Structure

```
monitoring-dashboard/
├── apps/
│   └── cost-collector/        # Lambda for AWS cost collection
│       ├── src/
│       │   └── index.ts       # Main handler
│       ├── package.json
│       └── tsconfig.json
│
├── infra/
│   ├── sst.config.ts          # SST infrastructure definition
│   ├── package.json
│   └── tsconfig.json
│
├── dashboards/                # Grafana dashboard configs (future)
│   ├── overview.json
│   ├── costs.json
│   └── per-project/
│
├── docs/
│   └── DEVELOPER_DIARY.md     # Development chronicle
│
├── package.json               # Root workspace config
├── pnpm-workspace.yaml        # Monorepo definition
└── README.md                  # This file
```

---

## 🔌 CloudWatch Metrics

### Namespace: `Kong/Monitoring`

**Available Metrics:**

1. **TotalDailyCost**
   - Dimensions: Account=Production
   - Unit: USD
   - Frequency: Hourly

2. **ServiceCost**
   - Dimensions: Service={Lambda|DynamoDB|CloudFront|S3|...}
   - Unit: USD
   - Frequency: Hourly

### Querying Metrics

```bash
# Get total cost for last 7 days
aws cloudwatch get-metric-statistics \
  --namespace Kong/Monitoring \
  --metric-name TotalDailyCost \
  --dimensions Name=Account,Value=Production \
  --start-time $(date -u -d '7 days ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 86400 \
  --statistics Sum

# Get Lambda costs
aws cloudwatch get-metric-statistics \
  --namespace Kong/Monitoring \
  --metric-name ServiceCost \
  --dimensions Name=Service,Value="AWS Lambda" \
  --start-time $(date -u -d '7 days ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 86400 \
  --statistics Sum
```

---

## 🎨 Future Enhancements

### Phase 2: Grafana Dashboards (Planned)
- Deploy Grafana on Lambda Container
- Create pre-built dashboards
- Add authentication via Cognito
- Custom domain via CloudFront

### Phase 3: Advanced Metrics (Planned)
- Business metrics (users, activity, features)
- Application-level tracing
- Real-time alerting
- Cost anomaly detection

### Phase 4: Multi-Account (Future)
- Monitor multiple AWS accounts
- Consolidated billing view
- Cross-account CloudWatch

---

## 🛠️ Development Commands

```bash
# Install dependencies
pnpm install

# Type check
pnpm typecheck

# Deploy to dev
cd infra && pnpm sst deploy --stage dev

# Deploy to production
cd infra && pnpm sst deploy --stage production

# Remove deployment
cd infra && pnpm sst remove --stage <stage>

# View logs
aws logs tail /aws/lambda/monitoring-dashboard-CostCollector --follow
```

---

## 📚 Documentation

- [Developer Diary](./docs/DEVELOPER_DIARY.md) - Development journey and decisions
- [Architecture Design](../MONITORING_DASHBOARD_DESIGN.md) - Detailed architecture analysis
- [SST Documentation](https://sst.dev/docs) - SST framework docs
- [AWS Cost Explorer](https://docs.aws.amazon.com/cost-management/latest/userguide/ce-what-is.html) - Cost tracking API

---

## 🤝 Contributing

This is a personal monitoring project, but feel free to:
- Fork for your own multi-project monitoring
- Report bugs via GitHub Issues
- Suggest improvements

---

## 📄 License

MIT License - feel free to use as a template for your own monitoring!

---

**Status:** ✅ Phase 1 Complete (Cost Collection)
**Next:** Phase 2 (Grafana Dashboards)
**Monthly Cost:** ~$0.02
**Last Updated:** December 25, 2025
