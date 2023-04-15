export type User = {
    name: string;
}

export type Conversation = {
    id?: number;
    talkerName: string;
    message: Message;
    roomName: string
}

export type Chat = {
    id?: number;
    senderName: string;
    messages: Message[];
    receiverName: string;
   
}

export type Message = {
    id?: number;
    text: string;
    media?: string[];
    createdAt: string; 
    sender: string;
}

export enum Progress {
    Idle = "idle",
    Loading = "loading", 
    Success = "success", 
    Failed = "failed"
}

export type Room = { 
    name: string;
    users?: User [];
    conversations?: Conversation[];
}