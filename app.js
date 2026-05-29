const today = new Date();
const pad = (value) => String(value).padStart(2, "0");
const defaultDate = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
const demoImageSrc =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 640 460'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' x2='1' y1='0' y2='1'%3E%3Cstop stop-color='%23ffe08a'/%3E%3Cstop offset='.52' stop-color='%23ff7a59'/%3E%3Cstop offset='1' stop-color='%2306c755'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='640' height='460' rx='34' fill='url(%23g)'/%3E%3Ccircle cx='500' cy='100' r='70' fill='rgba(255,255,255,.42)'/%3E%3Cpath d='M70 345 235 190l105 98 75-70 155 127z' fill='rgba(255,255,255,.78)'/%3E%3Ctext x='54' y='72' fill='white' font-family='Arial,sans-serif' font-size='42' font-weight='700'%3EImage message%3C/text%3E%3C/svg%3E";
const uploadIconSrc = "./upload-icon.png";
const backgroundColors = {
  blue: "#8fa8c6",
  pink: "#efb4c7",
  image: "#dbe8f1"
};
const chatTopPadding = 16;
const talkMetrics = {
  sidePad: 8,
  rightPad: 10,
  avatarSize: 30,
  avatarGap: 8,
  metaGap: 10,
  metaWidth: 44,
  textPadX: 17,
  textPadY: 12,
  textFontSize: 18,
  textLineHeight: 26,
  bubbleRadius: 23,
  myCornerRadius: 23,
  tailWidth: 30,
  tailHeight: 24,
  metaFontSize: 12.5,
  metaLineHeight: 14,
  maxTheirBubbleWidth: 278,
  maxMyBubbleWidth: 270
};

const state = {
  partnerName: "佐藤さん",
  date: defaultDate,
  defaultTime: "14:20",
  showAvatar: false,
  showInitialDate: true,
  showOuterFrame: false,
  backgroundColor: "blue",
  decorationTheme: "none",
  backgroundImageSrc: "",
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
  showInitialDateInput: document.querySelector("#showInitialDateInput"),
  showOuterFrameInput: document.querySelector("#showOuterFrameInput"),
  avatarInput: document.querySelector("#avatarInput"),
  backgroundImageInput: document.querySelector("#backgroundImageInput"),
  backgroundImageField: document.querySelector("#backgroundImageField"),
  phoneScreen: document.querySelector(".phone-screen"),
  talkHeader: document.querySelector(".talk-header"),
  headerAvatar: document.querySelector("#headerAvatar"),
  headerName: document.querySelector("#headerName"),
  statusTime: document.querySelector("#statusTime"),
  chatStream: document.querySelector("#chatStream"),
  messageList: document.querySelector("#messageList"),
  messageForm: document.querySelector("#messageForm"),
  messageTextInput: document.querySelector("#messageTextInput"),
  messageTimeInput: document.querySelector("#messageTimeInput"),
  messageDateInput: document.querySelector("#messageDateInput"),
  messageImageInput: document.querySelector("#messageImageInput"),
  imagePreviewWrap: document.querySelector("#imagePreviewWrap"),
  imagePreview: document.querySelector("#imagePreview"),
  senderFieldset: document.querySelector("#senderFieldset"),
  messageMetaControls: document.querySelector("#messageMetaControls"),
  textField: document.querySelector("#textField"),
  imageField: document.querySelector("#imageField"),
  dateField: document.querySelector("#dateField"),
  readInput: document.querySelector("#readInput"),
  submitMessageButton: document.querySelector("#submitMessageButton"),
  cancelEditButton: document.querySelector("#cancelEditButton"),
  editHint: document.querySelector("#editHint"),
  resetButton: document.querySelector("#resetButton"),
  clearButton: document.querySelector("#clearButton"),
  downloadButton: document.querySelector("#downloadButton"),
  swapRolesButton: document.querySelector("#swapRolesButton")
};

