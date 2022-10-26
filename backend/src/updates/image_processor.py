import base64
import boto3
import json
import random
from PIL import Image
from PIL import ImageDraw
from PIL import ImageFont
import io

s3 = boto3.client('s3')


def lambda_handler(event, context):

    response = s3.get_object(
        Bucket='awshackathonoct2023',
        Key='content.jpg',
    )
    image = response['Body'].read()
    image = Image.open(io.BytesIO(image))
    download_path = '/tmp/{}{}'.format(uuid.uuid4(), key)
    upload_path_cover = '/tmp/cover-{}'.format(key)

    print(type(image))
    image2copy=image.copy()
    top = 10

    width, height = image.size
    
    print("width",width)
    print("height",height)
    
    new_height = height + top 
    
    result = Image.new(image.mode, (width, new_height), (255, 254, 253))
    draw = ImageDraw.Draw(result)
    # font = ImageFont.truetype(<font-file>, <font-size>)
    # font = ImageFont.truetype("arial.ttf", 18)
    
    font = ImageFont.load_default()
    draw.text((0,0),"Sample Text is ABCDEJKKK",(0,0,0),font=font)
    result.paste(image2copy, (0, top))
    #filename is referring to the AWS Lambda /tmp directory
    filename  = '/tmp/' + 'image.png'
    result.save(filename)
    with open(filename, 'rb') as file_obj:
       s3_upload = s3.put_object( Bucket="processedpresciptions", Key="filename.png", Body=file_obj)

    
    return {
        'statusCode': 200,
    }
