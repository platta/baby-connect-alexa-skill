# Baby Connect Project
This repository contains one part of a multi-part project to enable the
automation of adding data to the [Baby Connect](https://www.baby-connect.com)
service.

The flow is:

- User interacts with Amazon Echo
- Alexa skill is triggered (__baby-connect-alexa-skill__)
- The Alexa skill sends a message to an AWS SQS message queue.
- A Raspberry Pi running a listener
([baby-connect-sqs-listener](https://github.com/platta/baby-connect-sqs-listener))
receives the message from the message queue.
- The listener uses a library
([baby-connect](https://github.com/platta/baby-connect)) to log into the Baby
Connect web site and add the data.

Since Baby Connect doesn't expose an API, the
([baby-connect](https://github.com/platta/baby-connect)) library uses browser
automation. This requires launching chromium as a child process which is not
supported in Lambda and is the reason we use a message queue with a standalone
listener application.

# baby-connect-alexa-skill

This repository contains the resources necessary to create an Alexa Skills Kit
skill to allow you to use your Echo to log data into Baby Connect.

## Setup

You'll need to create an account on
[Amazon Developer](https://developer.amazon.com) to begin creating your skill.

You can read through the
[Custom Skill Tutorial](https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/overviews/steps-to-build-a-custom-skill)
to get an understanding of the components involved. Some resources are required
besides the code for the Lambda function that will drive the skill. These
resources can be found in the `speechAssets` folder.

To prepare the Lambda function, install the dependencies in the `src` folder
using `npm`.

```bashp
cd src
npm install
```

Create a `config.json` file in the `src` folder using `config.default.json` as
a model.

Zip the files in the `src` folder (not the folder itself) and upload that as the
source of your Lambda function.