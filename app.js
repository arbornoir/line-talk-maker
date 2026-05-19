const today = new Date();
const pad = (value) => String(value).padStart(2, "0");
const defaultDate = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
const demoImageSrc =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 640 460'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' x2='1' y1='0' y2='1'%3E%3Cstop stop-color='%23ffe08a'/%3E%3Cstop offset='.52' stop-color='%23ff7a59'/%3E%3Cstop offset='1' stop-color='%2306c755'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='640' height='460' rx='34' fill='url(%23g)'/%3E%3Ccircle cx='500' cy='100' r='70' fill='rgba(255,255,255,.42)'/%3E%3Cpath d='M70 345 235 190l105 98 75-70 155 127z' fill='rgba(255,255,255,.78)'/%3E%3Ctext x='54' y='72' fill='white' font-family='Arial,sans-serif' font-size='42' font-weight='700'%3EImage message%3C/text%3E%3C/svg%3E";
const uploadIconSrc = "./upload-icon.png";

const state = {
  partnerName: "佐藤さん",
  date: defaultDate,
  defaultTime: "14:20",
  showAvatar: true,
  avatarSrc: "",
  editId: null,
  draftImageSrc: "",
  messages: [
    {
      id: crypto.randomUUID(),
      sender: "them",
      type: "text",
      text: "到着しました。いま入口の近くにいます。",
      time: "14:18",
      read: false,
      imageSrc: ""
    },
    {
      id: crypto.randomUUID(),
      sender: "me",
      type: "text",
      text: "ありがとう。すぐ向かいます！",
      time: "14:20",
      read: true,
      imageSrc: ""
    },
    {
      id: crypto.randomUUID(),
      sender: "me",
      type: "image",
      text: "",
      time: "14:21",
      read: true,
      imageSrc: demoImageSrc
    }
  ]
};

const elements = {
  dateInput: document.querySelector("#dateInput"),
  defaultTimeInput: document.querySelector("#defaultTimeInput"),
  partnerNameInput: document.querySelector("#partnerNameInput"),
  showAvatarInput: document.querySelector("#showAvatarInput"),
  avatarInput: document.querySelector("#avatarInput"),
  headerAvatar: document.querySelector("#headerAvatar"),
  headerName: document.querySelector("#headerName"),
  statusTime: document.querySelector("#statusTime"),
  chatStream: document.querySelector("#chatStream"),
  messageList: document.querySelector("#messageList"),
  messageForm: document.querySelector("#messageForm"),
  messageTextInput: document.querySelector("#messageTextInput"),
  messageTimeInput: document.querySelector("#messageTimeInput"),
  messageImageInput: document.querySelector("#messageImageInput"),
  imagePreviewWrap: document.querySelector("#imagePreviewWrap"),
  imagePreview: document.querySelector("#imagePreview"),
  textField: document.querySelector("#textField"),
  imageField: document.querySelector("#imageField"),
  readInput: document.querySelector("#readInput"),
  submitMessageButton: document.querySelector("#submitMessageButton"),
  cancelEditButton: document.querySelector("#cancelEditButton"),
  editHint: document.querySelector("#editHint"),
  resetButton: document.querySelector("#resetButton"),
  clearButton: document.querySelector("#clearButton"),
  downloadButton: document.querySelector("#downloadButton")
};

function init() {
  elements.dateInput.value = state.date;
  elements.defaultTimeInput.value = state.defaultTime;
  elements.partnerNameInput.value = state.partnerName;
  elements.showAvatarInput.checked = state.showAvatar;
  elements.messageTimeInput.value = state.defaultTime;
  bindEvents();
  render();
}

