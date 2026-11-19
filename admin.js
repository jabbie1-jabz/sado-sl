const loginPage = document.getElementById("login-page");
const adminPage = document.getElementById("admin-page");
const message = document.getElementById("message");
let items = [];

function showMessage(text, type = "error") {
  message.className = `message ${type}`;
  message.textContent = text;
}

async function refreshItems() {
  items = await loadMarketplace();
  renderItems("product", "products-list");
  renderItems("video", "videos-list");
}

function renderItems(kind, listId) {
  const list = document.getElementById(listId);
  list.replaceChildren();
  const filtered = items.filter(item => item.kind === kind);
  if (!filtered.length) {
    list.textContent = kind === "product" ? "No products yet" : "No videos yet";
    return;
  }
  filtered.forEach(item => {
    const row = document.createElement("div");
    row.className = "product-item";
    if (kind === "product") {
      const image = document.createElement("img");
      image.src = item.payload.image;
      image.alt = item.payload.title;
      row.appendChild(image);
    }
    const info = document.createElement("div");
    info.className = "product-info";
    const title = document.createElement("h4");
    title.textContent = item.payload.title;
    const details = document.createElement("p");
    details.textContent = kind === "product"
      ? `${item.payload.category} | ${item.payload.qty}`
      : item.payload.type;
    const description = document.createElement("p");
    description.textContent = item.payload.desc;
    info.append(title, details, description);
    const button = document.createElement("button");
    button.className = "btn-delete";
    button.textContent = "Delete";
    button.addEventListener("click", () => deleteItem(item, button));
    row.append(info, button);
    list.appendChild(row);
  });
}

async function deleteItem(item, button) {
  if (!confirm("Delete this listing for all customers?")) return;
  button.disabled = true;
  try {
    const { error } = await marketplace.from("marketplace_items").delete().eq("id", item.id);
    if (error) throw error;
    if (item.media_path) {
      const { error: storageError } = await marketplace.storage.from("marketplace").remove([item.media_path]);
      if (storageError) throw new Error(`Listing deleted, but media cleanup failed: ${storageError.message}`);
    }
    await refreshItems();
    showMessage("Listing deleted.", "success");
  } catch (error) {
    showMessage(error.message);
    try { await refreshItems(); } catch (refreshError) { console.error(refreshError); }
  } finally {
    button.disabled = false;
  }
}

async function showDashboard() {
  loginPage.classList.add("hidden");
  adminPage.classList.remove("hidden");
  try {
    await refreshItems();
  } catch (error) {
    showMessage(`Could not load listings: ${error.message}`);
  }
}

document.getElementById("login-form").addEventListener("submit", async event => {
  event.preventDefault();
  const form = event.currentTarget;
  const button = form.querySelector("button");
  button.disabled = true;
  try {
    const { error } = await marketplace.auth.signInWithPassword({
      email: document.getElementById("admin-email").value.trim(),
      password: document.getElementById("admin-password").value
    });
    if (error) throw error;
    document.getElementById("admin-password").value = "";
    document.getElementById("login-error").textContent = "";
    await showDashboard();
  } catch (error) {
    document.getElementById("login-error").textContent = error.message;
  } finally {
    button.disabled = false;
  }
});

async function logout() {
  const { error } = await marketplace.auth.signOut();
  if (error) {
    showMessage(`Could not sign out: ${error.message}`);
    return;
  }
  adminPage.classList.add("hidden");
  loginPage.classList.remove("hidden");
}

async function publishWithFile(kind, payload, file) {
  const id = crypto.randomUUID();
  const path = `${kind}/${id}`;
  const url = await uploadMedia(file, path);
  if (kind === "product") payload.image = url;
  else payload.src = url;
  try {
    await saveMarketplaceItem({ id, kind, payload, media_path: path });
  } catch (error) {
    const { error: cleanupError } = await marketplace.storage.from("marketplace").remove([path]);
    if (cleanupError) console.error("Could not remove unpublished media:", cleanupError);
    throw error;
  }
}

