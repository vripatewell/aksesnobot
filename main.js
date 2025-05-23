// Token GitHub dihapus. Gunakan backend (/api/submit) untuk akses aman.
    const passwordAdmin = "riki#shop";
    let jsonData = null;
    let fileSha = null;
    let isAdmin = false;function showStatus(message, type = 'success') {
  const el = isAdmin ? document.getElementById("statusAdmin") : document.getElementById("status");
  const sound = document.getElementById("notifSound");

  // Ganti suara berdasarkan status
  if (type === 'success') {
    sound.src = "benar.mp3"; // suara ting
  } else {
    sound.src = "salah.mp3"; // suara detdot
  }

  el.innerText = message;
  el.className = `status ${type}`;
  el.classList.remove("hidden");
  el.style.opacity = 1;
  sound.currentTime = 0;
  sound.play();
  setTimeout(() => {
    el.style.opacity = 0;
    setTimeout(() => el.classList.add("hidden"), 500);
  }, 3000);
}

function togglePanduan() {
  document.getElementById("panduanBox").classList.toggle("hidden");
}

function toggleDaftarNomor() {
  const area = document.getElementById("listUserArea");
  area.classList.toggle("hidden");
  if (!area.classList.contains("hidden")) {
    lihatPenggunaUmum();
  }
}

async function hapusDariBlacklist() {
  const nomor = document.getElementById("blacklistSelect").value;
  if (!nomor) return showStatus("Pilih nomor dari blacklist.", "warning");

  await ambilData();
  const index = jsonData.blacklist.indexOf(nomor);
  if (index > -1) {
    jsonData.blacklist.splice(index, 1);
    const berhasil = await simpanData(`Hapus dari blacklist: ${nomor}`);
    if (berhasil) {
      showStatus("Nomor dihapus dari blacklist.", "success");
      updateBlacklistArea();
    } else {
      showStatus("Gagal menghapus blacklist.", "warning");
    }
  }
}

function toggleBlacklist() {
  const box = document.getElementById("blacklistBox");
  box.classList.toggle("hidden");
  if (!box.classList.contains("hidden")) {
    updateBlacklistArea();
  }
}

function updateBlacklistArea() {
  const area = document.getElementById("blacklistArea");
  if (!jsonData || !jsonData.blacklist || jsonData.blacklist.length === 0) {
    area.value = "Tidak ada nomor blacklist.";
    return;
  }
  area.value = jsonData.blacklist.map((nomor, i) => `${i + 1}. ${nomor}`).join("\n");
}

function updateClock() {
  const clock = document.getElementById("clock");
  const now = new Date();
  const waktu = now.toLocaleTimeString("id-ID", { timeZone: "Asia/Jakarta", hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const tanggal = now.toLocaleDateString("id-ID", { timeZone: "Asia/Jakarta" });
  clock.innerText = `\u23F0 Waktu sekarang: ${tanggal} ${waktu}`;
}
setInterval(updateClock, 1000);
updateClock();

async function ambilData() {
  try {
    const res = await fetch("/api/submit");
    if (!res.ok) throw new Error("Gagal ambil data");
    const data = await res.json();
    fileSha = data.sha;
    jsonData = data.content;
  } catch (e) {
    console.error(e);
    alert("Gagal ambil data dari server.");
  }
  }
async function simpanData(message) {
  const updatedContent = JSON.stringify(jsonData, null, 2);
  const res = await fetch("/api/submit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      message,
      content: updatedContent,
      sha: fileSha
    })
  });
  return res.ok;
}

function updateUserListForUser() {
  const area = document.getElementById("listUserArea");
  if (!jsonData || !jsonData.users) return;
  area.value = jsonData.users.map((u, i) => {
    const isBL = jsonData.blacklist?.includes(u.nomor);
    const status = isBL ? 'BLACKLIST' : 'AKTIF';
    return `${i + 1}. ${u.nomor} | ${status} | ${u.waktu || '-'}`;
  }).join("\n");
}
function tampilkanDataUserSendiri() {
  const data = JSON.parse(localStorage.getItem("userData"));
  const userArea = document.getElementById("userPrivate");

  if (data) {
    userArea.innerHTML = `
      <div style="white-space: pre-wrap; color: #00ffff;">
        ========== DATA ANDA ==========
        Nomor    : ${data.nomor}
        Password : ${data.password}

        ========== CATATAN ==========
        - Silakan salin data Anda agar tidak hilang.
        - Data akan hilang saat halaman di-refresh.
        - Jika Anda menambahkan nomor baru, data lama akan tergantikan.
        - Data ini hanya tampil 1x. Salin sekarang untuk keamanan.
      </div>
    `;
  } else {
    userArea.innerHTML = `
      <div style="color: #ff4c4c;">
        Belum ada data disimpan.
      </div>
    `;
  }
}

