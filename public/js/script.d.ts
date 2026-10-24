/**
 * ManiaChat Client-side Application
 * Handles Socket.IO communication, Emojis, Avatars, Mentions, Private Messaging & Photo Sharing
 */
interface QsParseOptions {
    ignoreQueryPrefix?: boolean;
}
declare const Qs: {
    parse: (str: string, options?: QsParseOptions) => Record<string, string>;
};
interface Message {
    username: string;
    text: string;
    time: string;
    avatar?: string;
    isPrivate?: boolean;
    recipient?: string;
    image?: string;
}
interface RoomUser {
    username: string;
    avatar?: string;
}
interface RoomUsersData {
    room: string;
    users: Array<RoomUser>;
}
declare const chatForm: HTMLFormElement;
declare const chatMessages: HTMLDivElement;
declare const roomName: HTMLElement;
declare const userList: HTMLUListElement;
declare const msgInput: HTMLInputElement;
declare const toggleSidebarBtn: HTMLButtonElement | null;
declare const closeSidebarBtn: HTMLButtonElement | null;
declare const chatSidebar: HTMLElement | null;
declare const usersCountBadge: HTMLElement | null;
declare const emojiBtn: HTMLButtonElement | null;
declare const emojiPicker: HTMLDivElement | null;
declare const closeEmojiPicker: HTMLButtonElement | null;
declare const emojiGrid: HTMLDivElement | null;
declare const recipientSelect: HTMLSelectElement | null;
declare const privateBadge: HTMLDivElement | null;
declare let selectedImageData: string | null;
declare const photoBtn: HTMLButtonElement | null;
declare const photoInput: HTMLInputElement | null;
declare const imagePreviewContainer: HTMLDivElement | null;
declare const imagePreviewImg: HTMLImageElement | null;
declare const imagePreviewName: HTMLElement | null;
declare const removeImageBtn: HTMLButtonElement | null;
declare const lightboxModal: HTMLDivElement | null;
declare const lightboxImg: HTMLImageElement | null;
declare const closeLightbox: HTMLButtonElement | null;
declare const lightboxOverlay: HTMLDivElement | null;
declare const toggleSoundBtn: HTMLButtonElement | null;
declare const soundIcon: HTMLElement | null;
declare let soundEnabled: boolean;
declare let audioCtx: AudioContext | null;
declare const queryParams: Record<string, string>;
declare const username: string;
declare const room: string;
declare const avatar: string;
declare function clearSelectedImage(): void;
declare function handleImageFile(file: File): void;
declare const EMOJI_CATEGORIES: Record<string, string[]>;
declare let currentCategory: string;
declare function renderEmojis(category: string): void;
declare function updateRecipientUI(): void;
declare function getAudioContext(): AudioContext | null;
declare function updateSoundButtonUI(): void;
/**
 * Play gentle notification sound (synthesized with Web Audio API)
 * @param isPrivateOrMention If true, plays an elevated double chime
 */
declare function playNotificationSound(isPrivateOrMention?: boolean): void;
declare const socket: SocketIOClient.Socket;
/**
 * Output message to chat window
 */
declare function outputMessage(message: Message): void;
/**
 * Escape HTML to prevent XSS injection
 */
declare function escapeHtml(str: string): string;
/**
 * Output room name
 */
declare function outputRoomName(roomNameValue: string): void;
/**
 * Output active users in sidebar
 */
declare function outputUsers(users: Array<RoomUser>): void;
/**
 * Update recipient selector options
 */
declare function updateRecipientOptions(users: Array<RoomUser>): void;
