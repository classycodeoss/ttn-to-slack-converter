const express = require('express');

const axios = require('axios');

const app = express();
const port = 8080; // default port to listen
const slackUrl = 'https://slack.com/api/chat.postMessage';
const config = {
  headers: {
    Authorization:
      'Bearer xoxb-XXXXXXXXX-XXXXXXXXXX-XXXXXXXXXXXXXXXXXXXXXXX',
  },
};

app.use(express.json());

const humidities = new Map([
  ['ttgo-sensor-01', 'Very Wet'],
  ['ttgo-sensor-02', 'Very Wet'],
]);

// define a route handler for the default home page
app.get('/', (req, res) => {
  res.send('TTN to slack converter.');
});

app.post('/ttn', (req, res) => {
  const deviceId = req.body.end_device_ids.device_id;
  const humidity = req.body.uplink_message.decoded_payload.humidity;
  let pictureUrl = getPictureUrl(deviceId);

  if (humidities.get(deviceId) && humidity !== humidities.get(deviceId)) {
    humidities.set(deviceId, humidity);
    console.log(`Humidity updated: ${deviceId} to ${humidity}`);
    axios.post(
      slackUrl,
      {
        channel: 'C01S8VCPCKZ',
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `Sensor *${deviceId}* updated its humidity:`,
            },
          },
          {
            type: 'divider',
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `This is my humidity: ${humidity}`,
            },
            accessory: {
              type: 'image',
              image_url: pictureUrl,
              alt_text: 'alt text for image',
            },
          },
        ],
      },
      config
    );
    res.send(`Successfully updated humidity of ${deviceId}`);
  } else {
    res.send('No changes neccessary');
  }
});

// start the Express server
app.listen(port, () => {
  console.log(`server started at http://localhost:${port}`);
});

function getPictureUrl(deviceId) {
  let pictureUrl;
  switch (deviceId) {
    case 'ttgo-sensor-01':
      pictureUrl =
        'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=2166&q=80';
      break;
    case 'ttgo-sensor-02':
      pictureUrl =
        'https://images.unsplash.com/photo-1512428813834-c702c7702b78?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1234&q=80';
      break;
    default:
      pictureUrl =
        'https://s3-media3.fl.yelpcdn.com/bphoto/c7ed05m9lC2EmA3Aruue7A/o.jpg';
      break;
  }
  return pictureUrl;
}
