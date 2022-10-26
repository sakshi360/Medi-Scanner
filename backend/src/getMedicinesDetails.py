import json
import boto3
from boto3.dynamodb.conditions import Key, Attr
from io import StringIO
from decimal import Decimal
import time
import os
from aws_lambda_powertools import Logger, Metrics, Tracer
from aws_lambda_powertools.utilities.data_classes import event_source, SQSEvent

dynamodb=boto3.resource("dynamodb")
TableForMedicalEntryLedger = os.environ.get("MEDICAL_ENTRY_LEDGER")
tableUserEntry=dynamodb.Table(TableForMedicalEntryLedger)
username = os.environ.get("USERNAME")


@metrics.log_metrics(capture_cold_start_metric=True)
@logger.inject_lambda_context
@tracer.capture_lambda_handler
def lambda_handler(event, context):
    # TODO implement
    res = tableUserEntry.query(TableName= TableForMedicalEntryLedger,
            KeyConditionExpression=Key("username").eq(username), ScanIndexForward=False)
                            
    logger.info("result is ".format(res))
    if res == None or 'Items' not in res or len(res['Items']) == 0 :
        print("result is empty")
        return{
            'statusCode':404,
            'body': json.dumps('Something went wrong!!')
        }
    
    return {
        'statusCode': 200,
        'body': json.dumps({'medicines' : res['Items'][0]['medication']})
    }
