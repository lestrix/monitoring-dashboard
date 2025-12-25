FROM grafana/grafana:11.4.0

# Run as root to set up everything
USER root

# Install AWS SDK for Lambda Web Adapter
COPY --from=public.ecr.aws/awsguru/aws-lambda-adapter:0.8.4 /lambda-adapter /opt/extensions/lambda-adapter

# Create directories for persistent storage
RUN mkdir -p /var/lib/grafana /var/log/grafana /etc/grafana/provisioning/datasources /etc/grafana/provisioning/dashboards

# Copy provisioning configs
COPY provisioning/datasources/cloudwatch.yml /etc/grafana/provisioning/datasources/
COPY provisioning/dashboards/default.yml /etc/grafana/provisioning/dashboards/
COPY dashboards/ /etc/grafana/dashboards/

# Copy Grafana configuration
COPY grafana.ini /etc/grafana/grafana.ini

# Create /tmp directories and set permissions
# Lambda /tmp is writable by default, but we need to create the structure
RUN mkdir -p /tmp/grafana /tmp/grafana/logs /tmp/grafana/plugins && \
    chown -R 472:0 /var/lib/grafana /var/log/grafana /etc/grafana /tmp/grafana && \
    chmod -R 755 /tmp/grafana

# Switch back to grafana user
USER 472

# Expose port for Lambda Web Adapter
ENV PORT=3000
EXPOSE 3000

# Health check endpoint
ENV READINESS_CHECK_PORT=3000
ENV READINESS_CHECK_PATH=/api/health

# Entrypoint script to ensure /tmp is writable in Lambda
USER root
RUN echo '#!/bin/sh\nmkdir -p /tmp/grafana /tmp/grafana/logs /tmp/grafana/plugins\nchown -R 472:0 /tmp/grafana\nexec su-exec 472 /run.sh "$@"' > /entrypoint.sh && \
    chmod +x /entrypoint.sh

USER 472
CMD ["/bin/sh", "-c", "mkdir -p /tmp/grafana /tmp/grafana/logs /tmp/grafana/plugins && exec /run.sh"]
