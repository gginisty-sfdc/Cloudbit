var koa = require('koa')
var koaParseJson = require('koa-parse-json')
var route = require('koa-route')
var fetch = require('node-fetch');



var port = Number(process.env.PORT) || 7800
var app = koa()



app.use(koaParseJson())



/* On a root GET respond with a friendly message explaining that this
application has no interesting client-side component. */

app.use(route.get('/', function *() {

  this.body = 'Hello, this is a trivial cloudBit Reader App. Nothing else to see here; all the action happens server-side.  To see any recent input activity from webhook-registered cloudBits do this on the command line: `heroku logs --tail`.'

}))



/* On a root POST log info about the (should be) cloudBit event. */

app.use(route.post('/', function *() {

  console.log('received POST: %j', this.request.body)

  if (this.request.body && this.request.body.type) {
    handleCloudbitEvent(this.request.body)
  }

  this.body = 'OK'

}))



app.listen(port)
console.log('App booted on port %d', port)



// Helpers

function handleCloudbitEvent(event) {
	console.log('event.type: ',event.type);
  switch (event.type) {
    case 'amplitude':
      // Do whatever you want with the amplitde
      console.log('inside switch case, event.payload: ',event.payload)
      console.log('cloudBit input received: %d%', event.payload.percent)
      fetch('https://legocity4.my.salesforce.com/services/data/v42.0/sobjects/Tire_event__e', { 
        method: 'POST',
        body: JSON.stringify({"Tire_id__c":"156","Pressure__c":event.payload.percent}),
        headers: {'Content-Type': 'application/json', 'authorization': 'Bearer 00Df4000002cqlJ!AREAQAHUBih5PskdR7UGzUo2heJgT4xXAAkHIe6l0sTHyjchBHpRVhlXwwCDbAi73UegWeOYv9vrdKIi_s1_zbwc3ccI6v.1'},
      })
	      .then(res => res.json())
        .then(json => console.log("json", json))
        .catch(err => console.error("err", err));
      break
    case 'connectionChange':
      // One day, cloudBits will emit this event too, but not yet.
      break
    default:
      console.warn('cloudBit sent an unexpected event: %j', event)
      break
  }
}
