// import * as Koa from 'koa'
// import * as route from 'koa-route'
// import * as bodyParser from 'koa-bodyparser'

const Koa = require('koa');
const route = require('koa-route')
const bodyParser = require('koa-bodyparser')
const uuidv4 = require('uuid/v4')

var AWS = require('aws-sdk');
AWS.config.update({
    region: 'eu-west-1',
    endpoint: 'https://dynamodb.eu-west-1.amazonaws.com'
});

const table = 'scavenger-hunt-photos';

const app = new Koa();
app.use(bodyParser())

app.use(route.get('/', async ctx => {
    var docClient = new AWS.DynamoDB.DocumentClient()
    
    
    var params = {
        TableName: table
    };
    
    const data = await new Promise(resolve => {
        docClient.scan(params, function(err, data) {
            if (err) {
                console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
            } else {
                console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
            }
            resolve(data)
        });
    })
    
    ctx.body = JSON.stringify(data)
}));

app.use(route.get('/questions', async ctx => {
  ctx.body = JSON.stringify(
      {
          questions: [
              {
                  id: '1',
                  title: 'Question 1 Title',
                  description: 'Question 1 Description'
              },
              {
                  id: '2',
                  title: 'Question 2 Title',
                  description: 'Question 2 Description'
              }
          ]
      }
  ) 
}));

app.use(route.post('/:team/photo', async (ctx, team) => {
    var docClient = new AWS.DynamoDB.DocumentClient()

    var params = {
        TableName: table,
        Item: {
            id: uuidv4(),
            question: ctx.request.body.question,
            team: team,
            photo: ctx.request.body.photo 
        }
    };

    docClient.put(params, function(err, data) {
        if (err) {
            console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("PutItem succeeded:", JSON.stringify(data, null, 2));
        }
    });
    
  ctx.body = 'OK' 
}));

app.use(route.get('/:team/photo', async (ctx, team) => {
    var docClient = new AWS.DynamoDB.DocumentClient()

    var params = {
        TableName: table,
        IndexName: "team-index",
        KeyConditionExpression: 'team = :t',
        ExpressionAttributeValues: {
            ":t": team
        }
    };

    const data = await new Promise(resolve => {
        docClient.query(params, (err, data) => {
            if (err) {
                console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
            } else {
                console.log("Query succeeded:", JSON.stringify(data, null, 2));
            }
            resolve(data)
        });
    })
    
    ctx.body = JSON.stringify(data)
}));

app.listen(3000);
