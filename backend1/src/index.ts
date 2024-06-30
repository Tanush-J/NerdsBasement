import { WebSocketServer } from 'ws';
import { GameManager } from './GameManager';

const wss = new WebSocketServer({ port: 8080 });

const gameManager = new GameManager();

wss.on('connection', function connection(ws, req) {
  let url: string | undefined = req.url;
  let username: string = `player${Math.round(Math.random()*1000)}`;

  if(url && url.includes("name=")){
    url = decodeURIComponent(url);
    username = url.slice(url.indexOf("name=")+6, url.length-1);
  }

  gameManager.addUser(ws, username);
  ws.on('disconnect', () => gameManager.removeUser(ws));
});