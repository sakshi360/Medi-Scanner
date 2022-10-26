import boto3
import json
import csv
from io import StringIO
from decimal import Decimal
import time
import os
from aws_lambda_powertools import Logger, Metrics, Tracer
from aws_lambda_powertools.utilities.data_classes import event_source, SQSEvent

TEMP_FILE = '/tmp/cmresult.csv'

s3 = boto3.resource('s3')
comprehend = boto3.client(service_name='comprehendmedical')
dynamodb=boto3.resource("dynamodb")
TableForMedicalEntryLedger = os.environ.get("MEDICAL_ENTRY_LEDGER")
tableUserEntry=dynamodb.Table(TableForMedicalEntryLedger)


@metrics.log_metrics(capture_cold_start_metric=True)
@logger.inject_lambda_context
@tracer.capture_lambda_handler
def lambda_handler(event, context):

    # This gets triggered from when txt obj file is add to S3 bucket.
    # It extracts the value for the key "PROCEDURE" and analyzes through
    # comprehend medical to extract various enties. Then it writes these
    # results to S3 as CSV file
    print("event")
    print(event)
    obj=event['Records'][0]['s3']['object']['key']
    bucket=event['Records'][0]['s3']['bucket']['name']
    try:
        obj = s3.Object(bucket, obj)
        data = obj.get()['Body'].read().decode('utf-8')
        print("data",data)
        username = data.split(" ")[0]
        json_data = comprehend.detect_entities(Text=data)
        entities = json_data['Entities']
        med_names = []
        invalid_med=['Tab','tab','syr','Syr','Cap','cap']
        for i in entities:
            if i['Category']=='MEDICATION' and i['Text'] not in invalid_med:
                med_names.append(i['Text'])
        print("MEDICINES",med_names)
        logger.info("medicines", med_names)
        tableUserEntry.put_item(Item= {
                'username':username,
                'timestamp':Decimal(time.time()),
                'medication':med_names
                },)
        logger.info("updated database")
        # response2 = comprehend.infer_rx_norm(Text=data)
        # print("medicines 2",response2)

        # print("successfully parsed:" + filename)
    except Exception as e:
        logger.info(e)
        print("Failed to get Procedure results")
        print(e)
    
    return {
        'statusCode': 200,
        'body': json.dumps('Success!')
    }