async function tambahNomor() {
  const nomor = document.getElementById("nomor").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!nomor || !password) {
    showStatus("Nomor dan password harus diisi.", "warning");
    return;
  }

  // Tolak jika diawali dengan 0, +, atau -
  if (/^(0|\+|-)/.test(nomor)) {
    showStatus("Nomor harus diawali dengan\nkode negara (contoh: 628xxxx), tanpa 0, +, atau -.", "warning");
    return;
  }

  // Validasi nomor hanya angka dan panjang 9–16 digit
  if (!/^\d{9,16}$/.test(nomor)) {
    showStatus("Nomor tidak valid\n(hanya angka, 9-16 digit).", "warning");
    return;
  }

  await ambilData();

  if (jsonData.blacklist?.includes(nomor)) {
    return showStatus("Nomor ini diblacklist.", "warning");
  }

  const sudahAda = jsonData.users.some(user => user.nomor === nomor);
  if (sudahAda) {
    return showStatus("Nomor sudah terdaftar.", "warning");
  }

  const waktu = new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" });
  jsonData.users.push({ nomor, password, waktu });

  const berhasil = await simpanData(`Tambah nomor ${nomor}`);
  if (berhasil) {
    localStorage.setItem("userData", JSON.stringify({ nomor, password }));
    tampilkanDataUserSendiri();
    document.getElementById("nomor").value = "";
    document.getElementById("password").value = "";
    showStatus("Berhasil menambahkan.", "success");
    updateUserListForUser();
  } else {
    showStatus("Gagal menambahkan.", "warning");
  }
}

async function lihatPenggunaUmum() {
  await ambilData();
  updateUserListForUser();
}

async function adminLogin() {
  const pass = document.getElementById("adminPass").value;

  const res = await fetch("/api/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mode: "admin-login", passInput: pass }),
  });

  const result = await res.json();

  if (result.success) {
    isAdmin = true;
    document.getElementById("mainForm").classList.add("hidden");
    document.getElementById("adminPanel").classList.remove("hidden");
    await ambilData();
    updateOutputList();
    updateSelectOptions();
    showAdminPanel();
    showStatus("Login sukses!", "success");
  } else {
    showStatus(result.error || "Password salah", "warning");
  }
}

async function kembali(forceUpdate = false) {
  isAdmin = false;
  document.getElementById("mainForm").classList.remove("hidden");
  document.getElementById("adminPanel").classList.add("hidden");
  if (forceUpdate) {
    await ambilData();
    updateUserListForUser();
  }
}

function updateOutputList() {
  const output = document.getElementById("outputArea");
  if (!jsonData || !jsonData.users) return;
  output.value = jsonData.users.map((u, i) => {
    const isBL = jsonData.blacklist?.includes(u.nomor);
    const status = isBL ? 'BLACKLIST' : 'AKTIF';
    return `${i + 1}. ${u.nomor} | ${u.password} | ${u.waktu || '-'} | ${status}`;
  }).join("\n");
}

function updateSelectOptions() {
  const select = document.getElementById("nomorSelect");
  select.innerHTML = '<option value="">Pilih nomor...</option>';
  jsonData.users.forEach((u, i) => {
    const option = document.createElement("option");
    option.value = i;
    option.text = `${i + 1}. ${u.nomor}${jsonData.blacklist?.includes(u.nomor) ? ' (BLACKLIST)' : ''}`;
    select.appendChild(option);
  });
}

async function hapusNomor() {
  const index = parseInt(document.getElementById("nomorSelect").value);
  if (isNaN(index)) return showStatus("Pilih nomor.", "warning");
  await ambilData();

  const userToDelete = jsonData.users[index];
  const nomorHapus = userToDelete.nomor;
  const passwordHapus = userToDelete.password;

  // Hapus dari localStorage jika cocok
  const localData = JSON.parse(localStorage.getItem("userData"));
  if (localData && localData.nomor === nomorHapus && localData.password === passwordHapus) {
    localStorage.removeItem("userData");
    tampilkanDataUserSendiri();
  }

  jsonData.users.splice(index, 1);
  const berhasil = await simpanData(`Hapus nomor ${nomorHapus}`);
  if (berhasil) {
    updateOutputList();
    updateSelectOptions();
    showStatus("Berhasil dihapus.", "success");
  } else {
    showStatus("Gagal menghapus.", "warning");
  }
}

