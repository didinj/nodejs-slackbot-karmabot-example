# Karma Bot - The Example of Slack Bot using Node.js and MongoDB

Slack bot example of karma point send and receive base on `thanks` keyword mentioned to other user.

## Prerequisite

The following framework, language and skills are required before working on this Slack bot development:

* [Javascript](https://www.javascript.com/learn/javascript/strings)
* [Node.js](https://nodejs.org/en/)
* [MongoDB](https://www.mongodb.com/)
* [Mongoose.js](http://mongoosejs.com/)
* [Slack RTM](https://api.slack.com/rtm)
* [Git](https://git-scm.com/)
* Terminal (Mac/Linux) or Command line (Windows)
* IDE or Text Editor

## Install Node.js Environment

You can find details instruction on how to install Node.js in your operating system [here](https://nodejs.org/en/download/).  

## Install MongoDB

You can find details instruction on how to install MongoDB server [here](https://docs.mongodb.com/v3.4/installation/).   

## Get Slack API Key

The main purpose of this Bot development is using Slack API, for that you need to get Slack API Key. Step-by-step instruction is very clear on [Slack help](https://get.slack.help/hc/en-us/articles/215770388-Create-and-regenerate-API-tokens)

## Run App Locally

* Make sure recommended version of Node.js installed
* Clone this repo
* Run `npm install`
* Run `BOT_API_KEY=xoxb-XXXXXXX-XXXXXXXXX node bin/bot.js` which BOT_API_KEY get from your Slack Team Token
* On Slack, invite karmabot to existing channels
