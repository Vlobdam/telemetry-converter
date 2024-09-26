function convert (JSONInput) {
  let input 
  
  try {
    input = JSON.parse(JSONInput)  
  } catch {
    throw(new Error("Input is not JSON"))
  } 

  const deviceName = exists(input?.deviceInfo?.deviceName, 'device name')
  const deviceType = exists(input?.deviceInfo?.deviceProfileName, 'device type')
  const devEui = exists(input?.deviceInfo?.devEui, 'devEui')

  const ts = Number(new Date(input?.time))

  if (isNaN(ts)) {
    throw new Error('Time is Invalid')
  }

  const data = exists(input?.data, 'data')
  const utf8Encode = new TextEncoder();
  const decoded = utf8Encode.encode(atob(data))
  
  console.log(decoded)

  const values = {
    temperature: {
      id: 2,
      type: 34,
    }, 
    
    battery: {
      id: 1,
      type: 69
    },
    
    humidity:{
      id: 4,
      type: 104,
    }
  }

  let parsing = 0;

  for (let i = 0; i < decoded.length; i++) {
    if (parsing === 0) {
      (Object.values(values).every((value) => {   
        if (decoded[i] === value.id && decoded[i + 1] === value.type) {
          parsing = value.id

          i += 2 
          return false
        }
        return true
      }))
    }
    
    if (parsing === values.temperature.id){
      values.temperature.value = (decoded[i] * 16 ** 2 + decoded[i + 1]) / 100;
      parsing = 0;
      i++
      continue;
    }

    if (parsing === values.battery.id) {
      values.battery.value = decoded[i];
      parsing = 0;
      continue;
    }

    if (parsing === values.humidity.id) {
      values.humidity.value = decoded[i];
      parsing = 0;
      continue
    }
  }

  const humidity = exists(values.humidity?.value, 'humidity');
  const temperature = exists(values.temperature?.value, 'temperature')
  const battery = exists(values.battery?.value, 'battery')

  if (humidity < 0 || humidity > 100) {
    throw new Error('Invalid humidity')
  }

  if (battery < 0 || battery > 100) {
    throw new Error('Invalid battery')
  }

  const output = {
    deviceName,
    deviceType,
    attributes: {
      devEui
    },
    telemetry:{
      values: {
        humidity,
        temperature,
        battery,
      },
      ts,
    }
  }

  return JSON.stringify(output)
}

const exists = (val, name) => {
  if (!val) {
    throw new Error(`Invalid ${name}`)
  }

  return val
}

const a = JSON.stringify({
    "deviceInfo": {
        "deviceName": "A1",
        "deviceProfileName": "P1",
        "devEui": "1000000000000001"
    },
    "time": "2023-05-22T07:47:05.404859+00:00",
    "data": "AUVdAiIOTARoIA=="
  }
)

// {
//   "deviceName": "A1",
//   "deviceType": "P1",
//   "attributes": {
//       "devEui": "1000000000000001"
//   },
//   "telemetry": {
//       "ts": 1684741625404,
//       "values": {
//           "battery": 93,
//           "temperature": 36.6,
//           "humidity": 32
//       }
//   }
// }


console.log(convert(a))