function updateBlacklistArea() {
  const area = document.getElementById("blacklistArea");
  const select = document.getElementById("blacklistSelect");

  if (!jsonData || !jsonData.blacklist || jsonData.blacklist.length === 0) {
    area.value = "Tidak ada nomor blacklist.";
    select.innerHTML = '<option value="">Tidak ada nomor</option>';
    return;
  }

  area.value = jsonData.blacklist.map((nomor, i) => `${i + 1}. ${nomor}`).join("\n");

  // Update dropdown
  select.innerHTML = '<option value="">Pilih nomor...</option>';
  jsonData.blacklist.forEach((nomor, i) => {
    const opt = document.createElement("option");
    opt.value = nomor;
    opt.text = `${i + 1}. ${nomor}`;
    select.appendChild(opt);
  });
}

async function blacklistNomor() {
  const index = parseInt(document.getElementById("nomorSelect").value);
  if (isNaN(index)) return showStatus("Pilih nomor.", "warning");
  await ambilData();
  const nomor = jsonData.users[index].nomor;
  jsonData.users.splice(index, 1);
  jsonData.blacklist = jsonData.blacklist || [];
  if (!jsonData.blacklist.includes(nomor)) {
    jsonData.blacklist.push(nomor);
  }
  const berhasil = await simpanData(`Blacklist nomor ${nomor}`);
  if (berhasil) {
    updateOutputList();
    updateSelectOptions();
    showStatus("Nomor diblacklist.", "success");
  } else {
    showStatus("Gagal blacklist.", "warning");
  }
}

  function toggleData() {
    const box = document.getElementById("dataBox");
    box.style.display = box.style.display === "none" ? "block" : "none";
  }
  
  function toggleUserData() {
  const container = document.getElementById("userDataContainer");
  if (container.style.display === "none") {
    container.style.display = "block";
  } else {
    container.style.display = "none";
  }
}

  function toggleDaftarOutput() {
    const wrapper = document.getElementById("outputWrapper");
    wrapper.classList.toggle("hidden");
  }
  
  function updateClock() {
      const now = new Date();
      const hari = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
      const bulan = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
      const namaHari = hari[now.getDay()];
      const tanggal = now.getDate();
      const namaBulan = bulan[now.getMonth()];
      const tahun = now.getFullYear();
      const jam = now.toLocaleTimeString('id-ID', { hour12: false });

      const fullWaktu = `${namaHari}, ${tanggal} ${namaBulan} ${tahun} - ${jam}`;
      document.getElementById("clock-bar").textContent = fullWaktu;
    }
    setInterval(updateClock, 1000);
    updateClock();
    
    function showStatusLogin(message, type = 'success') {
  const el = document.getElementById("status");
  const sound = document.getElementById("notifSound");

  sound.src = type === 'success' ? "benar.mp3" : "salah.mp3";
  el.innerText = message;
  el.className = `status ${type}`;
  el.classList.remove("hidden");
  el.style.opacity = 1;

  sound.currentTime = 0;
  sound.play();

  setTimeout(() => {
    el.style.opacity = 0;
    setTimeout(() => el.classList.add("hidden"), 500);
  }, 3000);
}

document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("loginBtn").addEventListener("click", function () {
    const pass = document.getElementById("passwordLogin").value.trim();

    if (pass === "") {
      showStatusLogin("Password belum diisi!", "error");
    } else if (pass === "masuk123") {
      document.getElementById("loginScreen").classList.add("hidden");
      document.getElementById("mainForm").classList.remove("hidden");
      document.getElementById("clock-bar").classList.remove("hidden");
      document.getElementById("status").classList.remove("hidden");
      document.getElementById("loginMusic").play().catch(() => console.warn("Autoplay diblokir."));
      showStatusLogin("Login berhasil!", "success");
    } else {
      showStatusLogin("Password salah!", "error");
    }
  });
});



    function showTab(tabId) {
  const loadingOverlay = document.getElementById("loadingOverlay");

  // Tampilkan loading
  loadingOverlay.classList.remove("hidden");

  setTimeout(() => {
    const tabs = document.querySelectorAll(".tab-pane");
    tabs.forEach(tab => tab.classList.add("hidden"));

    document.getElementById(tabId).classList.remove("hidden");

    const buttons = document.querySelectorAll(".nav-tabs button");
    buttons.forEach(btn => btn.classList.remove("active"));
    if (event && event.target) {
      event.target.classList.add("active");
    }

    // Sembunyikan loading setelah tab muncul
    loadingOverlay.classList.add("hidden");
  }, 500); // durasi loading
}
   
  function togglePassword(inputId, icon) {
    const input = document.getElementById(inputId);
    if (input.type === "password") {
      input.type = "text";
      icon.textContent = "🙈";
    } else {
      input.type = "password";
      icon.textContent = "👁️";
    }
  }
  
  function pencarianUserRealtime() {
  const input = document.getElementById("userSearchInput").value.trim();
  const resultArea = document.getElementById("userSearchResult");

  let dataNomor = [];
  if (localStorage.getItem("dataNomor")) {
    dataNomor = JSON.parse(localStorage.getItem("dataNomor"));
  }

  if (!input) {
    resultArea.innerHTML = "Masukkan nomor untuk mencari.";
    return;
  }

  const found = dataNomor.find(item => item.nomor === input);

  if (found) {
    resultArea.innerHTML = `
      <strong>Nomor Ditemukan!</strong><br>
      Nomor: ${found.nomor}<br>
      Tanggal: ${found.tanggal || "Tidak tersedia"}<br>
      Status: ${found.status || "Tidak diketahui"}
    `;
  } else {
    resultArea.innerHTML = "Nomor tidak terdaftar.";
  }
}

