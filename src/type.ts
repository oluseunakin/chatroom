export type User = {
    name: string;
    id?: number;
    password?: String;
    status: boolean;
}

export type Conversation = {
    id?: number;
    talker?: User;
    message: Message;
    room: Room;
    agree?: number[];
    disagree?: number[];
    commentsCount?: number;
}

export type Chat = {
    id?: number;
    message: Message;
    receiverId: number;
}

export type CN = {
    messages?: Message[];
    count: number;
}

export type Message = {
    id?: number;
    text: string;
    media?: string[];
    createdAt: string; 
    senderId: number;
    senderName: string;
}

export enum Progress {
    Idle = "idle",
    Loading = "loading", 
    Success = "success", 
    Failed = "failed"
}

export type Room = { 
    id: number;
    name: string;
    users?: User [];
    conversations?: Conversation[];
}