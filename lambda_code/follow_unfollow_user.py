import boto3
import json

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
    event["body"] = "{ \"user_id\": \"3\", \"following_id\": \"7\" }"
    # event["body"] = { "user_id": "3", "following_id": "7" }
    print(lambda_handler(event, None))
