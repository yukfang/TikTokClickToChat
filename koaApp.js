const fs  = require('fs');
const Koa = require('koa');
const router = require('koa-router')();
const { koaBody } = require('koa-body');
const { sendEvents } = require('./ttEventsApi');
const koaApp = new Koa();

const CALLBACK_BUFF = []
const PROMO_CODE = new Map();


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

router.get('/ttclid/:num', (ctx, next) => {
    ctx.body = fs.readFileSync('middle.html', {encoding:'utf8', flag:'r'});
})

router.get('/promo/:code', (ctx, next) => {
    let code = ctx.params.code || 5; // Max 5 maybe

    ctx.body = fs.readFileSync('middle.html', {encoding:'utf8', flag:'r'});
})

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
    if (req_body && req_body.entry) {
        // console.log(req_body.entry)
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

const ALPHA_B = ['A', 'B', 'C', 'D', 'E', 'F']
koaApp.use(async (ctx, next) => {
    if (ctx.path === '/') {
        const ttclid = ctx.request.query['ttclid']
        const promo = ctx.request.query['promo']

        if(promo) {
            console.log(`promo code not null`)
            ctx.body = fs.readFileSync('index.html', {encoding:'utf8', flag:'r'});
        } else if(ttclid) {
            console.log(`click id not null ${ttclid}`)

            // Generate Promo Code
            let promocode = '';
            if(PROMO_CODE.has(ttclid)) {
                promocode = PROMO_CODE.get(ttclid)
            }  else {
                const max = ALPHA_B.length - 1
                for(let i = 0; i < 6; i++) {
                    const index = Math.random() * max
                    promocode += ALPHA_B.slice(index, index + 1)
                }
                PROMO_CODE.set(ttclid, promocode)
            }

            ctx.set('Promote-Code', promocode); // set to response header
            ctx.cookies.set('Promote-Code', promocode, {httpOnly: false}); // set to cookie

            ctx.status = 301;
            console.log(`redirct`)
            ctx.redirect(`/?promo=${promocode}`);
        } else {
            ctx.body = fs.readFileSync('index.html', {encoding:'utf8', flag:'r'});
        }
    } else if (ctx.path === '/gp') {
        ctx.body = fs.readFileSync('gp.html', {encoding:'utf8', flag:'r'});
    } else if (ctx.path === '/middle') {
        ctx.body = fs.readFileSync('middle.html', {encoding:'utf8', flag:'r'});
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