function pencarianAdminRealtime() {
  const input = document.getElementById("adminSearchInput").value.toLowerCase();
  const semuaData = document.getElementById("outputArea").value.split('\n');
  const hasilDiv = document.getElementById("adminSearchResult");

  if (input === "") {
    hasilDiv.innerHTML = "<i>Silakan ketik untuk mencari nomor...</i>";
    return;
  }

  const hasil = semuaData.filter(nomor => nomor.toLowerCase().includes(input));

  if (hasil.length > 0) {
    hasilDiv.innerHTML = hasil.map(n => `<div>${n}</div>`).join('');
  } else {
    hasilDiv.innerHTML = "<b>Nomor tidak terdaftar di database.</b>";
  }
}

function toggleUserData() {
  const container = document.getElementById("userDataContainer");
  if (container.style.display === "none") {
    container.style.display = "block";
  } else {
    container.style.display = "none";
  }
}

// Tampilkan loader saat awal buka halaman
window.addEventListener("load", () => {
  setTimeout(() => {
    document.getElementById("loader").style.display = "none";
  }, 1000); // animasi minimal 1 detik
});

// Tampilkan loader saat masuk ke halaman admin
function showAdminPanel() {
  document.getElementById("loader").style.display = "flex";
  setTimeout(() => {
    document.getElementById("loader").style.display = "none";
    document.getElementById("loginSection").style.display = "none";
    document.getElementById("adminPanel").style.display = "block";
    renderAdminData(); // misalnya fungsi render data admin
  }, 1000);
}

 const loaderText = document.getElementById('loader-text');
  setTimeout(() => {
    loaderText.textContent = '𝑹𝑬𝑨𝑫𝒀 !';
  }, 2000);
  setTimeout(() => {
    document.getElementById('loader-container').style.display = 'none';
    document.getElementById('main-app').style.display = 'block';
  }, 3000);
  
  const snowCanvas = document.getElementById('snow');
  const snowCtx = snowCanvas.getContext('2d');
  snowCanvas.width = window.innerWidth;
  snowCanvas.height = window.innerHeight;

  const snowflakes = Array.from({ length: 100 }, () => ({
    x: Math.random() * snowCanvas.width,
    y: Math.random() * snowCanvas.height,
    radius: Math.random() * 3 + 1,
    speedY: Math.random() * 1 + 0.5
  }));

  function drawSnowflakes() {
    snowCtx.clearRect(0, 0, snowCanvas.width, snowCanvas.height);
    snowCtx.fillStyle = 'white';
    snowCtx.beginPath();
    for (const flake of snowflakes) {
      snowCtx.moveTo(flake.x, flake.y);
      snowCtx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
    }
    snowCtx.fill();
    updateSnowflakes();
  }

  function updateSnowflakes() {
    for (const flake of snowflakes) {
      flake.y += flake.speedY;
      if (flake.y > snowCanvas.height) {
        flake.y = 0;
        flake.x = Math.random() * snowCanvas.width;
      }
    }
  }

  function animateSnow() {
    drawSnowflakes();
    requestAnimationFrame(animateSnow);
  }

  animateSnow();

  window.addEventListener('resize', () => {
    snowCanvas.width = window.innerWidth;
    snowCanvas.height = window.innerHeight;
  });
  
  const canvas = document.getElementById("particles");
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const particles = [];
  for (let i = 0; i < 80; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2 + 1,
      color: `hsl(${Math.random() * 360}, 100%, 60%)`,
      speedX: Math.random() * 0.5 - 0.25,
      speedY: Math.random() * 0.5 - 0.25,
    });
  }
  function drawParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      p.x += p.speedX;
      p.y += p.speedY;
      if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
      if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;
    });
    requestAnimationFrame(drawParticles);
  }
  drawParticles();
     

updateBlacklistArea(); // tambahkan ini
updateOutputList();
updateSelectOptions();
tampilkanDataUserSendiri();
ambilData();
