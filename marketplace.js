const marketplace = window.supabase.createClient(
  "https://gcotwnysfiitsooadpaq.supabase.co",
  "sb_publishable_EUW506MKge5f0MQILqlDPg_fUWjsdCP"
);

async function loadMarketplace() {
  const { data, error } = await marketplace.from("marketplace_items")
    .select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

async function uploadMedia(file, path) {
  if (file.size > 50 * 1024 * 1024) {
    throw new Error("The file is larger than the 50 MB upload limit.");
  }
  const { error } = await marketplace.storage.from("marketplace")
    .upload(path, file, { contentType: file.type, upsert: true });
  if (error) throw error;
  return marketplace.storage.from("marketplace").getPublicUrl(path).data.publicUrl;
}

async function saveMarketplaceItem(item) {
  const { error } = await marketplace.from("marketplace_items").upsert(item);
  if (error) throw error;
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);
}
