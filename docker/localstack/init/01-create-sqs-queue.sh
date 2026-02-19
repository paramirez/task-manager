#!/bin/sh
set -e

echo "Creating SQS queue: task-events"
awslocal sqs create-queue --queue-name task-events >/dev/null
echo "SQS queue ready"
