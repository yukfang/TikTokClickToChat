const axios = require("axios");
const pixelCode = 'CGCJ2VRC77UA9DC1TNDG';
const accessToken = 'b4601a65a77fe40191bf7ed27ec4647e3f84054f';

// TikTok Events API invokation
//Ad Acct Id - 7165781288253751297
const sendEvents = (detail) => axios.create({
    baseURL: 'https://business-api.tiktok.com/open_api/v1.2/pixel/track/',
    timeout: 1000,
    headers: {
        'Access-Token': accessToken,
        'Content-Type': 'application/json'
    },
    body: {
        "pixel_code": pixelCode,
        "event": detail.eventType,
        "event_id": Math.floor(Math.random() * 1000000000000) + 1,
        "timestamp": Date.now(),
        "context": {
          "ad": {
            "callback": "123ATXSfe"
          },
          "page": {
            "url": "https://apac.mpo.pub/",
            "referrer": "https://apac.mpo.pub/"
          },
          "user": {
            "external_id": "f0e388f53921a51f0bb0fc8a2944109ec188b59172935d8f23020b1614cc44bc"
          },
          "user_agent": "Mozilla/5.0 (platform; rv:geckoversion) Gecko/geckotrail Firefox/firefoxversion",
          "ip": "13.57.97.131"
        },
      "properties": {
        "contents": [
          {
                "content_id": "5678AB",
                "content_category": "Kids",
                "content_name": "Product 1",
                "quantity": 1,
                "price": 29.99
            },
            {
                "content_id": "6521FJ",
                "content_category": "Kids",
                "content_name": "Product 2",
                "quantity": 1,
                "price": 49.99
            }
        ],
        "currency": "AUD",
        "value": 80.00
      }
    }
})
.then ((response) => {
    console.log(response);
})
.catch((error) => {
    console.log(error);
});

module.exports = { sendEvents };