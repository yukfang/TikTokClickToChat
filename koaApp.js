const fs  = require('fs');
const Koa = require('koa');
const router = require('koa-router')();
const { koaBody } = require('koa-body');
const { sendEvents } = require('./ttEventsApi');
const koaApp = new Koa();

const CALLBACK_BUFF = []

koaApp.use(koaBody());
koaApp.use(router.routes());



koaApp.use(async (ctx, next) => {
    await next();
    const rt = ctx.response.get('X-Response-Time');
    console.log(`${ctx.method} ${ctx.url} - ${rt}`);
});

// x-response-time
koaApp.use(async (ctx, next) => {
    const start = Date.now();
    await next();
    const ms = Date.now() - start;
    ctx.set('X-Response-Time', `${ms}ms`);
});

router.get('/monitor/:num', (ctx, next) => {
    let num = ctx.params.num || 5; // Max 5 maybe
    ctx.body = JSON.stringify(CALLBACK_BUFF.reverse().slice(0, num), null, 2)
})
router.get('/monitor', (ctx, next) => {
    // let num = ctx.params.num || 5; // Max 5 maybe
    ctx.body = JSON.stringify(CALLBACK_BUFF.reverse().slice(0, 5), null, 2)
})
router.all('/callback', (ctx, next) => {
    // Need to implementa Facebook callback challenge here:
    let query =  ctx.query
    let headers = ctx.request.headers
    let req_body = ctx.request.body

    const resp_body = {
        ts: new Date(Date.now()).toISOString(),
        query, headers, req_body
    }
    CALLBACK_BUFF.push(resp_body)



    let mode = query["hub.mode"];
    let token = query["hub.verify_token"];
    let challenge = query["hub.challenge"];
    if (mode && token) {
        if (mode === "subscribe" && token != null) {
            // Respond with the challenge token from the request
            console.log("WEBHOOK_VERIFIED");
            ctx.body = challenge
        }
    } else {
        ctx.body = JSON.stringify(resp_body, null, 2);
    }

    //Invoke TikTok Events API
    if (req_body) {
        if (req_body.entry[0]) {
          const changes = req_body.entry[0].changes;
          // console.log(changes);
          const { value } = changes[0];
          if (value && value.messages && value.messages[0] ) {
              if (value.messages[0].button) {
                const whatsAppMsg = value.messages[0].button.text;
                // WhatsApp Msg Response
                console.log(whatsAppMsg);
                const eventDetail = {};
                if (whatsAppMsg && whatsAppMsg === 'Know more') {
                  eventDetail.eventType = 'AddToCart';
                  //Trigger Events API
                  sendEvents(eventDetail);
                } else if (whatsAppMsg && whatsAppMsg === 'Not interested') {
                    eventDetail.eventType = 'Purchase';
                    //Trigger Events API
                    sendEvents(eventDetail);
                }
              }
          }
        }
    }
})

koaApp.use(async (ctx, next) => {
    if (ctx.path === '/') {
        ctx.body = fs.readFileSync('index.html', {encoding:'utf8', flag:'r'});
    }
    next();
})


async function init() {
    console.log(`Server Init ---> ${(new Date(Date.now())).toISOString()}`);
}

module.exports = {
  koaApp,
  init,
};