function bindEvents() {
  elements.dateInput.addEventListener("input", (event) => {
    state.date = event.target.value;
    render();
  });

  elements.defaultTimeInput.addEventListener("input", (event) => {
    state.defaultTime = event.target.value || state.defaultTime;
    elements.messageTimeInput.value = state.defaultTime;
    render();
  });

  elements.partnerNameInput.addEventListener("input", (event) => {
    state.partnerName = event.target.value.trim() || "相手";
    render();
  });

  elements.showAvatarInput.addEventListener("change", (event) => {
    state.showAvatar = event.target.checked;
    render();
  });

  elements.avatarInput.addEventListener("change", async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    state.avatarSrc = await readFileAsDataUrl(file);
    render();
  });

  document.querySelectorAll("input[name='messageType']").forEach((input) => {
    input.addEventListener("change", renderMessageTypeFields);
  });

  document.querySelectorAll("input[name='sender']").forEach((input) => {
    input.addEventListener("change", handleSenderChange);
  });

  elements.messageImageInput.addEventListener("change", async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    state.draftImageSrc = await readFileAsDataUrl(file);
    elements.imagePreview.src = state.draftImageSrc;
    elements.imagePreviewWrap.classList.remove("hidden");
  });

  elements.messageForm.addEventListener("submit", handleMessageSubmit);
  elements.cancelEditButton.addEventListener("click", clearEditor);
  elements.resetButton.addEventListener("click", resetAll);
  elements.clearButton.addEventListener("click", () => {
    state.messages = [];
    clearEditor();
    render();
  });
  elements.downloadButton.addEventListener("click", downloadTalkPng);
}

function render() {
  elements.headerName.textContent = state.partnerName;
  elements.statusTime.textContent = formatTime(state.defaultTime);
  elements.headerAvatar.style.backgroundImage = state.avatarSrc ? `url("${state.avatarSrc}")` : "";
  elements.headerAvatar.classList.toggle("hidden", !state.showAvatar);
  renderChat();
  renderMessageList();
}

function renderChat() {
  elements.chatStream.innerHTML = "";
  const dateChip = document.createElement("div");
  dateChip.className = "date-chip";
  dateChip.textContent = formatDate(state.date);
  elements.chatStream.append(dateChip);

  if (state.messages.length === 0) {
    const empty = document.createElement("div");
    empty.className = "date-chip";
    empty.textContent = "メッセージを追加してください";
    elements.chatStream.append(empty);
    return;
  }

  state.messages.forEach((message) => {
    const row = document.createElement("article");
    row.className = `message-row ${message.sender} ${message.type}`;
    row.classList.toggle("avatar-hidden", message.sender === "them" && !state.showAvatar);

    if (message.sender === "them" && state.showAvatar) {
      const avatar = document.createElement("div");
      avatar.className = "avatar";
      avatar.style.backgroundImage = state.avatarSrc ? `url("${state.avatarSrc}")` : "";
      row.append(avatar);
    }

    const wrap = document.createElement("div");
    wrap.className = "bubble-wrap";

    const bubble = document.createElement("div");
    bubble.className = message.type === "image" ? "bubble image-bubble" : "bubble";

    if (message.type === "image") {
      const uploadIcon = document.createElement("div");
      uploadIcon.className = "upload-indicator";
      uploadIcon.setAttribute("aria-hidden", "true");
      wrap.append(uploadIcon);

      const img = document.createElement("img");
      img.src = message.imageSrc;
      img.alt = "送信画像";
      bubble.append(img);
    } else {
      bubble.textContent = message.text;
    }

    const meta = document.createElement("div");
    meta.className = "meta";
    if (message.sender === "me" && message.read) {
      const read = document.createElement("span");
      read.textContent = "既読";
      meta.append(read);
    }
    const time = document.createElement("span");
    time.textContent = formatTime(message.time);
    meta.append(time);

    wrap.append(bubble, meta);
    row.append(wrap);
    elements.chatStream.append(row);
  });
}

function renderMessageList() {
  elements.messageList.innerHTML = "";
  if (state.messages.length === 0) {
    const empty = document.createElement("p");
    empty.className = "list-empty";
    empty.textContent = "まだメッセージはありません。";
    elements.messageList.append(empty);
    return;
  }

  state.messages.forEach((message, index) => {
    const item = document.createElement("div");
    item.className = "list-item";

    const detail = document.createElement("div");
    const title = document.createElement("strong");
    title.textContent = `${index + 1}. ${message.sender === "me" ? "自分" : "相手"} / ${formatTime(message.time)}`;
    const summary = document.createElement("span");
    summary.textContent = message.type === "image" ? "画像メッセージ" : message.text;
    detail.append(title, summary);

    const actions = document.createElement("div");
    actions.className = "list-actions";
    actions.append(
      makeMiniButton("↑", "上へ", () => moveMessage(index, -1)),
      makeMiniButton("↓", "下へ", () => moveMessage(index, 1)),
      makeMiniButton("編", "編集", () => editMessage(message.id)),
      makeMiniButton("×", "削除", () => deleteMessage(message.id))
    );

    item.append(detail, actions);
    elements.messageList.append(item);
  });
}

