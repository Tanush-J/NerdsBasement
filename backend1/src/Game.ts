import { CARD_STORE, Card } from "./Dataset";
import { WebSocket } from "ws";
import { CHAT_BROADCAST, GUESS_RESPONSE, INIT_GAME } from "./messages";
import { User } from "./User";

interface ChatMessage {
    id: number,
    player: User,
    message: string
}

interface Guess {
    id: number,
    guesser: User,
    guessed: User,
}

export class Game {
    public players: User[];
    public currentCard: Card;
    public chatHistory: ChatMessage[];
    public chameleon: User | null;
    public isStarted: boolean;
    private guesses: Guess[];
    private startTime: Date;

    constructor(players: User[]) {
        const chameleonIndex = Math.floor(Math.random() * players.length);
        const cardIndex = Math.floor(Math.random() * CARD_STORE.length);
        const wordIndex = Math.floor(Math.random() * CARD_STORE[cardIndex].wordList.length);

        this.players = players;
        this.chameleon = this.players[chameleonIndex];
        this.currentCard = CARD_STORE[cardIndex];
        this.chatHistory = [];
        this.guesses = [];
        this.isStarted = true;
        this.startTime = new Date();
        this.players.forEach((player, index) => {
            const Payload = {
                currentCard: this.currentCard,
                wordIndex: (index === chameleonIndex? -1 :wordIndex),
                isChameleon: index === chameleonIndex
            }
            player.socket.send(JSON.stringify({
                type: INIT_GAME,
                payload: Payload
            }))
        })
    }

    chatMessage(player: User, chat: string){
        const payload = {
            sender: player.getName(),
            message: chat
        }
        this.chatHistory.push({ id: this.chatHistory.length+1, player, message: chat });
        this.broadcastHandler(CHAT_BROADCAST, payload);
    }

    guessHandler(player: User, guessedId: number){ //need to refactor must guess should be a socket or playerId
        const guessed: User | undefined= this.players.find(player => player.getId() === guessedId);
        const remainingToGuess = this.players.length - this.guesses.length;
        const payload = { 
            playerGuessed: player.getName(),
            remainingToGuess
        }
        if(guessed){
            this.guesses.push({ id: this.guesses.length+1, guesser: player, guessed });
        } else {
            //invaild guess logic here - player not found
        }
        this.broadcastHandler(GUESS_RESPONSE, payload);
    }

    private broadcastHandler(type: string, payload: object){
        this.players.forEach(player => {
            player.socket.send(JSON.stringify({
                type,
                payload
            }))
        })
    }
}