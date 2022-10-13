import json
import os
import boto3
import sys
import re
import json
import csv
import uuid

client = boto3.client('textract')
sqs_client = boto3.client('sqs')

def get_kv_map(obj, bucket):

    # process using image bytes
    try:
        response = client.detect_document_text(
            Document={
                # 'Bytes': b'bytes',
                'S3Object': {
                    'Bucket': bucket,
                    'Name': obj
                    }
            }
            )
        print("##########TEXT IN PRESCIPTION##########")
        for item in response["Blocks"]:
            if item["BlockType"] == "LINE":
                print (item["Text"])


        blocks=response['Blocks']
        key_map = {}
        value_map = {}
        block_map = {}
        curr_pos = 0
        line_val = []
        for block in blocks:
            curr_pos=curr_pos + 1
            block_id = block['Id']
            block_map[block_id] = block
            if block['BlockType'] == "KEY_VALUE_SET":
                if 'KEY' in block['EntityTypes']:
                    key_map[block_id] = block
                else:
                    value_map[block_id] = block
            if block['BlockType'] == "LINE":
                if block['Text'] == "PROCEDURE":
                    block = blocks[curr_pos]
                line_val.append( block['Text'])
                    
        return key_map, value_map, block_map, line_val
    except:
        print("Failed while parsing the document")
        raise 


def lambda_handler(event, context):
    
    # This code gets triggered by a object upload in S3 Bucket.
    # It sends object from S3 bucket to textract for key-value extracttion.
    # In successful extraction it stores dara line by line in S3 as text file.
    # In case of failures it prompts message.
    
    print(event)
    obj=event['Records'][0]['s3']['object']['key']
    bucket=event['Records'][0]['s3']['bucket']['name']
    
    try:
        key_map, value_map, block_map, line_val = get_kv_map(obj, bucket)
        print("key_map",key_map)
        print("value_map",value_map)
        print("block_map",block_map)
        print("line_val",line_val)
    
        # Add to Queue for validation
        msg = sqs_client.send_message(QueueUrl='textractToValidate.fifo',MessageBody=str(line_val),MessageGroupId=line_val[0],
        MessageDeduplicationId=str(uuid.uuid4()))

    except Exception as e:
        print("Failed in processing file")
        print(e)

    return {
        'statusCode': 200,
        'body': json.dumps('Success!')
    }
