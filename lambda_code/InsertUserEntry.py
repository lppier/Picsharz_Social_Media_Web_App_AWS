import json
import boto3
import datetime
import time


def lambda_handler(event, context):
    print(event)
    data = json.dumps(event)
    y = json.loads(data)
    userName = y['userName']
    email = y['request']['userAttributes']['email']
    about = y['request']['userAttributes']['custom:about']
    country = y['request']['userAttributes']['custom:country']
    dob = y['request']['userAttributes']['custom:dob']

    dynamodb = boto3.resource("dynamodb", region_name='us-east-1')
    dynamo_table = dynamodb.Table("users")

    dynamo_table.put_item(Item={"id": userName, "username": userName,
                                "account_created_time": datetime.datetime.fromtimestamp(time.time()).strftime(
                                    '%Y-%m-%d %H:%M:%S'),
                                "about": about,
                                "country": country,
                                "dob": dob
                                })

    return y