function makeMiniButton(label, title, onClick) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "mini-button";
  button.textContent = label;
  button.title = title;
  button.setAttribute("aria-label", title);
  button.addEventListener("click", onClick);
  return button;
}

function handleMessageSubmit(event) {
  event.preventDefault();
  const sender = document.querySelector("input[name='sender']:checked").value;
  const type = document.querySelector("input[name='messageType']:checked").value;
  const time = elements.messageTimeInput.value || state.defaultTime;
  const text = elements.messageTextInput.value.trim();

  if (type === "text" && !text) {
    elements.messageTextInput.focus();
    return;
  }

  if (type === "image" && !state.draftImageSrc) {
    elements.messageImageInput.focus();
    return;
  }

  const payload = {
    id: state.editId || crypto.randomUUID(),
    sender,
    type,
    text,
    time,
    read: sender === "me" ? elements.readInput.checked : false,
    imageSrc: type === "image" ? state.draftImageSrc : ""
  };

  if (state.editId) {
    state.messages = state.messages.map((message) => (message.id === state.editId ? payload : message));
  } else {
    state.messages.push(payload);
  }

  clearEditor();
  render();
  requestAnimationFrame(() => {
    elements.chatStream.scrollTop = elements.chatStream.scrollHeight;
  });
}

function editMessage(id) {
  const message = state.messages.find((item) => item.id === id);
  if (!message) return;
  state.editId = id;

  document.querySelector(`input[name='sender'][value='${message.sender}']`).checked = true;
  document.querySelector(`input[name='messageType'][value='${message.type}']`).checked = true;
  elements.messageTextInput.value = message.text || "";
  elements.messageTimeInput.value = message.time || state.defaultTime;
  elements.readInput.checked = Boolean(message.read);
  state.draftImageSrc = message.imageSrc || "";

  if (state.draftImageSrc) {
    elements.imagePreview.src = state.draftImageSrc;
    elements.imagePreviewWrap.classList.remove("hidden");
  } else {
    elements.imagePreviewWrap.classList.add("hidden");
  }

  elements.submitMessageButton.textContent = "更新";
  elements.cancelEditButton.classList.remove("hidden");
  elements.editHint.textContent = "編集中";
  renderMessageTypeFields();
  syncReadAvailability();
}

function deleteMessage(id) {
  state.messages = state.messages.filter((message) => message.id !== id);
  if (state.editId === id) clearEditor();
  render();
}

function moveMessage(index, direction) {
  const nextIndex = index + direction;
  if (nextIndex < 0 || nextIndex >= state.messages.length) return;
  const copy = [...state.messages];
  [copy[index], copy[nextIndex]] = [copy[nextIndex], copy[index]];
  state.messages = copy;
  render();
}

function clearEditor() {
  state.editId = null;
  state.draftImageSrc = "";
  elements.messageTextInput.value = "";
  elements.messageImageInput.value = "";
  elements.messageTimeInput.value = state.defaultTime;
  elements.readInput.checked = true;
  document.querySelector("input[name='sender'][value='me']").checked = true;
  document.querySelector("input[name='messageType'][value='text']").checked = true;
  elements.imagePreviewWrap.classList.add("hidden");
  elements.submitMessageButton.textContent = "追加";
  elements.cancelEditButton.classList.add("hidden");
  elements.editHint.textContent = "新規追加";
  renderMessageTypeFields();
  syncReadAvailability();
}

