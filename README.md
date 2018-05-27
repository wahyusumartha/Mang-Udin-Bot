# BOT Mang Udin 

Mang Udin is a Slack Bot that has a main function to send a reminder for each of users inside a particular channel. In our case we use `Mang Udin` to send a gently reminder to each of team member to do daily standup at 10 AM 😀.

# Pre Requirement
* NodeJS Runtime 8.10
* Serverless Framework 
* Slack Account

# Install 
* First of all, you have to clone its repository
```
git clone https://github.com/Etsuriltd/Mang-Udin-Bot.git
```

* Install Required Packages
You can install required packages by running this command 
``` npm install ``` 

* Configure Token and Channel 
As explained before, this is a Slack Application, so that you need to have a team slack account and create an application with it. Once its done you will get a token that you can use and put it in `env.yml` file. 
There are three variables that need to be configured inside that file. 
1. token - this is a token that you will get from Slack 
2. channel_destination - Each team has different their own time clock, we use channel to identify each of team members that will get a reminder message 
3. channel_name - Name of your channel 

* Configure Serverless.yml
Serverless.yml is a configuration that you need for Lambda Deployment. There is a specific configuration that need to be set for your scheduled. 

In our case we have a daily standup at 10 AM Jakarta Time, so that in our configuration file we will tell Lambda to send a reminder every Monday to Friday at 10 AM, by setting this configuration: 
` - schedule: cron(0 03 ? * MON-FRI *)` (UTC Time)
