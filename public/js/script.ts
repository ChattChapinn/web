/**
 * ManiaChat Client-side Application
 * Handles Socket.IO communication, Emojis, Avatars, Mentions, Private Messaging & Photo Sharing
 */

// Type definitions for Qs library
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

// DOM Elements
const chatForm = document.getElementById("chat-form") as HTMLFormElement;
const chatMessages = document.querySelector(".chat-messages") as HTMLDivElement;
const roomName = document.getElementById("room-name") as HTMLElement;
const userList = document.getElementById("users") as HTMLUListElement;
const msgInput = document.getElementById("msg") as HTMLInputElement;

// Navigation & Sidebar Elements
const toggleSidebarBtn = document.getElementById("toggle-sidebar-btn") as HTMLButtonElement | null;
const closeSidebarBtn = document.getElementById("close-sidebar-btn") as HTMLButtonElement | null;
const chatSidebar = document.getElementById("chat-sidebar") as HTMLElement | null;
const usersCountBadge = document.getElementById("users-count-badge") as HTMLElement | null;

// Emoji & Private Message Elements
const emojiBtn = document.getElementById("emoji-btn") as HTMLButtonElement | null;
const emojiPicker = document.getElementById("emoji-picker") as HTMLDivElement | null;
const closeEmojiPicker = document.getElementById("close-emoji-picker") as HTMLButtonElement | null;
const emojiGrid = document.getElementById("emoji-grid") as HTMLDivElement | null;
const recipientSelect = document.getElementById("recipient-select") as HTMLSelectElement | null;
const privateBadge = document.getElementById("private-badge") as HTMLDivElement | null;

// Photo Upload & Preview Elements
let selectedImageData: string | null = null;
const photoBtn = document.getElementById("photo-btn") as HTMLButtonElement | null;
const photoInput = document.getElementById("photo-input") as HTMLInputElement | null;
const imagePreviewContainer = document.getElementById("image-preview-container") as HTMLDivElement | null;
const imagePreviewImg = document.getElementById("image-preview-img") as HTMLImageElement | null;
const imagePreviewName = document.getElementById("image-preview-name") as HTMLElement | null;
const removeImageBtn = document.getElementById("remove-image-btn") as HTMLButtonElement | null;

// Lightbox Modal Elements
const lightboxModal = document.getElementById("lightbox-modal") as HTMLDivElement | null;
const lightboxImg = document.getElementById("lightbox-img") as HTMLImageElement | null;
const closeLightbox = document.getElementById("close-lightbox") as HTMLButtonElement | null;
const lightboxOverlay = document.getElementById("lightbox-overlay") as HTMLDivElement | null;

// Sound Notification Elements & State
const toggleSoundBtn = document.getElementById("toggle-sound-btn") as HTMLButtonElement | null;
const soundIcon = document.getElementById("sound-icon") as HTMLElement | null;
let soundEnabled: boolean = localStorage.getItem("maniachat_sound") !== "false";
let audioCtx: AudioContext | null = null;

// Get query parameters (username, room, avatar)
const queryParams = Qs.parse(location.search, {
   ignoreQueryPrefix: true,
});
const username: string = (queryParams.username as string) || "";
const room: string = (queryParams.room as string) || "";
const avatar: string = (queryParams.avatar as string) || "👦";

// Validate parameters
if (!username || !room) {
   window.location.href = "/";
}

// Mobile sidebar toggle handlers
if (toggleSidebarBtn && chatSidebar) {
   toggleSidebarBtn.addEventListener("click", () => {
      chatSidebar.classList.toggle("show-mobile");
   });
}

if (closeSidebarBtn && chatSidebar) {
   closeSidebarBtn.addEventListener("click", () => {
      chatSidebar.classList.remove("show-mobile");
   });
}

// ============================================
// Photo Selection, Compression & Preview
// ============================================

if (photoBtn && photoInput) {
   photoBtn.addEventListener("click", () => {
      photoInput.click();
   });

   photoInput.addEventListener("change", () => {
      const file = photoInput.files?.[0];
      if (file) {
         handleImageFile(file);
      }
   });
}

if (removeImageBtn) {
   removeImageBtn.addEventListener("click", () => {
      clearSelectedImage();
   });
}