function resetAll() {
  state.partnerName = "佐藤さん";
  state.date = defaultDate;
  state.defaultTime = "14:20";
  state.showAvatar = true;
  state.avatarSrc = "";
  state.messages = [];
  elements.avatarInput.value = "";
  elements.partnerNameInput.value = state.partnerName;
  elements.dateInput.value = state.date;
  elements.defaultTimeInput.value = state.defaultTime;
  elements.showAvatarInput.checked = state.showAvatar;
  clearEditor();
  render();
}

function renderMessageTypeFields() {
  const type = document.querySelector("input[name='messageType']:checked").value;
  elements.textField.classList.toggle("hidden", type !== "text");
  elements.imageField.classList.toggle("hidden", type !== "image");
  elements.imagePreviewWrap.classList.toggle("hidden", type !== "image" || !state.draftImageSrc);
}

function handleSenderChange() {
  syncReadAvailability();
  if (state.editId) {
    const sender = document.querySelector("input[name='sender']:checked").value;
    elements.editHint.textContent = sender === "me" ? "編集中：自分" : "編集中：相手";
  }
}

function syncReadAvailability() {
  const sender = document.querySelector("input[name='sender']:checked").value;
  const isMe = sender === "me";
  elements.readInput.disabled = !isMe;
  elements.readInput.parentElement.style.opacity = isMe ? "1" : "0.48";
  if (!isMe) elements.readInput.checked = false;
}

async function downloadTalkPng() {
  const canvas = await renderTalkToCanvas();
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `line-talk-${state.date || defaultDate}.png`;
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }, "image/png");
}

async function renderTalkToCanvas() {
  const width = 390;
  const height = 760;
  const scale = 2;
  const canvas = document.createElement("canvas");
  canvas.width = width * scale;
  canvas.height = height * scale;
  const ctx = canvas.getContext("2d");
  ctx.scale(scale, scale);
  ctx.textBaseline = "top";

  const avatarImage = state.avatarSrc ? await loadImage(state.avatarSrc).catch(() => null) : null;
  const uploadIconImage = await loadImage(uploadIconSrc).catch(() => null);
  const imageCache = new Map();
  for (const message of state.messages) {
    if (message.type === "image" && message.imageSrc && !imageCache.has(message.imageSrc)) {
      imageCache.set(message.imageSrc, await loadImage(message.imageSrc).catch(() => null));
    }
  }

  drawRoundedRect(ctx, 0, 0, width, height, 24, "#8fa8c6");
  drawStatusAndHeader(ctx, width, avatarImage);
  drawComposer(ctx, width, height);

  const chatTop = 90;
  const chatBottom = height - 50;
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, chatTop, width, chatBottom - chatTop);
  ctx.clip();
  drawMessages(ctx, width, chatTop, chatBottom, avatarImage, uploadIconImage, imageCache);
  ctx.restore();

  return canvas;
}

function drawStatusAndHeader(ctx, width, avatarImage) {
  ctx.fillStyle = "rgba(242, 246, 247, 0.98)";
  ctx.fillRect(0, 0, width, 36);
  ctx.fillStyle = "#202526";
  ctx.font = "700 12px 'Yu Gothic', Meiryo, sans-serif";
  ctx.fillText(formatTime(state.defaultTime), 18, 11);
  ctx.textAlign = "right";
  ctx.fillText("5G 100%", width - 18, 11);
  ctx.textAlign = "left";

  ctx.fillStyle = "rgba(248, 250, 250, 0.97)";
  ctx.fillRect(0, 36, width, 54);
  ctx.fillStyle = "rgba(0, 0, 0, 0.08)";
  ctx.fillRect(0, 89, width, 1);
  ctx.fillStyle = "#26302f";
  ctx.font = "500 24px 'Yu Gothic', Meiryo, sans-serif";
  ctx.fillText("‹", 24, 52);
  ctx.font = "700 16px 'Yu Gothic', Meiryo, sans-serif";

  const nameX = state.showAvatar ? 96 : 58;
  if (state.showAvatar) {
    drawAvatar(ctx, avatarImage, 72, 63, 17);
  }
  ctx.fillText(state.partnerName, nameX, 55);
  ctx.textAlign = "right";
  ctx.font = "700 18px 'Yu Gothic', Meiryo, sans-serif";
  ctx.fillText("≡", width - 26, 54);
  ctx.textAlign = "left";
}

