# jsFantasy
An RPG that teaches javaScript.  Created with node.js and socket.io and Express

I am using node.js to create a simple server that can have multiple connections so more than one person can play at the same time, each 
with their own experiences, but with the ability to play against each other with a couple different options.  They can choose to
play as a noob, with no risk to losing, or they can play with risk of losing a certain percent of their gold, or risk losing everything
to death and respawning at the nearest town.

Right now you can use 4 commands from the command console:
`north();`
`south();`
`east();`
`west();`


## Developing jsFantasy

1. **Install MongoDB 3.4**: go to `https://www.mongodb.com/download-center#community` and install the current stable release (3.4.7 when I did it).
1. **Install Dependencies**: `npm install`
2. **Run Unit Tests**: `npm test`
3. **Start Mongod**: In Windows, use cmd.exe shell and type `cd "C:\Program Files\MongoDB\Server\3.4\bin"` then type `mongod`
4. **Start Mongo** Open another session of cmd.exe and type `cd "C:\Program Files\MongoDB\Server\3.4\bin"` then type `mongo`
5. **Switch to jsGame database** In the mongo cmd session, type `use jsGame`
6. **Run Application Locally**: `npm run start`
