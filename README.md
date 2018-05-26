# Serverless and Typescript Starter

This is a starter project for those who need to write a lambda application with typescript by using `Serverless` Framework.

These starters includes:
* Serverless With Default Setup
* Typescript Setup (including linting)
* Jest Default Configuration Setup

# Pre requirement

* NodeJS Runtime 

# Getting Started
* Clone the Repository

``` 
git clone --depth=1 https://github.com/Etsuriltd/Lambda-Serverless-TypeScript-Starter.git <your-project-name>
```

* Install Dependencies
```
cd <your-project-name>
npm install
```

* Run 
This project has an example to make sure this starter works, you could try it with running these command:

```
npm run build 
npm test
serverless invoke local --function hello
```