function drawMessages(ctx, width, chatTop, chatBottom, avatarImage, uploadIconImage, imageCache) {
  const scrollOffset = elements.chatStream.scrollTop || 0;
  let y = chatTop + 14 - scrollOffset;
  y = drawDateChip(ctx, formatDate(state.date), width / 2, y) + 11;

  if (state.messages.length === 0) {
    drawDateChip(ctx, "メッセージを追加してください", width / 2, y);
    return;
  }

  for (const message of state.messages) {
    const block = measureMessageBlock(ctx, message, width, imageCache);
    if (y + block.height >= chatTop && y <= chatBottom) {
      drawMessageBlock(ctx, message, block, width, y, avatarImage, uploadIconImage, imageCache);
    }
    y += block.height + 10;
  }
}

function measureMessageBlock(ctx, message, width, imageCache) {
  if (message.type === "image") {
    const avatarSpace = message.sender === "them" && state.showAvatar ? 54 : 0;
    const maxImageWidth = width - 24 - avatarSpace;
    const imageWidth = Math.min(message.sender === "them" ? 250 : 270, maxImageWidth);
    const img = imageCache.get(message.imageSrc);
    const ratio = img?.naturalWidth && img?.naturalHeight ? img.naturalHeight / img.naturalWidth : 0.72;
    const imageHeight = Math.max(80, Math.round(imageWidth * ratio));
    return { bubbleWidth: imageWidth, bubbleHeight: imageHeight, height: imageHeight, lines: [] };
  }

  ctx.font = "400 14px 'Yu Gothic', Meiryo, sans-serif";
  const maxTextWidth = message.sender === "them" ? 230 : 225;
  const lines = wrapText(ctx, message.text || "", maxTextWidth);
  const textWidth = Math.max(42, ...lines.map((line) => ctx.measureText(line).width));
  const bubbleWidth = Math.min(maxTextWidth + 22, Math.ceil(textWidth + 22));
  const bubbleHeight = lines.length * 20 + 18;
  return { bubbleWidth, bubbleHeight, height: Math.max(36, bubbleHeight), lines };
}

function drawMessageBlock(ctx, message, block, width, y, avatarImage, uploadIconImage, imageCache) {
  const metaWidth = 35;
  const gap = 6;
  let bubbleX;
  let metaX;

  if (message.sender === "me") {
    bubbleX = width - 12 - block.bubbleWidth;
    metaX = bubbleX - gap - metaWidth;
  } else {
    const avatarSpace = state.showAvatar ? 54 : 0;
    bubbleX = 12 + avatarSpace;
    metaX = bubbleX + block.bubbleWidth + gap;
    if (state.showAvatar) {
      drawAvatar(ctx, avatarImage, 30, y + 18, 18);
    }
  }

  if (message.type === "image") {
    const img = imageCache.get(message.imageSrc);
    drawUploadIcon(ctx, uploadIconImage, bubbleX - 22, y + block.bubbleHeight - 56);
    if (img) {
      drawImageContain(ctx, img, bubbleX, y, block.bubbleWidth, block.bubbleHeight, 12);
    } else {
      drawRoundedRect(ctx, bubbleX, y, block.bubbleWidth, block.bubbleHeight, 12, "#dce6e1");
    }
    drawImageMeta(ctx, message, bubbleX, y, block.bubbleWidth, block.bubbleHeight);
    return;
  } else {
    const radius = { tl: 16, tr: 16, br: message.sender === "me" ? 4 : 16, bl: message.sender === "them" ? 4 : 16 };
    if (message.sender === "them") {
      drawTheirTail(ctx, bubbleX, y);
      radius.tl = 4;
      radius.bl = 16;
    }
    drawVariableRoundedRect(
      ctx,
      bubbleX,
      y,
      block.bubbleWidth,
      block.bubbleHeight,
      radius,
      message.sender === "me" ? "#8ee86c" : "#ffffff"
    );
    ctx.fillStyle = "#171c1c";
    ctx.font = "400 14px 'Yu Gothic', Meiryo, sans-serif";
    block.lines.forEach((line, index) => {
      ctx.fillText(line, bubbleX + 11, y + 9 + index * 20);
    });
  }

  drawMeta(ctx, message, metaX, y + block.bubbleHeight - (message.read && message.sender === "me" ? 25 : 13));
}

