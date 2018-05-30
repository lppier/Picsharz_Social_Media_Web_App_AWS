import boto3
import uuid
import datetime
import time

rekognition = boto3.client('rekognition')
main_images_bucket_name = "team30ws-mediarepofinal"
resized_images_bucket_name = "team30ws-mediarepofinalresized"

# seconds after which the URL will expire - set to 1 week
url_expires_in = 604799

def lambda_handler(event, context):
    print("Loading function")
    print("userid = " + event['userid'])
    print("description = " + event['description'])
    print("tag1 = " + event['tag1'])
    print(event['urlmain'])
    print(event['urlthumb'])

    taglist = []  # [event['tag1'], event['tag2'], event['tag3'], event['tag4'], event['tag5']]

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

    # Generate the pre signed URL for the main image
    presigned_url_main_image = s3.generate_presigned_url(
    ClientMethod='get_object',
    Params={
        'Bucket': main_images_bucket_name,
        'Key': event['key']
    },
    ExpiresIn = url_expires_in
    )
    
    presigned_url_thumb_image = s3.generate_presigned_url(
    ClientMethod='get_object',
    Params={
        'Bucket': resized_images_bucket_name,
        'Key': event['key']
    },
    ExpiresIn = url_expires_in
    )


    dynamo_table.put_item(Item={"id": image_id, "description": event['description'],
                                "tags": taglist, "title": event['title'], "upload_user": event['userid'],
                                "url_main": event['urlmain'],
                                "url_thumb": event['urlthumb'],
                                "time": datetime.datetime.fromtimestamp(time.time()).strftime('%Y-%m-%d %H:%M:%S'),
                                "presigned_url_main": presigned_url_main_image,
                                "presigned_url_thumb": presigned_url_thumb_image
                                })
     
    # add the newly added image to the user's uploaded items
    users_table = dynamodb.Table("users")
    user_details = users_table.get_item(Key = {'id' : event['userid']})

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
        users_table.update_item(Key = {'id': event['userid']}, UpdateExpression = 'SET uploaded_images =  :element',
                                    ExpressionAttributeValues = {':element' : user_uploaded_images})
        
        print("Updated the user table with the newly added image")



    return 'Insert Image Entry Success'


# Image reko function
def detect_labels(bucket, key):
    response = rekognition.detect_labels(Image={"S3Object": {"Bucket": bucket, "Name": key}},
                                         MaxLabels=5,
                                         MinConfidence=80)
    return response
