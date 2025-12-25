# CloudWatch Dashboards - Access Guide

Complete monitoring dashboards for Kong's serverless applications.

**Cost:** $0/month (FREE)
**Created:** December 25, 2025
**Region:** eu-central-1

---

## 📊 Available Dashboards

### 1. Cost Monitoring ✅
**URL:** https://eu-central-1.console.aws.amazon.com/cloudwatch/home?region=eu-central-1#dashboards/dashboard/Kong-Monitoring-Dashboard

**What You'll See:**
- Total Daily Cost (gauge showing yesterday's spend)
- Cost Trend Over Time (30-day line graph)
- Cost by Service (pie chart breakdown)
- Service Cost Stacked Bar Chart
- Detailed Cost Table (with statistics)

**Best For:** Tracking AWS spending, identifying cost spikes, budget planning

---

### 2. Lambda Performance ✅
**URL:** https://eu-central-1.console.aws.amazon.com/cloudwatch/home?region=eu-central-1#dashboards/dashboard/Kong-Lambda-Performance

**What You'll See:**
- Invocations Across All Functions
- Errors & Throttles Timeline
- Duration (Average & P99 percentile)
- Concurrent Executions
- Lambda Invocation Timeline (from logs)

**Monitored Functions:**
- `wedding-countdown-production-WeddingApiFunction`
- `hacker-news-blog-production-ApiFunction`
- `developer-portfolio-production-ApiFunction`
- `monitoring-dashb-production-CostCollectorSchedule`

**Best For:** Performance tuning, spotting cold starts, finding slow functions

---

### 3. DynamoDB Health ✅
**URL:** https://eu-central-1.console.aws.amazon.com/cloudwatch/home?region=eu-central-1#dashboards/dashboard/Kong-DynamoDB-Health

**What You'll See:**
- Read/Write Capacity Consumed (all tables)
- Errors & Throttles (user errors, system errors, throttles)
- Request Latency by Table
- Capacity Usage by Table (read vs write)

**Monitored Tables:**
- `wedding-countdown-production-GiftCardsTableTable`
- `wedding-countdown-production-UsersTableTable`
- `wedding-countdown-production-UserCardStatesTableTable`
- `developer-portfolio-production-PortfolioProjectsTable`
- `hacker-news-blog-production-PostsTableTable`

**Best For:** Identifying throttling issues, capacity planning, performance optimization

---

### 4. Application Overview ✅
**URL:** https://eu-central-1.console.aws.amazon.com/cloudwatch/home?region=eu-central-1#dashboards/dashboard/Kong-Application-Overview

**What You'll See:**

**Top Row:**
- CloudFront Requests (total traffic)
- CloudFront Data Transfer (bytes up/down)
- CloudFront Error Rates (4xx/5xx)

**Middle Row:**
- Overall System Activity (Lambda + DynamoDB)
- System Errors (all services combined)

**Bottom Row (Single Value):**
- Latest Daily Cost
- Average Lambda Duration
- Peak Concurrent Lambdas
- CloudFront Cache Hit Rate

**Best For:** High-level system health, daily check-ins, spotting issues quickly

---

## 🚀 Quick Start

### View All Dashboards
1. Go to [AWS CloudWatch Console](https://console.aws.amazon.com/cloudwatch)
2. Click **Dashboards** in left sidebar
3. You'll see 4 dashboards:
   - `Kong-Monitoring-Dashboard` (Costs)
   - `Kong-Lambda-Performance`
   - `Kong-DynamoDB-Health`
   - `Kong-Application-Overview`

### Customize Time Range
- Click the time selector (top right of dashboard)
- Choose: Last 1 hour, 3 hours, 12 hours, 1 day, 3 days, 1 week, etc.
- For cost data: Use "Last 7 days" or "Last 30 days"

### Refresh Data
- Dashboards auto-refresh every 1 minute
- Manual refresh: Click the refresh button (top right)

---

## 📈 What Metrics Mean

### Lambda Metrics
- **Invocations:** Number of times function was called
- **Duration:** How long function took to execute
- **Errors:** Function threw unhandled error
- **Throttles:** AWS rejected invocation (concurrency limit)
- **Concurrent Executions:** How many instances running simultaneously
- **Cold Starts:** Not directly shown, but visible in duration spikes

### DynamoDB Metrics
- **Consumed Capacity:** Read/Write units used
- **User Errors:** Client errors (bad requests, validation)
- **System Errors:** AWS-side errors
- **Throttled Requests:** Exceeded provisioned capacity
- **Latency:** Time to complete request

### CloudFront Metrics
- **Requests:** Number of HTTP/HTTPS requests
- **Bytes Downloaded/Uploaded:** Data transfer volume
- **Error Rates:** Percentage of requests that failed
- **Cache Hit Rate:** % of requests served from cache (higher = better)

---

## 🔍 Common Scenarios

### "My app is slow"
1. Check **Lambda Performance** → Duration
2. Check **DynamoDB Health** → Request Latency
3. Check **Application Overview** → CloudFront Cache Hit Rate

### "I got a spike in costs"
1. Check **Cost Monitoring** → Service Cost Breakdown
2. Identify which service increased
3. Cross-reference with **Lambda Performance** or **DynamoDB Health**

### "Are there errors?"
1. Check **Application Overview** → System Errors
2. Drill into **Lambda Performance** → Errors & Throttles
3. Check **DynamoDB Health** → Errors & Throttles

### "How much traffic am I getting?"
1. Check **Application Overview** → CloudFront Requests
2. Check **Lambda Performance** → Invocations
3. Check **DynamoDB Health** → Capacity Usage

---

## 🛠️ Advanced Tips

### Create Alarms
1. Click any metric in a dashboard
2. Click "Actions" → "Create Alarm"
3. Set threshold (e.g., "Alert if errors > 5")
4. Configure SNS notification (email/SMS)

### Export Dashboard
1. Open dashboard
2. Click "Actions" → "View in Metrics"
3. Export to CSV or PNG

### Share Dashboard
1. Open dashboard
2. Copy URL from browser
3. Share with team (requires AWS console access)

---

## 📊 Dashboard Widgets Explained

### Time Series Chart
- Line graph showing metric over time
- Hover over points to see exact values
- Zoom in by dragging on graph

### Single Value
- Shows latest value only
- Updates every period (usually 5 min)
- Good for "at a glance" monitoring

### Stacked Chart
- Shows multiple metrics stacked on top of each other
- Total height = sum of all metrics
- Good for seeing composition

### Log Insights
- Queries CloudWatch Logs
- Shows aggregated log data
- Can be slow to load

---

## 🎯 Monitoring Routine

### Daily Check (2 minutes)
1. Open **Application Overview**
2. Check error rates (should be ~0%)
3. Verify cost is normal (~$0.07/day)
4. Done!

### Weekly Review (5 minutes)
1. Open **Cost Monitoring**
2. Review 7-day trend
3. Check **Lambda Performance** for any slow functions
4. Review **DynamoDB Health** for throttles

### Monthly Analysis (15 minutes)
1. Review all dashboards with 30-day view
2. Identify cost optimization opportunities
3. Check for performance degradation trends
4. Plan capacity adjustments if needed

---

## 🔧 Troubleshooting

### "No data points"
- **Wait 5-10 minutes** - Metrics have delay
- **Check time range** - Extend to "Last 3 hours"
- **Verify resources exist** - Function/table might be deleted

### "Metric shows zero"
- **No activity** - Normal if app hasn't been used
- **Wrong region** - CloudFront is in us-east-1, others in eu-central-1

### "Dashboard won't load"
- **Refresh page**
- **Try different browser**
- **Check AWS service health**

---

## 💡 Pro Tips

1. **Bookmark Dashboards** - Add URLs to browser bookmarks for quick access
2. **Mobile Access** - AWS Console works on mobile (dashboards adapt)
3. **Set Alarms** - Get notified before issues become problems
4. **Weekly Exports** - Download PNG screenshots for records
5. **Compare Periods** - Use time range selector to compare week-over-week

---

## 📝 Metrics Collection

### Built-in AWS Metrics (FREE)
All metrics shown in these dashboards are **built-in AWS metrics** at no additional cost:
- Lambda metrics: Free, 1-minute granularity
- DynamoDB metrics: Free, 1-minute granularity
- CloudFront metrics: Free, 1-minute granularity

### Custom Metrics (From Cost Collector)
- `Kong/Monitoring` namespace
- `TotalDailyCost` - Collected hourly
- `ServiceCost` - Per-service breakdown
- **Cost:** $0.03/month (Lambda execution)

---

## 🎓 Learning Resources

**AWS CloudWatch Docs:**
- [CloudWatch User Guide](https://docs.aws.amazon.com/cloudwatch/)
- [Lambda Metrics](https://docs.aws.amazon.com/lambda/latest/dg/monitoring-metrics.html)
- [DynamoDB Metrics](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/metrics-dimensions.html)

**Dashboard Customization:**
- [Creating Dashboards](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/create_dashboard.html)
- [Using Metric Math](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/using-metric-math.html)

---

## 🚀 Next Steps

### Enhancements You Can Add:
1. **Custom Alarms** - Get notified of issues
2. **Anomaly Detection** - AWS automatically spots unusual patterns
3. **Composite Alarms** - Combine multiple conditions
4. **Dashboard Sharing** - Create read-only snapshots
5. **Mobile App** - AWS Console mobile app

### Want More Metrics?
If you need business-specific metrics (e.g., "gift cards created per day"), we can:
- Add custom CloudWatch metrics ($0.30/metric/month)
- Query DynamoDB directly and create custom dashboards
- Build a lightweight web dashboard with charts.js

---

**Questions?** These dashboards show all AWS built-in metrics for your serverless stack!

**Total Cost:** $0.03/month (just the cost collector Lambda)
**Value:** Complete visibility into your 4 production applications!

---

**Built with:** CloudWatch + Lambda + Love ❤️
**Christmas 2024 Edition** 🎄
