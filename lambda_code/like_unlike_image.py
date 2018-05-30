import boto3
import json

client = boto3.resource("dynamodb")
users_table_name = 'users'
images_table_name = 'image_details'
users_table = client.Table(users_table_name)
images_table = client.Table(images_table_name)

def update_dynamodb(user_id, image_id, likes_list, like_by_list):
        updated_user_record = users_table.update_item( Key = {'id': user_id},UpdateExpression = 'SET likes = :element',
                                       ExpressionAttributeValues = {':element' : likes_list}, ReturnValues = 'ALL_NEW' )        
        images_table.update_item(Key = {'id': image_id}, UpdateExpression = 'SET like_by =  :element',
                                ExpressionAttributeValues = {':element' : like_by_list})
        return updated_user_record

def lambda_handler(event, context):
    event_body = event.get("body")
    if event_body is not None:
        print(event_body)

        # if the event body is a str, convert to dict
        if isinstance(event_body, str):
            event_body = json.loads(event_body)

        user_id = event_body.get("user_id")
        image_id = event_body.get("image_id")

        print("User ID: {0} and Image ID: {1}".format(user_id, image_id))

        user_details = users_table.get_item(Key = {'id' : user_id})
        image_details = images_table.get_item(Key = {'id' : image_id})
        user_details_items = user_details["Item"]
        image_details_items = image_details["Item"]

        if 'likes' not in user_details_items:
            likes_list = []
        else:
            likes_list = user_details_items["likes"]

        if 'like_by' not in image_details_items:
            like_by_list = []
        else:
            like_by_list = image_details_items["like_by"]
    
        if image_id not in likes_list:
            likes_list.append(image_id)
            if user_id not in like_by_list:
                like_by_list.append(user_id)
            updated_user_record = update_dynamodb(user_id, image_id, likes_list, like_by_list)       
            print("Likes and like_by added successfully.")
        else:
            likes_list.remove(image_id)
            if user_id in like_by_list:
                like_by_list.remove(user_id)
            
            updated_user_record = update_dynamodb(user_id, image_id, likes_list, like_by_list)
            print("Likes and like_by removed successfully.")

        response = {}
        response["statusCode"] = 200
        response["headers"] = { "Access-Control-Allow-Origin": "*" }
        response["body"] = json.dumps(updated_user_record)
        response["isBase64Encoded"] = False
        return response   


if __name__ == "__main__":
    event = {}
    event["body"] = "{ \"user_id\": \"pier6\", \"image_id\": \"5\" }"
    # event["body"] = { "user_id": "3", "following_id": "7" }
    print(lambda_handler(event, None))
