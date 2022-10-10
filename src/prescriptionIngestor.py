import json
import boto3
import base64


def lambda_handler(event, context):
    # TODO implement
    s3 = boto3.client("s3")
    print("event",event)
    get_file_content = event["body"]
    decode_content = base64.b64decode(get_file_content)

    bucket = os.environ['bucket']

    # Add Bucket name and key
    s3_upload = s3.put_object(Bucket=bucket, Key="content.jpg", Body=decode_content)
 

    return {
        'statusCode': 200,
        'body': json.dumps('Hello from Lambda!')
    }