function clearSelectedImage(): void {
   selectedImageData = null;
   if (photoInput) photoInput.value = "";
   if (imagePreviewContainer) imagePreviewContainer.classList.add("hidden");
}

function handleImageFile(file: File): void {
   if (!file || !file.type.startsWith("image/")) {
      alert("Por favor selecciona una imagen válida (JPG, PNG, GIF o WebP).");
      return;
   }

   const reader = new FileReader();
   reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
         // Auto-compress large photos to max 1280px to ensure fast sending
         const maxDim = 1280;
         let width = img.width;
         let height = img.height;

         if (width > maxDim || height > maxDim) {
            if (width > height) {
               height = Math.round((height * maxDim) / width);
               width = maxDim;
            } else {
               width = Math.round((width * maxDim) / height);
               height = maxDim;
            }
         }

         const canvas = document.createElement("canvas");
         canvas.width = width;
         canvas.height = height;
         const ctx = canvas.getContext("2d");
         if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressedData = canvas.toDataURL("image/jpeg", 0.82);
            selectedImageData = compressedData;

            if (imagePreviewContainer && imagePreviewImg && imagePreviewName) {
               imagePreviewImg.src = compressedData;
               imagePreviewName.textContent = file.name;
               imagePreviewContainer.classList.remove("hidden");
            }
            msgInput.focus();
         }
      };
      img.src = e.target?.result as string;
   };
   reader.readAsDataURL(file);
}

// Support clipboard paste of images (screenshots / copied images)
window.addEventListener("paste", (e: ClipboardEvent) => {
   const items = e.clipboardData?.items;
   if (!items) return;
   for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
         const file = items[i].getAsFile();
         if (file) {
            handleImageFile(file);
            break;
         }
      }
   }
});

// Lightbox Modal Handlers
if (closeLightbox && lightboxModal) {
   closeLightbox.addEventListener("click", () => {
      lightboxModal.classList.add("hidden");
   });
}

if (lightboxOverlay && lightboxModal) {
   lightboxOverlay.addEventListener("click", () => {
      lightboxModal.classList.add("hidden");
   });
}

document.addEventListener("keydown", (e: KeyboardEvent) => {
   if (e.key === "Escape" && lightboxModal && !lightboxModal.classList.contains("hidden")) {
      lightboxModal.classList.add("hidden");
   }
});

// ============================================
// Emoji Picker Implementation
// ============================================

const EMOJI_CATEGORIES: Record<string, string[]> = {
   smileys: [
      "😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇",
      "🙂", "😉", "😍", "🥰", "😘", "😜", "😎", "🤩", "🥳", "🤔",
      "🤫", "😴", "🤠", "🥺", "😭", "🤯", "🤖", "👻", "👽", "😺"
   ],
   gestures: [
      "👍", "👎", "👏", "🙌", "🤝", "✌️", "🤞", "🤙", "👊", "✊",
      "🙏", "💪", "🫡", "👋", "🫶", "👆", "👇", "👈", "👉", "👌"
   ],
   hearts: [
      "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "💔", "❤️‍🔥",
      "💖", "💘", "🔥", "✨", "⭐", "🌟", "💯", "💥", "💫", "💢"
   ],
   fun: [
      "🎉", "🎊", "🎈", "🚀", "⚡", "🎮", "⚽", "🏆", "🍕", "🍔",
      "☕", "🍻", "🎵", "🎶", "💬", "🔔", "📌", "💡", "🎯", "👑"
   ]
};

let currentCategory = "smileys";

function renderEmojis(category: string): void {
   if (!emojiGrid) return;
   const list = EMOJI_CATEGORIES[category] || EMOJI_CATEGORIES["smileys"];
   emojiGrid.innerHTML = list
      .map((em) => `<button type="button" class="emoji-item" data-emoji="${em}">${em}</button>`)
      .join("");
}

renderEmojis(currentCategory);

