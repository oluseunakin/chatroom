export type User = {
  name: string;
  id?: number;
  password?: String;
};

export type Conversation = {
  id?: number;
  talker?: User;
  room: Room;
  agree?: User[];
  disagree?: User[];
  comments?: Conversation[];
  convo: string;
  media?: string[]
  createdAt: Date;
  _count: {
    comments: number
  }
};

export type Chat = {
  id?: number;
  message: Message[];
  receiverId: number;
};

export type Message = {
  id?: number;
  text: string;
  media?: string[];
  createdAt?: string;
  type: MessageType;
};

export enum Progress {
  Idle = "idle",
  Loading = "loading",
  Success = "success",
  Failed = "failed",
}

export type Room = {
  id?: number;
  name: string;
  topic?: {
    id?: number;
    name: string;
  };
  creatorId?: number;
  members?: User[];
  conversations?: Conversation[];
  type?: RoomType;
};

export enum RoomType {
  OPEN = "OPEN",
  CLOSED = "CLOSED",
}

export enum MessageType {
  RECEIVED = "RECEIVED",
  SENT = "SENT",
}