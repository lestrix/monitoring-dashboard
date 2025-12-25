import { CostExplorerClient, GetCostAndUsageCommand } from "@aws-sdk/client-cost-explorer";
import { CloudWatchClient, PutMetricDataCommand } from "@aws-sdk/client-cloudwatch";
import type { Handler } from "aws-lambda";

const costExplorer = new CostExplorerClient({ region: "us-east-1" }); // Cost Explorer is only in us-east-1
const cloudWatch = new CloudWatchClient({ region: process.env.AWS_REGION || "eu-central-1" });

/**
 * Projects to monitor
 */
const PROJECTS = [
  { name: "developer-portfolio", tags: ["app:developer-portfolio"] },
  { name: "wedding-countdown", tags: ["app:wedding-countdown"] },
  { name: "effect-serverless-todo", tags: ["app:effect-serverless-todo"] },
  { name: "hacker-news-blog", tags: ["app:hacker-news-blog"] },
];

/**
 * Lambda handler that collects AWS cost data and publishes to CloudWatch
 * Runs every hour via EventBridge
 */
export const handler: Handler = async () => {
  console.log("Starting cost collection...");

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const startDate = yesterday.toISOString().split("T")[0];
  const endDate = today.toISOString().split("T")[0];

  try {
    // Get overall AWS costs
    const totalCostResponse = await costExplorer.send(
      new GetCostAndUsageCommand({
        TimePeriod: {
          Start: startDate,
          End: endDate,
        },
        Granularity: "DAILY",
        Metrics: ["UnblendedCost"],
      })
    );

    const totalCost = parseFloat(
      totalCostResponse.ResultsByTime?.[0]?.Total?.UnblendedCost?.Amount || "0"
    );

    console.log(`Total AWS cost for ${startDate}: $${totalCost}`);

    // Publish total cost to CloudWatch
    await cloudWatch.send(
      new PutMetricDataCommand({
        Namespace: "Kong/Monitoring",
        MetricData: [
          {
            MetricName: "TotalDailyCost",
            Value: totalCost,
            Unit: "None",
            Timestamp: yesterday,
            Dimensions: [
              {
                Name: "Account",
                Value: "Production",
              },
            ],
          },
        ],
      })
    );

    // Get per-service costs
    const serviceResponse = await costExplorer.send(
      new GetCostAndUsageCommand({
        TimePeriod: {
          Start: startDate,
          End: endDate,
        },
        Granularity: "DAILY",
        Metrics: ["UnblendedCost"],
        GroupBy: [
          {
            Type: "DIMENSION",
            Key: "SERVICE",
          },
        ],
      })
    );

    // Publish per-service costs
    const serviceCosts = serviceResponse.ResultsByTime?.[0]?.Groups || [];

    for (const group of serviceCosts) {
      const serviceName = group.Keys?.[0] || "Unknown";
      const cost = parseFloat(group.Metrics?.UnblendedCost?.Amount || "0");

      if (cost > 0) {
        console.log(`${serviceName}: $${cost}`);

        await cloudWatch.send(
          new PutMetricDataCommand({
            Namespace: "Kong/Monitoring",
            MetricData: [
              {
                MetricName: "ServiceCost",
                Value: cost,
                Unit: "None",
                Timestamp: yesterday,
                Dimensions: [
                  {
                    Name: "Service",
                    Value: serviceName,
                  },
                ],
              },
            ],
          })
        );
      }
    }

    console.log("Cost collection completed successfully");

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Cost collection successful",
        totalCost,
        services: serviceCosts.length,
      }),
    };
  } catch (error) {
    console.error("Error collecting costs:", error);
    throw error;
  }
};