function drawUploadIcon(ctx, image, centerX, centerY) {
  ctx.save();
  if (image) {
    ctx.drawImage(image, centerX - 12, centerY - 12, 24, 24);
    ctx.restore();
    return;
  }

  ctx.fillStyle = "rgba(255, 255, 255, 0.34)";
  ctx.shadowColor = "rgba(32, 37, 38, 0.12)";
  ctx.shadowBlur = 4;
  ctx.beginPath();
  ctx.arc(centerX, centerY, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.strokeStyle = "rgba(255, 255, 255, 0.95)";
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(centerX, centerY + 5);
  ctx.lineTo(centerX, centerY - 4);
  ctx.moveTo(centerX - 4, centerY);
  ctx.lineTo(centerX, centerY - 4);
  ctx.lineTo(centerX + 4, centerY);
  ctx.stroke();
  ctx.restore();
}

function drawTheirTail(ctx, x, y) {
  ctx.save();
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.moveTo(x + 1, y + 2);
  ctx.lineTo(x - 7, y + 2);
  ctx.lineTo(x + 1, y + 12);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawImageMeta(ctx, message, x, y, width, height) {
  const lines = [];
  if (message.sender === "me" && message.read) {
    lines.push("既読");
  }
  lines.push(formatTime(message.time));

  ctx.font = "700 10px 'Yu Gothic', Meiryo, sans-serif";
  ctx.fillStyle = "#f5f7f6";
  ctx.shadowColor = "rgba(0, 0, 0, 0.22)";
  ctx.shadowBlur = 4;
  const textX = message.sender === "me" ? x - 6 : x + width + 6;
  const textY = y + height - lines.length * 12 - 3;
  ctx.textAlign = message.sender === "me" ? "right" : "left";
  lines.forEach((line, index) => {
    ctx.fillText(line, textX, textY + index * 12);
  });
  ctx.shadowBlur = 0;
  ctx.textAlign = "left";
}

function drawMeta(ctx, message, x, y) {
  ctx.fillStyle = "#f5f7f6";
  ctx.shadowColor = "rgba(0, 0, 0, 0.22)";
  ctx.shadowBlur = 4;
  ctx.font = "700 10px 'Yu Gothic', Meiryo, sans-serif";
  if (message.sender === "me") {
    ctx.textAlign = "right";
    if (message.read) {
      ctx.fillText("既読", x + 35, y);
      ctx.fillText(formatTime(message.time), x + 35, y + 12);
    } else {
      ctx.fillText(formatTime(message.time), x + 35, y + 12);
    }
  } else {
    ctx.textAlign = "left";
    ctx.fillText(formatTime(message.time), x, y + 12);
  }
  ctx.shadowBlur = 0;
  ctx.textAlign = "left";
}

function drawDateChip(ctx, text, centerX, y) {
  ctx.font = "700 12px 'Yu Gothic', Meiryo, sans-serif";
  const width = Math.ceil(ctx.measureText(text).width + 24);
  drawRoundedRect(ctx, centerX - width / 2, y, width, 29, 15, "rgba(82, 99, 112, 0.42)");
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.fillText(text, centerX, y + 7);
  ctx.textAlign = "left";
  return y + 29;
}

function drawComposer(ctx, width, height) {
  ctx.fillStyle = "rgba(249, 251, 251, 0.98)";
  ctx.fillRect(0, height - 50, width, 50);
  ctx.fillStyle = "#26302f";
  ctx.font = "400 22px 'Yu Gothic', Meiryo, sans-serif";
  ctx.fillText("+", 20, height - 36);
  drawRoundedRect(ctx, 52, height - 42, width - 104, 35, 18, "#eef3f1");
  ctx.fillStyle = "#8a9490";
  ctx.font = "400 12px 'Yu Gothic', Meiryo, sans-serif";
  ctx.fillText("メッセージを入力", 64, height - 31);
  ctx.fillStyle = "#26302f";
  ctx.font = "700 22px 'Yu Gothic', Meiryo, sans-serif";
  ctx.fillText("▶", width - 36, height - 36);
}

function drawAvatar(ctx, image, centerX, centerY, radius) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.clip();
  if (image) {
    drawImageCover(ctx, image, centerX - radius, centerY - radius, radius * 2, radius * 2, 0);
  } else {
    const gradient = ctx.createLinearGradient(centerX - radius, centerY - radius, centerX + radius, centerY + radius);
    gradient.addColorStop(0, "#f7c66f");
    gradient.addColorStop(0.55, "#ff8066");
    gradient.addColorStop(1, "#6ad8b5");
    ctx.fillStyle = gradient;
    ctx.fillRect(centerX - radius, centerY - radius, radius * 2, radius * 2);
  }
  ctx.restore();
}

function drawImageCover(ctx, image, x, y, width, height, radius) {
  const imageRatio = image.naturalWidth / image.naturalHeight;
  const boxRatio = width / height;
  let sourceWidth = image.naturalWidth;
  let sourceHeight = image.naturalHeight;
  let sourceX = 0;
  let sourceY = 0;

  if (imageRatio > boxRatio) {
    sourceWidth = image.naturalHeight * boxRatio;
    sourceX = (image.naturalWidth - sourceWidth) / 2;
  } else {
    sourceHeight = image.naturalWidth / boxRatio;
    sourceY = (image.naturalHeight - sourceHeight) / 2;
  }

  ctx.save();
  drawRoundedPath(ctx, x, y, width, height, radius);
  ctx.clip();
  ctx.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, x, y, width, height);
  ctx.restore();
}

