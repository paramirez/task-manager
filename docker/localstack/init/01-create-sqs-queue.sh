#!/bin/sh
set -e

echo "Creating SQS queue: async-jobs"
awslocal sqs create-queue --queue-name async-jobs >/dev/null

echo "Messaging resources ready"
