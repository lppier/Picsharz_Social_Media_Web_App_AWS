import boto3
import json

MAX_IMAGES = 20

flatten = lambda l: [item for sublist in l for item in sublist]

def get_image_details(dynamodb_obj, image_id_list):
    """Get the image details of all the images provided by the image ID list"""
    try:
        image_id_list = list(set(image_id_list))
        image_id_query = [{ 'id': item } for item in image_id_list]     
        response = dynamodb_obj.batch_get_item(
        RequestItems={
            'image_details': {
                'Keys': image_id_query,            
                'ConsistentRead': True            
            }
        },
        ReturnConsumedCapacity='TOTAL'
        )
    except Exception as e:
        print(str(e))
    else:
        items = response['Responses']
        if items["image_details"]:
            return items["image_details"]
        

def get_images_uploaded_by_users(dynamodb_obj, user_id_list):
    """Get the images uploaded by the users provided the user ID list"""
    try:
        user_id_list = list(set(user_id_list))
        user_id_query = [{ 'id': item } for item in user_id_list]
        response = dynamodb_obj.batch_get_item(
        RequestItems={
            'users': {
                'Keys': user_id_query,            
                'ConsistentRead': True            
            }
        },
        ReturnConsumedCapacity='TOTAL'
        )
    except Exception as e:
        print(str(e))
    else:
        items = response['Responses']
        # print(items["users"])
        # print(json.dumps(items))
        # print(len(items))
        if items["users"]:
            uploaded_image_ids = [ item["uploaded_images"] for item in items["users"] if item.get("uploaded_images") ]
            return flatten(uploaded_image_ids)

def generate_user_feed_handler(event, context):
    """
       Generate the user feed based on the user id
    """
    print("Event received: " + str(event))

    # Get path parameters
    path_parameters = event["pathParameters"]
    print("userid = " + path_parameters['id'])
    
    user_id =  path_parameters['id']
    if user_id:
        dynamodb = boto3.resource("dynamodb", region_name='us-east-1')

        # Get the images uploaded by the requesting user
        users_table = dynamodb.Table("users")
        user_details = users_table.get_item(Key = {'id' : user_id})

        if user_details and user_details["Item"]:
            user_details_item = user_details["Item"]
            candidate_images = user_details_item.get("uploaded_images", [])
            current_user_following = user_details_item.get("following", None)
            
            # Get details of the images uploaded by each user
            other_user_images = []
            if current_user_following is not None:

                # Get the consolidated list of image ids uploaded by users current user is following
                other_user_image_ids = get_images_uploaded_by_users(dynamodb, current_user_following)
                print(other_user_image_ids)
                if other_user_image_ids is not None:
                    candidate_images.extend(other_user_image_ids)
            
            image_details = []
            if len(candidate_images) > 0:
                image_details = get_image_details(dynamodb, candidate_images)

            print("Number of images retrieved: " + str(len(image_details)))
            required_number_images = min(MAX_IMAGES, len(image_details))

            # Get the most recent images
            image_details = sorted(image_details, key = lambda x: x["time"], reverse=True)[: required_number_images]
            #for image_detail in image_details:
            #    print(image_detail["time"]) 

            response = {}
            response["statusCode"] = 200
            response["headers"] = { "Access-Control-Allow-Origin": "*" }
            response["body"] = json.dumps(image_details)
            response["isBase64Encoded"] = False

            return response


if __name__ == "__main__":
    event = { "pathParameters" : { "id": "4" } }
    response = generate_user_feed_handler(event, None)

    print("Response")
    print(response)