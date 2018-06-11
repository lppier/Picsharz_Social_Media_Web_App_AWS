# Picsharz_CodeDeploy
Code committed to this repository will automatically be deployed onto the production Picsharz server using Github -> AWS CodeDeploy -> Deployment Groups infrastructure.

PicSharz - a social photo sharing app with a cloud native architecture powered by AWS

In an era where most applications that migrate to the cloud adopt a lift and shift approach, we have designed and developed ground up a serverless application that is completely cloud-native using Amazon Web Services (AWS). We have built Picsharz, a social photo sharing application that we envision would cater seamlessly to 12,000 monthly active users. 

The application heavily leverages the Platform as a Service (PaaS) offerings of AWS – Lambdas as serverless compute, Dynamo DB as NoSQL document database, EC2 to host the website, etc. We also utilise some of the innovative offerings from AWS like Rekognition and Elastic search for some of our functionalities. Picsharz provides most of the features that one would expect from a social image sharing application like user management, secured access to assets, interactions with the user interface and notifications on significant events.

Picsharz is also accompanied by useful aggregate analytics on the usage patterns that can be efficiently viewed by the administrators of the application using interactive visualisations. Finally, the development of the app was streamlined using code deploy such that any changes that were committed to source control would immediately reflect on the website hosted on EC2 automatically.

We have developed a serverless cloud-native application to compete with the best photo sharing apps that are available. 

# Team Members
* Anurag Chatterjee
* Bhujbal Vaibhav Shivaji
* Lim Pier
* Pratyush Mishra
* Tsan Yee Soon


Project Report Here : https://github.com/lppier/Picsharz_CodeDeploy/blob/master/Project-Report-PicSharz-SocialPhotoSharingAppAWS.pdf


Documentation to link Github to CodeDeploy
https://docs.aws.amazon.com/codedeploy/latest/userguide/integrations-partners-github.html
https://aws.amazon.com/blogs/devops/automatically-deploy-from-github-using-aws-codedeploy/
