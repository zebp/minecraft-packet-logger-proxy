# minecraft-packet-logger-proxy

A MITM proxy to log the outgoing packets to a minecraft server.

## Installation Requirements

You must have [NodeJS](https://nodejs.org/en/download/) and [NPM](https://www.npmjs.com/get-npm) installed and on your path.

## Usage

1. Clone or download this repo
2. Run `npm install` inside of the directory to
2. Create your own `.env` file, use the `.env.schema` file as a template
3. Build the application with `npm build` ***optional***
4. Run the application with `npm start`

## Output

Packets are saved in the `output` directory.

### Example

```json
[
    {
        "meta": {
            "size": 2,
            "name": "flying",
            "state": "play"
        },
        "data": {
            "onGround": true
        }
    },
    {
        "meta": {
            "size": 11,
            "name": "block_dig",
            "state": "play"
        },
        "data": {
            "status": 0,
            "location": {
                "x": -79,
                "y": 64,
                "z": 271
            },
            "face": 1
        }
    },
    {
        "meta": {
            "size": 1,
            "name": "arm_animation",
            "state": "play"
        },
        "data": {}
    },
    {
        "meta": {
            "size": 34,
            "name": "position_look",
            "state": "play"
        },
        "data": {
            "x": -78.62225150824598,
            "y": 65,
            "z": 273.80310911827263,
            "yaw": 539.9267578125,
            "pitch": 37.41429901123047,
            "onGround": true
        }
    }
```