if (emojiBtn && emojiPicker) {
   emojiBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      emojiPicker.classList.toggle("hidden");
   });

   if (closeEmojiPicker) {
      closeEmojiPicker.addEventListener("click", (e) => {
         e.stopPropagation();
         emojiPicker.classList.add("hidden");
      });
   }

   // Close emoji picker on click outside
   document.addEventListener("click", (e) => {
      if (!emojiPicker.contains(e.target as Node) && e.target !== emojiBtn) {
         emojiPicker.classList.add("hidden");
      }
   });

   // Handle emoji category tabs
   document.querySelectorAll(".emoji-tab-btn").forEach((tab) => {
      tab.addEventListener("click", (e) => {
         e.stopPropagation();
         document.querySelectorAll(".emoji-tab-btn").forEach((t) => t.classList.remove("active"));
         (tab as HTMLElement).classList.add("active");
         const cat = (tab as HTMLElement).dataset.cat || "smileys";
         currentCategory = cat;
         renderEmojis(cat);
      });
   });

   // Handle emoji selection
   if (emojiGrid) {
      emojiGrid.addEventListener("click", (e) => {
         e.stopPropagation();
         const target = e.target as HTMLElement;
         const emoji = target.dataset.emoji;
         if (!emoji) return;

         // Insert emoji at cursor position
         const startPos = msgInput.selectionStart || msgInput.value.length;
         const endPos = msgInput.selectionEnd || msgInput.value.length;
         const text = msgInput.value;

         msgInput.value = text.substring(0, startPos) + emoji + text.substring(endPos);
         msgInput.focus();
         msgInput.selectionStart = msgInput.selectionEnd = startPos + emoji.length;
      });
   }
}

// ============================================
// Recipient Selection & Private Chat Handler
// ============================================

if (recipientSelect) {
   recipientSelect.addEventListener("change", () => {
      updateRecipientUI();
   });
}

function updateRecipientUI(): void {
   if (!recipientSelect || !privateBadge) return;
   const selectedUser = recipientSelect.value;
   if (selectedUser && selectedUser !== "ALL") {
      privateBadge.classList.remove("hidden");
      privateBadge.innerHTML = `<i class="fas fa-lock"></i> Privado con: <strong>${selectedUser}</strong>`;
      msgInput.placeholder = `Mensaje o foto privada para ${selectedUser}...`;
   } else {
      privateBadge.classList.add("hidden");
      msgInput.placeholder = "Escribe un mensaje o envía una foto...";
   }
}

// ============================================
// Sound Notification System (Web Audio API)
// ============================================

function getAudioContext(): AudioContext | null {
   if (!audioCtx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
         audioCtx = new AudioContextClass();
      }
   }
   if (audioCtx && audioCtx.state === "suspended") {
      audioCtx.resume();
   }
   return audioCtx;
}

// Unlock audio context on user interaction
document.addEventListener("click", () => {
   if (!audioCtx) {
      getAudioContext();
   }
}, { once: true });

function updateSoundButtonUI(): void {
   if (!toggleSoundBtn || !soundIcon) return;
   if (soundEnabled) {
      toggleSoundBtn.classList.remove("muted");
      toggleSoundBtn.title = "Sonido activado (clic para silenciar)";
      soundIcon.className = "fas fa-volume-up";
   } else {
      toggleSoundBtn.classList.add("muted");
      toggleSoundBtn.title = "Sonido silenciado (clic para activar)";
      soundIcon.className = "fas fa-volume-mute";
   }
}

updateSoundButtonUI();

if (toggleSoundBtn) {
   toggleSoundBtn.addEventListener("click", () => {
      soundEnabled = !soundEnabled;
      localStorage.setItem("maniachat_sound", String(soundEnabled));
      updateSoundButtonUI();
      if (soundEnabled) {
         playNotificationSound(false);
      }
   });
}

/**
 * Play gentle notification sound (synthesized with Web Audio API)
 * @param isPrivateOrMention If true, plays an elevated double chime
 */
function playNotificationSound(isPrivateOrMention: boolean = false): void {
   if (!soundEnabled) return;
   const ctx = getAudioContext();
   if (!ctx) return;

   const now = ctx.currentTime;

   if (isPrivateOrMention) {
      // Pleasant dual-tone bell chime for Private messages and @mentions (E5 -> A5)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(659.25, now);
      gain1.gain.setValueAtTime(0, now);
      gain1.gain.linearRampToValueAtTime(0.2, now + 0.02);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.13);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(880, now + 0.1);
      gain2.gain.setValueAtTime(0, now + 0.1);
      gain2.gain.linearRampToValueAtTime(0.24, now + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.1);
      osc2.stop(now + 0.34);
   } else {
      // Gentle water-drop / bubble pop for room messages
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(460, now);
      osc.frequency.exponentialRampToValueAtTime(780, now + 0.07);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.16);
   }
}

