
export enum MessageSender {
  USER = 'user',
  BOT = 'bot',
}

export interface ChatMessage {
  id: string;
  sender: MessageSender;
  text: string;
  bookingProposal?: BookingProposal;
}

export interface Event {
  id: number;
  name: string;
  date: string;
  tickets_available: number;
}

export interface BookingProposal {
  eventName: string;
  ticketCount: number;
}

interface TextResponse {
  type: 'text';
  text: string;
}

interface ProposalResponse {
  type: 'proposal';
  text: string;
  proposal: BookingProposal;
}

export type BotResponse = TextResponse | ProposalResponse;
