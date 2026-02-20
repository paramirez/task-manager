#!/bin/sh
set -e

echo "Creating SQS queue: async-jobs"
awslocal sqs create-queue --queue-name async-jobs >/dev/null

echo "Creating SQS queue: task-events-consumer"
TASK_EVENTS_QUEUE_URL="$(awslocal sqs create-queue --queue-name task-events-consumer --query QueueUrl --output text)"
TASK_EVENTS_QUEUE_ARN="$(awslocal sqs get-queue-attributes --queue-url "$TASK_EVENTS_QUEUE_URL" --attribute-names QueueArn --query 'Attributes.QueueArn' --output text)"

echo "Creating SNS topic: task-events"
TASK_EVENTS_TOPIC_ARN="$(awslocal sns create-topic --name task-events --query TopicArn --output text)"

echo "Setting queue policy for SNS delivery"
awslocal sqs set-queue-attributes \
  --queue-url "$TASK_EVENTS_QUEUE_URL" \
  --attributes "Policy={\"Version\":\"2012-10-17\",\"Statement\":[{\"Sid\":\"allow-sns-send\",\"Effect\":\"Allow\",\"Principal\":\"*\",\"Action\":\"sqs:SendMessage\",\"Resource\":\"$TASK_EVENTS_QUEUE_ARN\",\"Condition\":{\"ArnEquals\":{\"aws:SourceArn\":\"$TASK_EVENTS_TOPIC_ARN\"}}}]}" \
  >/dev/null

echo "Subscribing task-events topic to task-events-consumer queue"
awslocal sns subscribe \
  --topic-arn "$TASK_EVENTS_TOPIC_ARN" \
  --protocol sqs \
  --notification-endpoint "$TASK_EVENTS_QUEUE_ARN" \
  --attributes RawMessageDelivery=true \
  >/dev/null

echo "Messaging resources ready"
