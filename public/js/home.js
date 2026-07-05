// Edit Function
let editTargetId = null;

document.querySelectorAll(".editIcon").forEach((icon) => {
  icon.addEventListener("click", () => {
    openEditModal(icon.dataset.id, icon.dataset.url);
  });
});

document.querySelectorAll(".deleteIcon").forEach((icon) => {
  icon.addEventListener("click", () => {
    openDeleteModal(icon.dataset.id);
  });
});

function openEditModal(shortId, currentUrl) {
  editTargetId = shortId;
  document.getElementById("editUrlInput").value = currentUrl;
  document.getElementById("editModal").classList.remove("hidden");
}

const csrfToken = document.querySelector('meta[name="csrf-token"]').content;

function closeEditModal() {
  editTargetId = null;
  document.getElementById("editModal").classList.add("hidden");
}

document.getElementById("cancelEdit").onclick = closeEditModal;

document.getElementById("confirmEdit").onclick = async function () {
  if (!editTargetId) return;

  const newUrl = document.getElementById("editUrlInput").value.trim();
  if (!newUrl) {
    alert("URL cannot be empty");
    return;
  }

  const res = await fetch(`/url/${editTargetId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "CSRF-Token": csrfToken,
    },
    body: JSON.stringify({ newUrl }),
  });

  if (res.ok) {
    closeEditModal();
    location.reload();
  } else {
    const data = await res.json();
    alert(data.error || "Failed to update");
  }
};

// Delete Function
let deleteTargetId = null;

function openDeleteModal(shortId) {
  deleteTargetId = shortId;
  document.getElementById("deleteModal").classList.remove("hidden");
}

function closeDeleteModal() {
  deleteTargetId = null;
  document.getElementById("deleteModal").classList.add("hidden");
}

document.getElementById("cancelDelete").onclick = closeDeleteModal;

document.getElementById("confirmDelete").onclick = async function () {
  if (!deleteTargetId) return;

  const res = await fetch(`/url/${deleteTargetId}`, {
    method: "DELETE",
    headers: {
      "CSRF-Token": csrfToken,
    },
  });

  if (res.ok) {
    closeDeleteModal();
    location.reload();
  } else {
    const data = await res.json();
    alert(data.error || "Failed to delete");
  }
};

// Copy Icon Function
document.querySelectorAll(".copyIcon").forEach((icon) => {
  icon.addEventListener("click", () => {
    const url = icon.dataset.url;

    navigator.clipboard
      .writeText(url)
      .then(() => {})
      .catch((err) => {
        console.error("Failed to copy: ", err);
        alert("Failed to copy URL");
      });
  });
});

// Redirect Text Function
document.querySelectorAll(".redirectText").forEach((text) => {
  const btn = text.nextElementSibling;

  if (text.scrollHeight > text.clientHeight) {
    btn.classList.remove("hidden");
  }

  btn.addEventListener("click", () => {
    text.classList.toggle("line-clamp-2");
    btn.innerText = btn.innerText === "see more" ? "see less" : "see more";
  });
});

document.querySelectorAll(".qrIcon").forEach((icon) => {
  icon.addEventListener("click", () => {
    console.log("Qr clicked");
    console.log(icon.dataset.id);
    openQr(icon.dataset.id);
  });
});

document.getElementById("closeQrBtn").addEventListener("click", closeQrModal);

// QR Code Function
function openQr(shortId) {
  fetch(`url/qr/${shortId}`)
    .then((res) => res.json())
    .then((data) => {
      document.getElementById("qrImage").src = data.qr;
      document.getElementById("qrModal").classList.remove("hidden");
    });
}

function closeQrModal() {
  document.getElementById("qrModal").classList.add("hidden");
}

function handleExpiryChange(value) {
  const input = document.getElementById("expiresAt");

  if (value === "custom") {
    input.classList.remove("hidden");
    input.value = "";
    return;
  }

  if (!value) {
    input.classList.add("hidden");
    input.value = "";
    return;
  }

  const days = parseInt(value);

  const now = new Date();
  now.setDate(now.getDate() + days);

  // ✅ LOCAL date fix
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  const local = `${year}-${month}-${day}`;

  input.value = local;
  input.classList.remove("hidden");
}
