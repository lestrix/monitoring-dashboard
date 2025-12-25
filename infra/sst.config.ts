/// <reference path="./.sst/platform/config.d.ts" />

/**
 * SST Infrastructure Configuration
 *
 * Monitoring Dashboard for Kong's Serverless Projects
 * - Cost collection Lambda (hourly)
 * - CloudWatch metrics aggregation
 * - Grafana visualization (future phase)
 * - Centralized monitoring namespace
 */
export default $config({
  app(input) {
    return {
      name: "monitoring-dashboard",
      removal: input?.stage === "production" ? "retain" : "remove",
      home: "aws",
      providers: {
        aws: {
          region: "eu-central-1",
        },
      },
    };
  },
  async run() {
    // Cost Collector Lambda - Runs every hour to fetch AWS cost data
    const costCollector = new sst.aws.Function("CostCollector", {
      handler: "../apps/cost-collector/src/index.handler",
      runtime: "nodejs20.x",
      timeout: "60 seconds",
      memory: "512 MB",
      permissions: [
        {
          actions: ["ce:GetCostAndUsage", "ce:GetCostForecast"],
          resources: ["*"],
        },
        {
          actions: ["cloudwatch:PutMetricData"],
          resources: ["*"],
        },
      ],
      environment: {
        NODE_ENV: $app.stage,
        LOG_LEVEL: $app.stage === "production" ? "info" : "debug",
      },
      nodejs: {
        esbuild: {
          external: ["@aws-sdk/*"],
          minify: false,
          sourcemap: true,
          bundle: true,
          platform: "node",
          target: "node20",
          format: "esm",
        },
      },
    });

    // EventBridge rule to trigger cost collection every hour
    const costSchedule = new sst.aws.Cron("CostCollectorSchedule", {
      schedule: "rate(1 hour)",
      job: {
        handler: costCollector.arn,
      },
    });

    // S3 bucket for Grafana dashboard configurations (future)
    const dashboardBucket = new sst.aws.Bucket("DashboardConfigs");

    // Outputs
    return {
      costCollectorArn: costCollector.arn,
      costSchedule: costSchedule.arn,
      dashboardBucket: dashboardBucket.name,
    };
  },
});
