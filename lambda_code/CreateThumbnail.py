from __future__ import print_function
import boto3
import os
import sys
import uuid
from PIL import Image
import PIL.Image
import json

s3_client = boto3.client('s3')
lam = boto3.client('lambda')


def resize_image(image_path, resized_path):
    with Image.open(image_path) as image:
        size = (500, 500)
        #image.thumbnail(tuple(x / 2 for x in image.size))
        image.thumbnail(size)
        image.save(resized_path)


def handler(event, context):
    for record in event['Records']:
        bucket = record['s3']['bucket']['name']
        print(bucket)
        key = record['s3']['object']['key']
        print(key)
        download_path = '/tmp/{}{}'.format(uuid.uuid4(), key)
        upload_path = '/tmp/resized-{}'.format(key)

        s3_client.download_file(bucket, key, download_path)
        resize_image(download_path, upload_path)
        s3_client.upload_file(upload_path, '{}resized'.format(bucket), key)
        response = s3_client.head_object(Bucket=bucket, Key=key)
        print("userid : " + response['Metadata']['userid'])
        print("description : " + response['Metadata']['description'])
        print("title : " + response['Metadata']['title'])
        print("tag1 :" + response['Metadata']['tag1'])
        print("tag2 :" + response['Metadata']['tag2'])
        print("tag3 :" + response['Metadata']['tag3'])
        print("tag4 :" + response['Metadata']['tag4'])
        print("tag5 :" + response['Metadata']['tag5'])

        url_main = "https://s3.amazonaws.com/" + bucket + "/" + key
        url_thumb = "https://s3.amazonaws.com/" + '{}resized'.format(bucket) + "/" + key
        print(url_main)
        print(url_thumb)

        payload = {}
        payload['userid'] = response['Metadata']['userid']
        payload['description'] = response['Metadata']['description']
        payload['title'] = response['Metadata']['title']
        payload['tag1'] = response['Metadata']['tag1']
        payload['tag2'] = response['Metadata']['tag2']
        payload['tag3'] = response['Metadata']['tag3']
        payload['tag4'] = response['Metadata']['tag4']
        payload['tag5'] = response['Metadata']['tag5']
        payload['urlmain'] = url_main  # lambda/json doesn't seem to like _
        payload['urlthumb'] = url_thumb
        payload['bucket'] = bucket
        payload['key'] = key

        try:
            lam_response = lam.invoke(FunctionName='createImageEntry', InvocationType='RequestResponse',
                                      Payload=json.dumps(payload))
        except Exception as e:
            print(e)
            raise (e)
