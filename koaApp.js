const fs  = require('fs');
const Koa = require('koa');
const router = require('koa-router')();
const { koaBody } = require('koa-body');
const koaApp = new Koa();

const CALLBACK_BUFF = []

koaApp.use(koaBody());
koaApp.use(router.routes());



koaApp.use(async (ctx, next) => {
    const rt = ctx.response.get('X-Response-Time');
    console.log(`${ctx.method} ${ctx.url} - ${rt}`);
    await next();
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