function submitHandler(formId, publish) {
  const form = document.getElementById(formId);
  form.addEventListener("submit", async event => {
    event.preventDefault();
    const button = form.querySelector('button[type="submit"]');
    button.disabled = true;
    try {
      await publish();
      form.reset();
    } catch (error) {
      showMessage(`Not published: ${error.message}`);
      button.disabled = false;
      return;
    }
    try {
      await refreshItems();
      showMessage("Published online for customers.", "success");
    } catch (error) {
      showMessage(`Published, but could not refresh the admin list: ${error.message}`);
    } finally {
      button.disabled = false;
    }
  });
}

submitHandler("good-form", async () => {
  const file = document.getElementById("good-image").files[0];
  if (!file || !file.type.startsWith("image/")) throw new Error("Choose an image file.");
  await publishWithFile("product", {
    title: document.getElementById("good-title").value,
    category: document.getElementById("good-category").value,
    qty: document.getElementById("good-qty").value,
    desc: document.getElementById("good-desc").value
  }, file);
});

function youtubeEmbed(value) {
  let url;
  try { url = new URL(value); } catch { throw new Error("Enter a valid YouTube URL."); }
  let id;
  if (url.hostname === "youtu.be") id = url.pathname.slice(1);
  else if (["youtube.com", "www.youtube.com", "m.youtube.com"].includes(url.hostname)) {
    id = url.pathname.startsWith("/embed/") ? url.pathname.split("/")[2] : url.searchParams.get("v");
  }
  if (!id || !/^[A-Za-z0-9_-]{11}$/.test(id)) throw new Error("Enter a valid YouTube video URL.");
  return `https://www.youtube.com/embed/${id}`;
}

submitHandler("video-form", async () => {
  const file = document.getElementById("video-file").files[0];
  const url = document.getElementById("video-url").value.trim();
  const payload = {
    title: document.getElementById("video-title").value,
    desc: document.getElementById("video-desc").value
  };
  if (file) {
    if (!file.type.startsWith("video/")) throw new Error("Choose a video file.");
    payload.type = "local";
    await publishWithFile("video", payload, file);
  } else if (url) {
    payload.type = "youtube";
    payload.src = youtubeEmbed(url);
    await saveMarketplaceItem({ id: crypto.randomUUID(), kind: "video", payload });
  } else {
    throw new Error("Choose a video file or enter a YouTube URL.");
  }
});

document.getElementById("import-local").addEventListener("click", async event => {
  if (!confirm("Publish listings saved in this browser to the customer website?")) return;
  const button = event.currentTarget;
  button.disabled = true;
  let skipped = 0;
  try {
    const goods = JSON.parse(localStorage.getItem("sadoGoods") || "[]");
    const videos = JSON.parse(localStorage.getItem("sadoVideos") || "[]");
    if (!goods.length && !videos.length) {
      showMessage("No older uploads found in this browser. Use the original laptop and browser.");
      return;
    }
    const existing = new Set((await loadMarketplace()).map(item => item.id));
    for (const [kind, entries] of [["product", goods], ["video", videos]]) {
      for (const entry of entries) {
        const id = `legacy-${kind}-${entry.id}`;
        if (existing.has(id)) continue;
        const payload = { ...entry };
        delete payload.id;
        let mediaPath = null;
        if (kind === "product" && entry.image && entry.image.startsWith("data:image/")) {
          const response = await fetch(entry.image);
          const file = await response.blob();
          mediaPath = `product/${id}`;
          payload.image = await uploadMedia(file, mediaPath);
        } else if (kind === "video" && entry.type === "youtube") {
          payload.src = youtubeEmbed(entry.src);
        } else {
          skipped++;
          continue;
        }
        await saveMarketplaceItem({ id, kind, payload, media_path: mediaPath });
      }
    }
    await refreshItems();
    showMessage(skipped
      ? `Import finished. ${skipped} item(s) could not be imported; please upload them again.`
      : "Browser listings are now published online.", skipped ? "error" : "success");
  } catch (error) {
    showMessage(`Import stopped: ${error.message}. Your browser data was not removed; try again.`);
  } finally {
    button.disabled = false;
  }
});

marketplace.auth.getSession().then(({ data, error }) => {
  if (error) document.getElementById("login-error").textContent = error.message;
  else if (data.session) showDashboard();
}).catch(error => {
  document.getElementById("login-error").textContent = `Could not connect: ${error.message}`;
});
