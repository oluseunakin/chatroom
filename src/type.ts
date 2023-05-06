export type User = {
    name: string;
    id?: number;
    password?: String;
}

export type Conversation = {
    talkerName?: string;
    message: Message;
    roomName: string
}

export type Chat = {
    id?: number;
    message: Message;
    receiverId: number;
}

export type CN = {
    messages?: Message[];
    count: number;
    receiver?: User;
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