function drawImageContain(ctx, image, x, y, width, height, radius) {
  const scale = Math.min(width / image.naturalWidth, height / image.naturalHeight);
  const drawWidth = image.naturalWidth * scale;
  const drawHeight = image.naturalHeight * scale;
  const drawX = x + (width - drawWidth) / 2;
  const drawY = y + (height - drawHeight) / 2;

  ctx.save();
  drawRoundedPath(ctx, x, y, width, height, radius);
  ctx.clip();
  ctx.fillStyle = "#dce6e1";
  ctx.fillRect(x, y, width, height);
  ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight);
  ctx.restore();
}

function drawRoundedRect(ctx, x, y, width, height, radius, fill) {
  drawRoundedPath(ctx, x, y, width, height, radius);
  ctx.fillStyle = fill;
  ctx.fill();
}

function drawRoundedPath(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawVariableRoundedRect(ctx, x, y, width, height, radius, fill) {
  ctx.beginPath();
  ctx.moveTo(x + radius.tl, y);
  ctx.lineTo(x + width - radius.tr, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
  ctx.lineTo(x + width, y + height - radius.br);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
  ctx.lineTo(x + radius.bl, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
  ctx.lineTo(x, y + radius.tl);
  ctx.quadraticCurveTo(x, y, x + radius.tl, y);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}

function wrapText(ctx, text, maxWidth) {
  const lines = [];
  for (const paragraph of String(text).split("\n")) {
    let line = "";
    for (const char of [...paragraph]) {
      const next = line + char;
      if (line && ctx.measureText(next).width > maxWidth) {
        lines.push(line);
        line = char;
      } else {
        line = next;
      }
    }
    lines.push(line);
  }
  return lines.length ? lines : [""];
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", reject);
    image.src = src;
  });
}

function formatDate(value) {
  if (!value) return "";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  const formatter = new Intl.DateTimeFormat("ja-JP", {
    month: "long",
    day: "numeric",
    weekday: "short"
  });
  return formatter.format(date);
}

function formatTime(value) {
  if (!value) return "";
  return value.split(":").slice(0, 2).join(":");
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(reader.result));
    reader.addEventListener("error", reject);
    reader.readAsDataURL(file);
  });
}

init();