// ============================================
// Socket.IO Communication
// ============================================

const socket = io();

// Join room with username, room and avatar
socket.emit("joinRoom", { username, room, avatar });

// Handle username error
socket.on("usernameError", (msg: string) => {
   const banner = document.createElement("div");
   banner.style.position = "fixed";
   banner.style.top = "20px";
   banner.style.left = "50%";
   banner.style.transform = "translateX(-50%)";
   banner.style.backgroundColor = "#d9534f";
   banner.style.color = "#ffffff";
   banner.style.padding = "12px 24px";
   banner.style.borderRadius = "6px";
   banner.style.boxShadow = "0 4px 12px rgba(0,0,0,0.3)";
   banner.style.zIndex = "9999";
   banner.style.fontSize = "16px";
   banner.textContent = msg;
   document.body.appendChild(banner);
   setTimeout(() => {
      window.location.href = "/";
   }, 2000);
});

// Handle room users update
socket.on("roomUsers", (data: RoomUsersData) => {
   outputRoomName(data.room);
   outputUsers(data.users);
   updateRecipientOptions(data.users);
});

// Handle incoming messages
socket.on("message", (message: Message) => {
   outputMessage(message);
   chatMessages.scrollTop = chatMessages.scrollHeight;

   // Play notification sound on incoming messages from others
   const isSelf = message.username.toLowerCase() === username.toLowerCase();
   const isBot = message.username.toLowerCase().includes("bot");

   if (!isSelf && !isBot) {
      const mentionRegex = new RegExp(`@${username}\\b`, "i");
      const isMentioned = !!(message.text && mentionRegex.test(message.text));
      const isPrivateOrMention = !!message.isPrivate || isMentioned;
      playNotificationSound(isPrivateOrMention);
   }
});

// Handle chat form submit (Sends text and/or photo)
chatForm.addEventListener("submit", (e: SubmitEvent) => {
   e.preventDefault();

   const msg = msgInput.value.trim();
   const hasImage = !!selectedImageData;

   if (!msg && !hasImage) return;

   const recipient = recipientSelect ? recipientSelect.value : "ALL";

   socket.emit("chatMessage", {
      content: msg,
      image: selectedImageData || undefined,
      recipient: recipient && recipient !== "ALL" ? recipient : undefined,
   });

   // Clear input and image preview
   msgInput.value = "";
   clearSelectedImage();
   msgInput.focus();
});

// ============================================
// DOM Output Helpers
// ============================================

/**
 * Output message to chat window
 */
