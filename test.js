module.exports = work;

function work() {};

const resp = {
        "object": "whatsapp_business_account",
        "entry": [
          {
            "id": "106906859067125",
            "changes": [
              {
                "value": {
                  "messaging_product": "whatsapp",
                  "metadata": {
                    "display_phone_number": "61435003525",
                    "phone_number_id": "117251194692270"
                  },
                  "contacts": [
                    {
                      "profile": {
                        "name": "Ganesh"
                      },
                      "wa_id": "61451105107"
                    }
                  ],
                  "messages": [
                    {
                      "context": {
                        "from": "61435003525",
                        "id": "wamid.HBgLNjE0NTExMDUxMDcVAgARGBIzMDAzRTFFRjY3NUE1OEY3Q0MA"
                      },
                      "from": "61451105107",
                      "id": "wamid.HBgLNjE0NTExMDUxMDcVAgASGBQzQUNFOTQzQjVERkI0QzhCQTVDQQA=",
                      "timestamp": "1683506765",
                      "type": "button",
                      "button": {
                        "payload": "Know more",
                        "text": "Know more"
                      }
                    }
                  ]
                },
                "field": "messages"
              }
            ]
          }
        ]
      };


work.checkResp = () => {

    const req_body = resp;

    if (req_body) {
        if (req_body.entry[0]) {
          const changes = req_body.entry[0].changes;
          console.log(changes);
          const { value } = changes[0];
          if (value && value.messages && value.messages[0] ) {
              if (value.messages[0].button) {
                const whatsAppMsg = value.messages[0].button.text;
                console.log(whatsAppMsg);
                /*
                const 
                const detail = {
                    'event': 'ViewContent'
                }
                if (whatsAppMsg.) {
    
                }
                sendEvents(ctx.body);
                */
              }
          }
        }

    }
}


