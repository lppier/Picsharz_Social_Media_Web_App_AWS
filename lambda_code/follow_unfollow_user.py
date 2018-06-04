import boto3
import json
from botocore.exceptions import ClientError

# The sender for the email
SENDER = "picsharz@gmail.com"

# The AWS region
AWS_REGION = "us-east-1"

# The subject line for the email.
SUBJECT = "PicSharz: Hoorayy!! Your popularity increased by 1!!"

# The character encoding for the email.
CHARSET = "UTF-8"

# The email body for recipients with non-HTML email clients.
BODY_TEXT = "Hello {0}!! User {1} is now following you! Your new popularity score is {2}."

# The HTML body of the email.
BODY_HTML = """
<html>
<head></head>
<body>
  <h2>Dear {0},</h2>
  <h2>You have a new follower!</h2>
  <p><b>{1}</b> is now following you.</p> <p> Your new popularity score is <b>{2}</b>.</p>
  <hr />
  <p>Thanks, <p>Team PicSharz</p></p>
</body>
</html>
"""    

client = boto3.resource("dynamodb")
table_name = 'users'
users_table = client.Table(table_name)

def update_dynamodb(user_id, following_id, following_list, followers_list):
        # Update the current user record
        current_user_updated_value = users_table.update_item( Key = {'id': user_id},UpdateExpression = 'SET following = :element',
                                       ExpressionAttributeValues = {':element' : following_list}, ReturnValues = 'ALL_NEW' )        
        
        # Update the record for the user the current user started following
        users_table.update_item(Key = {'id': following_id}, UpdateExpression = 'SET followers =  :element',
                                ExpressionAttributeValues = {':element' : followers_list})

        return current_user_updated_value

def send_email_to_followee(followee_email_id, follower_user_name, followee_user_name, followee_new_popularity_score_str):
    """
        Send email to the followee with the followee email ID
    """
    if followee_email_id:
        # Create a new SES resource and specify a region.
        client = boto3.client('ses',region_name=AWS_REGION)

        # Try to send the email.
        try:
            #Provide the contents of the email.
            response = client.send_email(
                Destination={
                    'ToAddresses': [
                        followee_email_id,
                    ],
                },
                Message={
                    'Body': {
                        'Html': {
                            'Charset': CHARSET,
                            'Data': BODY_HTML.format(followee_user_name, follower_user_name, followee_new_popularity_score_str),
                        },
                        'Text': {
                            'Charset': CHARSET,
                            'Data': BODY_TEXT.format(followee_user_name, follower_user_name, followee_new_popularity_score_str),
                        },
                    },
                    'Subject': {
                        'Charset': CHARSET,
                        'Data': SUBJECT,
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


def get_user_email_from_userid(userid):
    if userid:
        email = ""
        client = boto3.client('cognito-idp')
        response = response = client.admin_get_user(
        UserPoolId = 'us-east-1_SDBkZhuhS',
        Username = userid
        )
        # print(response)
        user_attributes = response.get("UserAttributes")
        if user_attributes:
            for attr in user_attributes:
                if attr.get("Name"):
                    if attr["Name"] == "email":
                        email = attr["Value"]
        
        print("The email of the user with ID: {0} is {1}.".format(userid, email))
        return email

def lambda_handler(event, context):
    print("Event: " + str(event))
    event_body = event.get("body")
    if event_body is not None:
        print("Body: " + str(event_body))
        print(type(event_body))

        if isinstance(event_body, str):
            event_body = json.loads(event_body)

        user_id = event_body.get("user_id")
        following_id = event_body.get("following_id")

        if user_id and following_id: 
            user_details = users_table.get_item(Key = {'id' : user_id})
            following_details = users_table.get_item(Key = {'id' : following_id})
            user_details_items = user_details["Item"]
            following_details_items = following_details["Item"]
            if 'following' not in user_details_items:
                following_list = []
            else:
                following_list = user_details_items["following"]

            if 'followers' not in following_details_items:
                followers_list = []
            else:
                followers_list = following_details_items["followers"]
        
            if following_id not in following_list:
                print("not in following_list")
                following_list.append(following_id)
                if user_id not in followers_list:
                    followers_list.append(user_id)
                updated_current_user_record = update_dynamodb(user_id, following_id, following_list, followers_list)       
                print("Following and follower Successfully added.")
                
                try:
                    # Email is send to following_id user's email
                    followee_email_id = get_user_email_from_userid(following_id)
                    send_email_to_followee(followee_email_id, user_id, following_id, str(len(followers_list)))
                except Exception as ex:
                    print("An error occurred while trying to send email: " + str(ex))
            else:
                print("in following_list")
                following_list.remove(following_id)
                if user_id in followers_list:
                    followers_list.remove(user_id)
                
                updated_current_user_record = update_dynamodb(user_id, following_id, following_list, followers_list)
                print("Following and follower Successfully removed.")
            
            response = {}
            response["statusCode"] = 200
            response["headers"] = { "Access-Control-Allow-Origin": "*" }
            response["body"] = json.dumps(updated_current_user_record)
            response["isBase64Encoded"] = False
            return response    


if __name__ == "__main__":
    event = {}
    event["body"] = "{ \"user_id\": \"jaychou\", \"following_id\": \"anchat\" }"
    # event["body"] = { "user_id": "3", "following_id": "7" }
    print(lambda_handler(event, None))
