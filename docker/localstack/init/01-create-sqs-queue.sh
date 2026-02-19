#!/bin/sh
set -e

echo "Creating SQS queue: task-events"
awslocal sqs create-queue --queue-name task-events >/dev/null

echo "Creating SQS queue: async-jobs"
awslocal sqs create-queue --queue-name async-jobs >/dev/null

echo "SQS queue ready"
