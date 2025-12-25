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
    // EventBridge rule to trigger cost collection every hour
    const costSchedule = new sst.aws.Cron("CostCollectorSchedule", {
      schedule: "rate(1 hour)",
      job: {
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
          },
        },
      },
    });

    // S3 bucket for Grafana dashboard configurations
    const dashboardBucket = new sst.aws.Bucket("DashboardConfigs");

    // Note: Grafana container deployment via SST requires manual ECR push
    // See apps/grafana/README.md for deployment instructions
    // Phase 2 will be deployed using direct AWS Lambda console or terraform

    // Outputs
    return {
      costSchedule: costSchedule.arn,
      dashboardBucket: dashboardBucket.name,
    };
  },
});
