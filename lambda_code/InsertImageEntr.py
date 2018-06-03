import boto3
import uuid
import datetime
import time

from botocore.exceptions import ClientError

rekognition = boto3.client('rekognition')
client = boto3.client('sns')

main_images_bucket_name = "team30ws-mediarepofinal"
resized_images_bucket_name = "team30ws-mediarepofinalresized"

# The sender for the email
SENDER = "picsharz@gmail.com"
#Moderator email
MODERATOR_EMAIL = "tsan.yeesoon@u.nus.edu"
# The AWS region
AWS_REGION = "us-east-1"
# The subject line for the email.
SUBJECT = "Warning! An Unsafe Image Was Uploaded! Take Action NOW and earn your Moderator pay!"
# The character encoding for the email.
CHARSET = "UTF-8"
# The email body for recipients with non-HTML email clients.
BODY_TEXT = "Alert: Userid {0} uploaded an Unsafe Image! The image is "

# seconds after which the URL will expire - set to 1 week
url_expires_in = 604799


def lambda_handler(event, context):
    print("Loading function")
    print("userid = " + event['userid'])
    print("description = " + event['description'])
    print("tag1 = " + event['tag1'])
    print(event['urlmain'])
    print(event['urlthumb'])

    taglist = []

    if event['tag1'] != "":
        taglist.append(event['tag1'])
    if event['tag2'] != "":
        taglist.append(event['tag2'])
    if event['tag3'] != "":
        taglist.append(event['tag3'])
    if event['tag4'] != "":
        taglist.append(event['tag4'])
    if event['tag5'] != "":
        taglist.append(event['tag5'])

    response_reko = detect_labels(event['bucket'], event['key'])
    print(response_reko)

    for Label in response_reko["Labels"]:
        print(Label["Name"])
        if Label["Name"] not in taglist:
            taglist.append(Label["Name"])

    dynamodb = boto3.resource("dynamodb", region_name='us-east-1')
    dynamo_table = dynamodb.Table("image_details")

    image_id = str(uuid.uuid4())

    s3 = boto3.client('s3')

    # ======== Unsafe Image Detection here

    response_unsafe = detectmoderationlabels(event['bucket'], event['key'])
    if response_unsafe["ModerationLabels"]:
        print(response_unsafe)

        tosend1 = BODY_TEXT.format(event['userid'])
        for Label in response_unsafe["ModerationLabels"]:
            # print('{0} - {1}%'.format(Label["Name"], Label["Confidence"]))
            tosend2 = ' {0} - {1:.2f}% - {2}'.format(Label["ParentName"], Label["Confidence"], Label["Name"])

        tosend = tosend1 + tosend2
        # Send Email/trigger SNS
        # messagesns = client.publish(
        #     TargetArn='arn:aws:sns:us-east-1:528416560993:image-reko-sns',
        #     Message=tosend,
        #     Subject='Warning! An Unsafe Image Was Uploaded! Take Action NOW and earn your Moderator pay!',
        # )

        send_email_to_moderator(MODERATOR_EMAIL,SUBJECT,tosend)
        # Print response to console.
        print(response_unsafe)

    # #====================================

    # update flag in table
    if response_unsafe["ModerationLabels"]:
        for Label in response_unsafe["ModerationLabels"]:
            unsafe_flag = Label["ParentName"]
            unsafe_name = Label["Name"]

        if unsafe_flag == "":
            unsafe_flag = "NA"

        if unsafe_name == "":
            unsafe_name = "NA"

        dynamo_table.put_item(Item={"id": image_id, "description": event['description'], "unsafe_image": unsafe_flag,
                                    "unsafe_name": unsafe_name,
                                    "tags": taglist, "title": event['title'], "upload_user": event['userid'],
                                    "url_main": event['urlmain'],
                                    "url_thumb": event['urlthumb'],
                                    "time": datetime.datetime.fromtimestamp(time.time()).strftime('%Y-%m-%d %H:%M:%S')
                                    })

    else:
        dynamo_table.put_item(Item={"id": image_id, "description": event['description'],
                                    "tags": taglist, "title": event['title'], "upload_user": event['userid'],
                                    "url_main": event['urlmain'],
                                    "url_thumb": event['urlthumb'],
                                    "time": datetime.datetime.fromtimestamp(time.time()).strftime('%Y-%m-%d %H:%M:%S')
                                    })

    # add the newly added image to the user's uploaded items
    users_table = dynamodb.Table("users")
    user_details = users_table.get_item(Key={'id': event['userid']})

    if user_details and user_details["Item"]:
        user_details_item = user_details["Item"]
        user_uploaded_images = user_details_item.get("uploaded_images", None)

        # create an empty list if there are no images uploaded by the user yet
        if user_uploaded_images is None:
            print("There are no existing images for the user")
            user_uploaded_images = []

        # Add the ID of the new image to the list
        user_uploaded_images.append(image_id)

        # Update the users table
        users_table.update_item(Key={'id': event['userid']}, UpdateExpression='SET uploaded_images =  :element',
                                ExpressionAttributeValues={':element': user_uploaded_images})

        print("Updated the user table with the newly added image")

    return 'Insert Image Entry Success'


# Image reko function
def detect_labels(bucket, key):
    response = rekognition.detect_labels(Image={"S3Object": {"Bucket": bucket, "Name": key}},
                                         MaxLabels=5,
                                         MinConfidence=80)
    return response


# added 31th May
def detectmoderationlabels(bucket, key):
    response2 = rekognition.detect_moderation_labels(Image={"S3Object": {"Bucket": bucket, "Name": key}},
                                                     MinConfidence=90)
    return response2

def send_email_to_moderator(moderator_email, subject, body):
    """
        Send email to the followee with the followee email ID
    """
    # Create a new SES resource and specify a region.
    client = boto3.client('ses',region_name=AWS_REGION)

    # Try to send the email.
    try:
        #Provide the contents of the email.
        response = client.send_email(
            Destination={
                'ToAddresses': [
                    moderator_email,
                ],
            },
            Message={
                'Body': {
                    'Text': {
                        'Charset': CHARSET,
                        'Data': body,
                    },
                },
                'Subject': {
                    'Charset': CHARSET,
                    'Data': subject,
                },
            },
            Source=SENDER
        )
    # Display an error if something goes wrong.
    except ClientError as e:
        print(e.response['Error']['Message'])
    else:
        print("Email sent! Message ID:"),
        print(response['MessageId'])
