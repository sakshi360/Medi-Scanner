import boto3
import json
import csv
import os
import uuid
TEMP_FILE = '/tmp/mytxtfile.txt'
from aws_lambda_powertools import Logger, Metrics, Tracer
from aws_lambda_powertools.utilities.data_classes import event_source, SQSEvent


logger = Logger()
tracer = Tracer()
metrics = Metrics()

sns = boto3.client('sns') 
s3 = boto3.resource('s3')
sqs_client = boto3.client('sqs')

def convert_to_txt(body):
    json_acceptable_string = body.replace("'", "\"")
    d = json.loads(json_acceptable_string)
    
    text=""
    f= open(TEMP_FILE,"w")
    for i in d:
        text+=i+"\n"
    f.writelines(text)



def validate(body):
    ##we are returnng True here everytime assuming the prescription uploaded is correct and authenticated by medicine provide apps manually.
    return True, id, "Ok"



@metrics.log_metrics(capture_cold_start_metric=True)
@logger.inject_lambda_context
@tracer.capture_lambda_handler
def lambda_handler(event, context):
    
    # SQS queue triggers this function. This reads the key-value from queue
    # validate the form elements and for successful validation it creates text file
    # file and uploads to S3 bucket. For invalid case it sends a SNS notification
    logger.info('event {}'.format(event.__dict__))
    body = event['Records'][0]['body']
    print(body)

    try:    
        # Validate 
        res, formid, result = validate(body)
        print("RESULT",result)
        filename = "result/" + str(uuid.uuid4())+ ".txt"
        if(res):
            # Convert to CSV and upload to S3 bucket
            convert_to_txt(body)
            resultbucket = os.environ['resultbucket']
            s3res = s3.Bucket(resultbucket).upload_file(TEMP_FILE, filename) 
            logger.info('result bucket called')
        else :
            # Add to invalid queue and send message
            invalidqueue = os.environ['invalidqueue']
            msg = sqs_client.send_message(QueueUrl=invalidqueue,
                                      MessageBody=str(body)+result,MessageGroupId="678Abc",MessageDeduplicationId="aa1a")
            print(msg)
            snsbody = "Content:" + str(body) + "Reason:" + str(result)
            Notify
            invalidtopic = os.environ['invalidsns']
            response = sns.publish(
                TopicArn=invalidtopic,
                Message=str(snsbody))
    except Exception as e:
        logger.info("Failed while doing validation")
        print(e)
        
    return {
        'statusCode': 200,
        'body': json.dumps('Success!')
    }