function outputMessage(message: Message): void {
   const div = document.createElement("div");
   div.classList.add("message");

   const isSelf = message.username.toLowerCase() === username.toLowerCase();
   if (isSelf) {
      div.classList.add("message-self");
   }

   const userAvatar = message.avatar || (message.username.includes("Bot") ? "🤖" : "👦");

   // Check if this message mentions the current user
   const mentionRegex = new RegExp(`@${username}\\b`, "i");
   const isMentioned = !isSelf && message.text && mentionRegex.test(message.text);

   if (isMentioned) {
      div.classList.add("message-mentioned");
   }

   // Format private message banner
   let privateTag = "";
   if (message.isPrivate) {
      div.classList.add("message-private");
      if (isSelf) {
         privateTag = `<span class="private-tag"><i class="fas fa-lock"></i> Privado para @${message.recipient}</span>`;
      } else {
         privateTag = `<span class="private-tag"><i class="fas fa-lock"></i> Mensaje Privado</span>`;
      }
   }

   // Mention tag
   let mentionTag = "";
   if (isMentioned) {
      mentionTag = `<span class="mention-tag"><i class="fas fa-at"></i> Te mencionaron</span>`;
   }

   // Optional attached photo
   let imageMarkup = "";
   if (message.image) {
      imageMarkup = `
         <div class="message-photo-wrapper">
            <img src="${message.image}" class="chat-photo-thumb" alt="Foto adjunta (clic para ampliar)" />
            <span class="photo-click-hint"><i class="fas fa-search-plus"></i> Clic para ver completa</span>
         </div>
      `;
   }

   // Optional text body
   let textMarkup = "";
   if (message.text && message.text.trim()) {
      const formattedText = escapeHtml(message.text).replace(
         /@([a-zA-Z0-9_-]+)/g,
         '<span class="user-mention">@$1</span>'
      );
      textMarkup = `<p class="text">${formattedText}</p>`;
   }

   div.innerHTML = `
      <div class="message-header">
         <div class="meta">
            <span class="avatar-badge">${userAvatar}</span>
            <span class="author-name">${escapeHtml(message.username)}</span>
            <span class="time">${message.time}</span>
         </div>
         <div class="tags-container">
            ${privateTag}
            ${mentionTag}
         </div>
      </div>
      ${imageMarkup}
      ${textMarkup}
   `;

   // Add lightbox click handler to the photo
   const photoImg = div.querySelector(".chat-photo-thumb") as HTMLImageElement | null;
   if (photoImg && lightboxModal && lightboxImg) {
      photoImg.addEventListener("click", () => {
         lightboxImg.src = photoImg.src;
         lightboxModal.classList.remove("hidden");
      });
   }

   chatMessages.appendChild(div);
}

/**
 * Escape HTML to prevent XSS injection
 */
function escapeHtml(str: string): string {
   const div = document.createElement("div");
   div.textContent = str;
   return div.innerHTML;
}

/**
 * Output room name
 */
function outputRoomName(roomNameValue: string): void {
   roomName.innerHTML = roomNameValue;
}

/**
 * Output active users in sidebar
 */
function outputUsers(users: Array<RoomUser>): void {
   userList.innerHTML = users
      .map((u) => {
         const isMe = u.username.toLowerCase() === username.toLowerCase();
         const uAvatar = u.avatar || "👦";
         return `
            <li class="user-list-item ${isMe ? 'user-me' : ''}" data-username="${escapeHtml(u.username)}">
               <span class="user-avatar-icon">${uAvatar}</span>
               <span class="user-name-text">${escapeHtml(u.username)} ${isMe ? '<small>(Tú)</small>' : ''}</span>
               ${!isMe ? `<button type="button" class="quick-mention-btn" title="Hablar en privado o mencionar"><i class="fas fa-lock"></i></button>` : ''}
            </li>
         `;
      })
      .join("");

   if (usersCountBadge) {
      usersCountBadge.textContent = String(users.length);
   }

   // Add click handlers on users to switch recipient to private chat
   userList.querySelectorAll(".user-list-item").forEach((item) => {
      item.addEventListener("click", () => {
         const targetUsername = (item as HTMLElement).dataset.username;
         if (!targetUsername || targetUsername.toLowerCase() === username.toLowerCase()) return;

         if (recipientSelect) {
            recipientSelect.value = targetUsername;
            updateRecipientUI();
         }

         msgInput.focus();

         // If on mobile, close sidebar after selecting
         if (chatSidebar && chatSidebar.classList.contains("show-mobile")) {
            chatSidebar.classList.remove("show-mobile");
         }
      });
   });
}

/**
 * Update recipient selector options
 */
function updateRecipientOptions(users: Array<RoomUser>): void {
   if (!recipientSelect) return;
   const currentVal = recipientSelect.value;

   // Rebuild options
   const options = ['<option value="ALL">👥 Todos en la sala</option>'];
   users.forEach((u) => {
      if (u.username.toLowerCase() !== username.toLowerCase()) {
         options.push(
            `<option value="${escapeHtml(u.username)}">🔒 Privado con: ${u.avatar || '👦'} ${escapeHtml(u.username)}</option>`
         );
      }
   });

   recipientSelect.innerHTML = options.join("");

   // Restore previous selection if user is still present
   if (users.some((u) => u.username === currentVal)) {
      recipientSelect.value = currentVal;
   } else {
      recipientSelect.value = "ALL";
   }

   updateRecipientUI();
}