function init() {
  elements.dateInput.value = state.date;
  elements.defaultTimeInput.value = state.defaultTime;
  elements.partnerNameInput.value = state.partnerName;
  elements.showAvatarInput.checked = state.showAvatar;
  elements.showInitialDateInput.checked = state.showInitialDate;
  elements.showOuterFrameInput.checked = state.showOuterFrame;
  elements.messageTimeInput.value = getLastMessageTime() || state.defaultTime;
  elements.messageDateInput.value = state.date;
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
    elements.messageTimeInput.value = getChronologicalTime(state.defaultTime, state.editId);
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

  elements.showInitialDateInput.addEventListener("change", (event) => {
    state.showInitialDate = event.target.checked;
    render();
  });

  elements.showOuterFrameInput.addEventListener("change", (event) => {
    state.showOuterFrame = event.target.checked;
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

  elements.messageTimeInput.addEventListener("change", () => {
    elements.messageTimeInput.value = getChronologicalTime(elements.messageTimeInput.value, state.editId);
  });

  document.querySelectorAll("input[name='backgroundColor']").forEach((input) => {
    input.addEventListener("change", (event) => {
      state.backgroundColor = event.target.value;
      render();
    });
  });

  document.querySelectorAll("input[name='decorationTheme']").forEach((input) => {
    input.addEventListener("change", (event) => {
      state.decorationTheme = event.target.value;
      render();
    });
  });

  elements.backgroundImageInput.addEventListener("change", async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    state.backgroundImageSrc = await readFileAsDataUrl(file);
    state.backgroundColor = "image";
    document.querySelector("input[name='backgroundColor'][value='image']").checked = true;
    render();
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
  elements.swapRolesButton.addEventListener("click", swapRoles);
}

function render() {
  applyBackground();
  elements.headerName.textContent = state.partnerName;
  elements.statusTime.textContent = formatTime(state.defaultTime);
  elements.headerAvatar.style.backgroundImage = state.avatarSrc ? `url("${state.avatarSrc}")` : "";
  elements.headerAvatar.classList.toggle("hidden", !state.showAvatar);
  elements.talkHeader.classList.toggle("avatar-hidden", !state.showAvatar);
  elements.phoneScreen.classList.toggle("outer-hidden", !state.showOuterFrame);
  renderChat();
  renderMessageList();
}

function renderChat() {
  elements.chatStream.innerHTML = "";
  if (state.showInitialDate) {
    elements.chatStream.append(makeDateChip(formatDate(state.date)));
  }

  if (state.messages.length === 0) {
    const empty = document.createElement("div");
    empty.className = "date-chip";
    empty.textContent = "メッセージを追加してください";
    elements.chatStream.append(empty);
    return;
  }

  state.messages.forEach((message) => {
    if (message.type === "date") {
      elements.chatStream.append(makeDateChip(formatDate(message.date)));
      return;
    }

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
    if (message.read) {
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

function makeDateChip(text) {
  const dateChip = document.createElement("div");
  dateChip.className = "date-chip";
  dateChip.textContent = text;
  return dateChip;
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
    title.textContent =
      message.type === "date"
        ? `${index + 1}. 日付`
        : `${index + 1}. ${message.sender === "me" ? "自分" : "相手"} / ${formatTime(message.time)}`;
    const summary = document.createElement("span");
    summary.textContent =
      message.type === "date" ? formatDate(message.date) : message.type === "image" ? "画像メッセージ" : message.text;
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
  const time = getChronologicalTime(elements.messageTimeInput.value || state.defaultTime, state.editId);
  const text = elements.messageTextInput.value.trim();

  if (type === "date") {
    const payload = {
      id: state.editId || crypto.randomUUID(),
      type: "date",
      date: elements.messageDateInput.value || state.date
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
    return;
  }

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
    read: elements.readInput.checked,
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

  document.querySelector(`input[name='messageType'][value='${message.type}']`).checked = true;
  if (message.type !== "date") {
    document.querySelector(`input[name='sender'][value='${message.sender}']`).checked = true;
  }
  elements.messageTextInput.value = message.text || "";
  elements.messageTimeInput.value = message.time || state.defaultTime;
  elements.messageDateInput.value = message.date || state.date;
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
  if (!state.editId) elements.messageTimeInput.value = getLastMessageTime() || state.defaultTime;
  render();
}

function moveMessage(index, direction) {
  const nextIndex = index + direction;
  if (nextIndex < 0 || nextIndex >= state.messages.length) return;
  const copy = [...state.messages];
  [copy[index], copy[nextIndex]] = [copy[nextIndex], copy[index]];
  state.messages = copy;
  if (!state.editId) elements.messageTimeInput.value = getLastMessageTime() || state.defaultTime;
  render();
}

function clearEditor() {
  state.editId = null;
  state.draftImageSrc = "";
  elements.messageTextInput.value = "";
  elements.messageImageInput.value = "";
  elements.messageTimeInput.value = getLastMessageTime() || state.defaultTime;
  elements.messageDateInput.value = state.date;
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
  state.showAvatar = false;
  state.showInitialDate = true;
  state.showOuterFrame = false;
  state.backgroundColor = "blue";
  state.decorationTheme = "none";
  state.backgroundImageSrc = "";
  state.avatarSrc = "";
  state.messages = [];
  elements.avatarInput.value = "";
  elements.backgroundImageInput.value = "";
  elements.partnerNameInput.value = state.partnerName;
  elements.dateInput.value = state.date;
  elements.defaultTimeInput.value = state.defaultTime;
  elements.showAvatarInput.checked = state.showAvatar;
  elements.showInitialDateInput.checked = state.showInitialDate;
  elements.showOuterFrameInput.checked = state.showOuterFrame;
  document.querySelector("input[name='backgroundColor'][value='blue']").checked = true;
  document.querySelector("input[name='decorationTheme'][value='none']").checked = true;
  clearEditor();
  render();
}

function swapRoles() {
  state.messages = state.messages.map((message) =>
    message.type === "date"
      ? message
      : {
          ...message,
          sender: message.sender === "me" ? "them" : "me"
        }
  );

  if (state.editId) {
    const editedMessage = state.messages.find((message) => message.id === state.editId);
    if (editedMessage && editedMessage.type !== "date") {
      document.querySelector(`input[name='sender'][value='${editedMessage.sender}']`).checked = true;
      syncReadAvailability();
    }
  }

  render();
}

function renderMessageTypeFields() {
  const type = document.querySelector("input[name='messageType']:checked").value;
  elements.textField.classList.toggle("hidden", type !== "text");
  elements.imageField.classList.toggle("hidden", type !== "image");
  elements.dateField.classList.toggle("hidden", type !== "date");
  elements.senderFieldset.classList.toggle("hidden", type === "date");
  elements.messageMetaControls.classList.toggle("hidden", type === "date");
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
  const isThem = sender === "them";
  if (isThem) {
    elements.readInput.checked = false;
  }
  elements.readInput.disabled = isThem;
  elements.readInput.parentElement.style.opacity = isThem ? "0.5" : "1";
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
  try {
    return await renderPhoneDomToCanvas();
  } catch (error) {
    console.warn("DOM capture failed; using canvas fallback.", error);
    return renderTalkToCanvasManual();
  }
}

async function renderPhoneDomToCanvas() {
  const source = elements.phoneScreen;
  const rect = source.getBoundingClientRect();
  const width = Math.max(320, Math.round(rect.width || 390));
  const height = Math.max(600, Math.round(rect.height || 760));
  const scale = 2;
  const clone = source.cloneNode(true);
  const originalStream = source.querySelector("#chatStream");
  const clonedStream = clone.querySelector("#chatStream");

  inlineComputedStyles(source, clone);
  if (originalStream && clonedStream) {
    preserveScrollPosition(originalStream, clonedStream);
  }

  clone.style.width = `${width}px`;
  clone.style.height = `${height}px`;
  clone.setAttribute("xmlns", "http://www.w3.org/1999/xhtml");
  clone.querySelectorAll("[id]").forEach((element) => element.removeAttribute("id"));

  const cssText = collectSameOriginCss();
  const rootStyles = getComputedStyle(document.documentElement);
  const cssVars = [
    "--chat-bg",
    "--my-bubble",
    "--their-bubble",
    "--ink",
    "--muted",
    "--line",
    "--brand",
    "--brand-dark",
    "--accent",
    "--shadow"
  ]
    .map((name) => `${name}:${rootStyles.getPropertyValue(name)};`)
    .join("");
  const serializedClone = new XMLSerializer().serializeToString(clone);
  const markup = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width * scale}" height="${height * scale}" viewBox="0 0 ${width} ${height}">
      <foreignObject width="100%" height="100%">
        <div xmlns="http://www.w3.org/1999/xhtml" style="${cssVars}">
          <style>/*<![CDATA[*/${cssText}/*]]>*/</style>
          ${serializedClone}
        </div>
      </foreignObject>
    </svg>
  `;
  const svgUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`;
  const image = await loadImage(svgUrl);
  const canvas = document.createElement("canvas");
  canvas.width = width * scale;
  canvas.height = height * scale;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  const centerPixel = ctx.getImageData(Math.floor(canvas.width / 2), Math.floor(canvas.height / 2), 1, 1).data;
  if (centerPixel[3] === 0) {
    throw new Error("DOM capture produced an empty canvas");
  }
  return canvas;
}

function inlineComputedStyles(source, clone) {
  const sourceElements = [source, ...source.querySelectorAll("*")];
  const cloneElements = [clone, ...clone.querySelectorAll("*")];
  sourceElements.forEach((sourceElement, index) => {
    const cloneElement = cloneElements[index];
    if (!cloneElement) return;
    const computed = getComputedStyle(sourceElement);
    let css = "";
    for (const property of computed) {
      css += `${property}:${computed.getPropertyValue(property)};`;
    }
    cloneElement.setAttribute("style", `${css}${cloneElement.getAttribute("style") || ""}`);
  });
}

function preserveScrollPosition(originalStream, clonedStream) {
  if (!originalStream.scrollTop) return;
  const computed = getComputedStyle(originalStream);
  const wrapper = document.createElement("div");
  wrapper.style.display = "flex";
  wrapper.style.flexDirection = "column";
  wrapper.style.gap = computed.gap;
  wrapper.style.width = "100%";
  wrapper.style.transform = `translateY(-${originalStream.scrollTop}px)`;
  wrapper.style.transformOrigin = "top left";
  while (clonedStream.firstChild) {
    wrapper.append(clonedStream.firstChild);
  }
  clonedStream.style.display = "block";
  clonedStream.style.overflow = "hidden";
  clonedStream.append(wrapper);
}

function collectSameOriginCss() {
  return [...document.styleSheets]
    .map((sheet) => {
      try {
        return [...sheet.cssRules].map((rule) => rule.cssText).join("\n");
      } catch {
        return "";
      }
    })
    .join("\n");
}

async function renderTalkToCanvasManual() {
  const previewRect = elements.phoneScreen.getBoundingClientRect();
  const width = Math.max(320, Math.round(previewRect.width || 390));
  const height = Math.max(600, Math.round(previewRect.height || 760));
  const scale = 2;
  const canvas = document.createElement("canvas");
  canvas.width = width * scale;
  canvas.height = height * scale;
  const ctx = canvas.getContext("2d");
  ctx.scale(scale, scale);
  ctx.textBaseline = "top";

  const avatarImage = state.avatarSrc ? await loadImage(state.avatarSrc).catch(() => null) : null;
  const uploadIconImage = await loadImage(uploadIconSrc).catch(() => null);
  const backgroundImage = state.backgroundImageSrc ? await loadImage(state.backgroundImageSrc).catch(() => null) : null;
  const imageCache = new Map();
  for (const message of state.messages) {
    if (message.type === "image" && message.imageSrc && !imageCache.has(message.imageSrc)) {
      imageCache.set(message.imageSrc, await loadImage(message.imageSrc).catch(() => null));
    }
  }

  drawChatBackground(ctx, width, height, backgroundImage);
  if (state.showOuterFrame) {
    drawStatusAndHeader(ctx, width, avatarImage);
    drawComposer(ctx, width, height);
  }

  const chatTop = state.showOuterFrame ? 106 : 0;
  const chatBottom = state.showOuterFrame ? height - 66 : height;
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, chatTop, width, chatBottom - chatTop);
  ctx.clip();
  drawMessages(ctx, width, chatTop, chatBottom, avatarImage, uploadIconImage, imageCache);
  ctx.restore();

  return canvas;
}

function applyBackground() {
  document.documentElement.style.setProperty("--chat-bg", getBackgroundColor());
  const layers = [];
  const decorationCss = getDecorationCss();
  if (decorationCss) layers.push(decorationCss);
  if (state.backgroundColor === "image" && state.backgroundImageSrc) {
    layers.push(`url("${state.backgroundImageSrc}")`);
  }

  elements.phoneScreen.style.backgroundColor = getBackgroundColor();
  elements.phoneScreen.style.backgroundImage = layers.join(", ");
  elements.phoneScreen.style.backgroundPosition = layers.map(() => "center").join(", ");
  elements.phoneScreen.style.backgroundRepeat = layers.map(() => "no-repeat").join(", ");
  elements.phoneScreen.style.backgroundSize = layers
    .map((_, index) => (decorationCss && index === 0 ? "390px 670px" : "cover"))
    .join(", ");
  elements.backgroundImageField.classList.toggle("hidden", state.backgroundColor !== "image");
}

function getBackgroundColor() {
  return backgroundColors[state.backgroundColor] || backgroundColors.blue;
}

function getDecorationCss() {
  if (state.decorationTheme === "decoDots") {
    return [
      "radial-gradient(circle at 12% 18%, rgba(255,255,255,.62) 0 15px, transparent 16px)",
      "radial-gradient(circle at 82% 20%, rgba(255,255,255,.48) 0 25px, transparent 26px)",
      "radial-gradient(circle at 20% 62%, rgba(255,230,242,.58) 0 19px, transparent 20px)",
      "radial-gradient(circle at 74% 72%, rgba(255,255,255,.44) 0 18px, transparent 19px)",
      "radial-gradient(circle at 46% 42%, rgba(255,255,255,.35) 0 10px, transparent 11px)"
    ].join(", ");
  }

  if (state.decorationTheme === "decoClouds") {
    return `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 390 670'%3E%3Cg fill='white'%3E%3Cg opacity='.68'%3E%3Crect x='22' y='108' width='104' height='34' rx='17'/%3E%3Ccircle cx='48' cy='111' r='22'/%3E%3Ccircle cx='78' cy='96' r='29'/%3E%3Ccircle cx='108' cy='112' r='24'/%3E%3C/g%3E%3Cg opacity='.54'%3E%3Crect x='236' y='86' width='118' height='38' rx='19'/%3E%3Ccircle cx='265' cy='88' r='24'/%3E%3Ccircle cx='302' cy='70' r='32'/%3E%3Ccircle cx='336' cy='91' r='26'/%3E%3C/g%3E%3Cg opacity='.56'%3E%3Crect x='38' y='492' width='128' height='40' rx='20'/%3E%3Ccircle cx='70' cy='494' r='27'/%3E%3Ccircle cx='112' cy='474' r='35'/%3E%3Ccircle cx='149' cy='498' r='28'/%3E%3C/g%3E%3Cg opacity='.48'%3E%3Crect x='218' y='548' width='134' height='42' rx='21'/%3E%3Ccircle cx='251' cy='548' r='29'/%3E%3Ccircle cx='294' cy='525' r='37'/%3E%3Ccircle cx='333' cy='552' r='30'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`;
  }

  return "";
}

function drawChatBackground(ctx, width, height, backgroundImage) {
  if (state.backgroundColor === "image" && backgroundImage) {
    drawImageCover(ctx, backgroundImage, 0, 0, width, height, 24);
  } else if (state.backgroundColor === "image") {
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, "#dbe8f1");
    gradient.addColorStop(1, "#a8bfd5");
    drawRoundedRect(ctx, 0, 0, width, height, 24, gradient);
  } else {
    drawRoundedRect(ctx, 0, 0, width, height, 24, getBackgroundColor());
  }

  ctx.save();
  drawRoundedPath(ctx, 0, 0, width, height, 24);
  ctx.clip();
  if (state.decorationTheme === "decoDots") {
    drawBackgroundDots(ctx, width, height);
  }

  if (state.decorationTheme === "decoClouds") {
    drawBackgroundClouds(ctx, width, height);
  }
  ctx.restore();
}

function drawBackgroundDots(ctx, width, height) {
  ctx.save();
  ctx.fillStyle = "rgba(255, 255, 255, 0.46)";
  [
    [46, 130, 16],
    [330, 154, 24],
    [76, 482, 20],
    [296, 604, 18],
    [184, 310, 12],
    [236, 468, 10],
    [128, 650, 14]
  ].forEach(([x, y, radius]) => {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.fillStyle = "rgba(255, 221, 238, 0.48)";
  [
    [102, 225, 12],
    [332, 384, 15],
    [238, 705, 10]
  ].forEach(([x, y, radius]) => {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();
}

function drawBackgroundClouds(ctx, width, height) {
  ctx.save();
  [
    [74, 122, 104, 56, 0.68],
    [296, 101, 118, 62, 0.54],
    [102, 510, 128, 68, 0.56],
    [285, 568, 134, 72, 0.48],
    [216, 360, 90, 48, 0.42]
  ].forEach(([x, y, w, h, alpha]) => {
    drawCloud(ctx, x, y, w, h, alpha);
  });
  ctx.restore();
}

function drawCloud(ctx, x, y, width, height, alpha = 0.56) {
  const left = x - width / 2;
  const baseTop = y + height * 0.2;
  ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
  drawRoundedRect(ctx, left + width * 0.08, baseTop, width * 0.84, height * 0.42, height * 0.21, ctx.fillStyle);

  ctx.beginPath();
  ctx.arc(left + width * 0.27, baseTop + height * 0.02, height * 0.34, 0, Math.PI * 2);
  ctx.arc(left + width * 0.56, y, height * 0.43, 0, Math.PI * 2);
  ctx.arc(left + width * 0.82, baseTop + height * 0.03, height * 0.31, 0, Math.PI * 2);
  ctx.fill();
}

function drawStatusAndHeader(ctx, width, avatarImage) {
  ctx.fillStyle = "#b9b9b9";
  ctx.fillRect(0, 0, width, 42);
  ctx.fillStyle = "#ffffff";
  ctx.font = "800 14px 'Yu Gothic', Meiryo, sans-serif";
  ctx.fillText(formatTime(state.defaultTime), 18, 12);
  ctx.font = "700 11px 'Yu Gothic', Meiryo, sans-serif";
  ctx.fillText("⌁ ✦ ♡ ✓", 82, 13);
  ctx.textAlign = "right";
  ctx.fillText("⌁ Wi-Fi 5G 96", width - 16, 13);
  ctx.textAlign = "left";

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 42, width, 64);
  ctx.fillStyle = "rgba(0, 0, 0, 0.08)";
  ctx.fillRect(0, 105, width, 1);
  ctx.fillStyle = "#26302f";
  ctx.font = "500 24px 'Yu Gothic', Meiryo, sans-serif";
  ctx.fillText("‹", 22, 73);
  ctx.font = "800 16px 'Yu Gothic', Meiryo, sans-serif";

  const nameX = state.showAvatar ? 92 : 58;
  if (state.showAvatar) {
    drawAvatar(ctx, avatarImage, 74, 74, 17);
  }
  drawHeaderTitle(ctx, state.partnerName, nameX, 72, width - nameX - 128);
  ctx.textAlign = "right";
  ctx.fillStyle = "#111414";
  ctx.font = "700 20px 'Yu Gothic', Meiryo, sans-serif";
  ctx.fillText("⌕", width - 90, 67);
  ctx.fillText("▤", width - 54, 68);
  ctx.fillText("≡", width - 18, 67);
  ctx.textAlign = "left";
}

function drawHeaderTitle(ctx, text, x, y, maxWidth) {
  ctx.fillStyle = "#111414";
  ctx.font = "800 16px 'Yu Gothic', Meiryo, sans-serif";
  let title = text || "";
  while (title.length > 0 && ctx.measureText(title).width > maxWidth) {
    title = title.slice(0, -1);
  }
  if (title !== text) title = `${title}…`;
  ctx.fillText(title, x, y);
}

function drawMessages(ctx, width, chatTop, chatBottom, avatarImage, uploadIconImage, imageCache) {
  const scrollOffset = elements.chatStream.scrollTop || 0;
  let y = chatTop + chatTopPadding - scrollOffset;
  if (state.showInitialDate) {
    y = drawDateChip(ctx, formatDate(state.date), width / 2, y) + 11;
  }

  if (state.messages.length === 0) {
    drawDateChip(ctx, "メッセージを追加してください", width / 2, y);
    return;
  }

  for (const message of state.messages) {
    if (message.type === "date") {
      if (y + 29 >= chatTop && y <= chatBottom) {
        drawDateChip(ctx, formatDate(message.date), width / 2, y);
      }
      y += 39;
      continue;
    }

    const block = measureMessageBlock(ctx, message, width, imageCache);
    if (y + block.height >= chatTop && y <= chatBottom) {
      drawMessageBlock(ctx, message, block, width, y, avatarImage, uploadIconImage, imageCache);
    }
    y += block.height + 10;
  }
}

function measureMessageBlock(ctx, message, width, imageCache) {
  if (message.type === "image") {
    const avatarSpace = message.sender === "them" && state.showAvatar ? talkMetrics.avatarSize + talkMetrics.avatarGap : 0;
    const maxImageWidth = width - talkMetrics.sidePad - talkMetrics.rightPad - avatarSpace - talkMetrics.metaWidth - talkMetrics.metaGap;
    const imageWidth = Math.min(message.sender === "them" ? 250 : 270, maxImageWidth);
    const img = imageCache.get(message.imageSrc);
    const ratio = img?.naturalWidth && img?.naturalHeight ? img.naturalHeight / img.naturalWidth : 0.72;
    const imageHeight = Math.max(80, Math.round(imageWidth * ratio));
    return { bubbleWidth: imageWidth, bubbleHeight: imageHeight, height: imageHeight, lines: [] };
  }

  ctx.font = `${talkMetrics.textFontSize}px 'Yu Gothic', Meiryo, sans-serif`;
  const avatarSpace = message.sender === "them" && state.showAvatar ? talkMetrics.avatarSize + talkMetrics.avatarGap : 0;
  const availableBubbleWidth =
    width - talkMetrics.sidePad - talkMetrics.rightPad - avatarSpace - talkMetrics.metaWidth - talkMetrics.metaGap;
  const maxBubbleWidth = Math.min(
    message.sender === "them" ? talkMetrics.maxTheirBubbleWidth : talkMetrics.maxMyBubbleWidth,
    availableBubbleWidth
  );
  const maxTextWidth = maxBubbleWidth - talkMetrics.textPadX * 2;
  const lines = wrapText(ctx, message.text || "", maxTextWidth);
  const textWidth = Math.max(42, ...lines.map((line) => ctx.measureText(line).width));
  const bubbleWidth = Math.min(maxBubbleWidth, Math.ceil(textWidth + talkMetrics.textPadX * 2));
  const bubbleHeight = lines.length * talkMetrics.textLineHeight + talkMetrics.textPadY * 2;
  return { bubbleWidth, bubbleHeight, height: Math.max(36, bubbleHeight), lines };
}

function drawMessageBlock(ctx, message, block, width, y, avatarImage, uploadIconImage, imageCache) {
  const metaWidth = talkMetrics.metaWidth;
  const gap = talkMetrics.metaGap;
  let bubbleX;
  let metaX;

  if (message.sender === "me") {
    bubbleX = width - talkMetrics.rightPad - talkMetrics.tailWidth - block.bubbleWidth;
    metaX = bubbleX - gap - metaWidth;
  } else {
    const avatarSpace = state.showAvatar ? talkMetrics.avatarSize + talkMetrics.avatarGap : 0;
    bubbleX = (state.showAvatar ? talkMetrics.sidePad : talkMetrics.sidePad + talkMetrics.tailWidth) + avatarSpace;
    metaX = bubbleX + block.bubbleWidth + gap;
    if (state.showAvatar) {
      drawAvatar(ctx, avatarImage, talkMetrics.sidePad + talkMetrics.avatarSize / 2, y + talkMetrics.avatarSize / 2, talkMetrics.avatarSize / 2);
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
    const radius = {
      tl: talkMetrics.bubbleRadius,
      tr: talkMetrics.bubbleRadius,
      br: talkMetrics.bubbleRadius,
      bl: talkMetrics.bubbleRadius
    };
    if (message.sender === "them") {
      radius.tl = 3;
      drawTheirTail(ctx, bubbleX, y);
    } else {
      radius.tr = 3;
      drawMyTail(ctx, bubbleX + block.bubbleWidth, y);
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
    ctx.font = `${talkMetrics.textFontSize}px 'Yu Gothic', Meiryo, sans-serif`;
    block.lines.forEach((line, index) => {
      ctx.fillText(line, bubbleX + talkMetrics.textPadX, y + talkMetrics.textPadY + index * talkMetrics.textLineHeight);
    });
  }

  drawMeta(ctx, message, metaX, y + block.bubbleHeight - (message.read ? 29 : 17));
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
  ctx.moveTo(x + 7, y - 1);
  ctx.lineTo(x - 4, y - 1);
  ctx.quadraticCurveTo(x - 7, y - 1, x - 9, y - 5);
  ctx.lineTo(x - 11, y - 9);
  ctx.quadraticCurveTo(x - 8, y + 1, x - 4, y + 6);
  ctx.quadraticCurveTo(x - 2, y + 8, x - 2, y + 13);
  ctx.lineTo(x + 7, y + 13);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawMyTail(ctx, x, y) {
  ctx.save();
  ctx.fillStyle = "#8ee86c";
  ctx.beginPath();
  ctx.moveTo(x - 7, y - 1);
  ctx.lineTo(x + 4, y - 1);
  ctx.quadraticCurveTo(x + 7, y - 1, x + 9, y - 5);
  ctx.lineTo(x + 11, y - 9);
  ctx.quadraticCurveTo(x + 8, y + 1, x + 4, y + 6);
  ctx.quadraticCurveTo(x + 2, y + 8, x + 2, y + 13);
  ctx.lineTo(x - 7, y + 13);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawImageMeta(ctx, message, x, y, width, height) {
  const lines = [];
  if (message.read) {
    lines.push("既読");
  }
  lines.push(formatTime(message.time));

  ctx.font = `500 ${talkMetrics.metaFontSize}px 'Yu Gothic', Meiryo, sans-serif`;
  ctx.fillStyle = "rgba(48, 52, 60, 0.78)";
  ctx.shadowBlur = 0;
  const textX = message.sender === "me" ? x - 6 : x + width + 6;
  const textY = y + height - lines.length * talkMetrics.metaLineHeight - 7;
  ctx.textAlign = message.sender === "me" ? "right" : "left";
  lines.forEach((line, index) => {
    ctx.fillText(line, textX, textY + index * talkMetrics.metaLineHeight);
  });
  ctx.textAlign = "left";
}

function drawMeta(ctx, message, x, y) {
  ctx.fillStyle = "rgba(48, 52, 60, 0.78)";
  ctx.shadowBlur = 0;
  ctx.font = `500 ${talkMetrics.metaFontSize}px 'Yu Gothic', Meiryo, sans-serif`;
  if (message.sender === "me") {
    ctx.textAlign = "right";
    if (message.read) {
      ctx.fillText("既読", x + talkMetrics.metaWidth, y);
      ctx.fillText(formatTime(message.time), x + talkMetrics.metaWidth, y + talkMetrics.metaLineHeight);
    } else {
      ctx.fillText(formatTime(message.time), x + talkMetrics.metaWidth, y);
    }
  } else {
    ctx.textAlign = "left";
    if (message.read) {
      ctx.fillText("既読", x, y);
      ctx.fillText(formatTime(message.time), x, y + talkMetrics.metaLineHeight);
    } else {
      ctx.fillText(formatTime(message.time), x, y);
    }
  }
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
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, height - 66, width, 66);
  ctx.fillStyle = "#26302f";
  ctx.font = "400 24px 'Yu Gothic', Meiryo, sans-serif";
  ctx.fillText("+", 18, height - 44);
  ctx.fillText("▣", 55, height - 42);
  ctx.fillText("▧", 92, height - 42);
  drawRoundedRect(ctx, 128, height - 52, width - 178, 42, 21, "#f1f2f2");
  ctx.fillStyle = "#8a9490";
  ctx.font = "400 12px 'Yu Gothic', Meiryo, sans-serif";
  ctx.fillText("メッセージを入力", 142, height - 37);
  ctx.fillStyle = "#26302f";
  ctx.font = "700 22px 'Yu Gothic', Meiryo, sans-serif";
  ctx.fillText("☺", width - 74, height - 42);
  ctx.fillText("◉", width - 35, height - 42);
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

function getChronologicalTime(value, editId = null) {
  const candidate = formatTime(value || state.defaultTime);
  const previous = getPreviousMessageTime(editId);
  if (previous && compareTimes(candidate, previous) < 0) return previous;
  return candidate;
}

function getPreviousMessageTime(editId = null) {
  const endIndex = editId ? state.messages.findIndex((message) => message.id === editId) : state.messages.length;
  const startIndex = endIndex === -1 ? state.messages.length - 1 : endIndex - 1;
  for (let index = startIndex; index >= 0; index -= 1) {
    const message = state.messages[index];
    if (message.type !== "date" && message.time) return formatTime(message.time);
  }
  return "";
}

function getLastMessageTime() {
  for (let index = state.messages.length - 1; index >= 0; index -= 1) {
    const message = state.messages[index];
    if (message.type !== "date" && message.time) return formatTime(message.time);
  }
  return "";
}

function compareTimes(left, right) {
  const leftMinutes = timeToMinutes(left);
  const rightMinutes = timeToMinutes(right);
  if (leftMinutes === null || rightMinutes === null) return 0;
  return leftMinutes - rightMinutes;
}

function timeToMinutes(value) {
  const [hours, minutes] = formatTime(value).split(":").map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
  return hours * 60 + minutes;
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
