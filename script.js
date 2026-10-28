const STORAGE_BOOKS = "bookloop-books-v1";
const STORAGE_SAVED = "bookloop-saved-v1";
const STORAGE_REQUESTS = "bookloop-requests-v1";

const seedBooks = [
  {id:"seed-1",title:"Atomic Habits",author:"James Clear",category:"พัฒนาตัวเอง",condition:"ดีมาก",mode:"sale",price:120,description:"หนังสือสภาพดี อ่านจบแล้ว ไม่มีหน้าขาด เหมาะกับคนอยากเริ่มสร้างนิสัยใหม่",palette:0,createdAt:1},
  {id:"seed-2",title:"The Little Prince",author:"Antoine de Saint-Exupéry",category:"นิยาย",condition:"ดี",mode:"swap",price:0,description:"เล่มโปรดที่อยากแลกกับนิยายหรือหนังสืออ่านเล่นเล่มอื่น",palette:1,createdAt:2},
  {id:"seed-3",title:"ความสุขของกะทิ",author:"งามพรรณ เวชชาชีวะ",category:"นิยาย",condition:"ดีมาก",mode:"free",price:0,description:"อยากส่งต่อให้คนที่อยากอ่านเรื่องอบอุ่นหัวใจ",palette:2,createdAt:3},
  {id:"seed-4",title:"The Psychology of Money",author:"Morgan Housel",category:"ธุรกิจ",condition:"ดี",mode:"sale",price:150,description:"มีรอยใช้งานเล็กน้อย อ่านได้ครบทุกหน้า",palette:3,createdAt:4},
  {id:"seed-5",title:"โลกของมด",author:"เบญจมาศ",category:"การเรียน",condition:"ดี",mode:"free",price:0,description:"หนังสืออ่านเสริม เหมาะกับคนชอบเรียนรู้เรื่องธรรมชาติ",palette:4,createdAt:5},
  {id:"seed-6",title:"Steal Like an Artist",author:"Austin Kleon",category:"ศิลปะ",condition:"ดีมาก",mode:"swap",price:0,description:"อยากแลกกับหนังสือวาดรูปหรือออกแบบ",palette:5,createdAt:6},
  {id:"seed-7",title:"Ikigai",author:"Héctor García",category:"พัฒนาตัวเอง",condition:"ดี",mode:"sale",price:95,description:"หนังสือแนวพัฒนาตัวเอง อ่านง่าย สภาพดี",palette:6,createdAt:7},
  {id:"seed-8",title:"เพราะเป็นวัยรุ่นจึงเจ็บปวด",author:"Kim Ran-do",category:"พัฒนาตัวเอง",condition:"มีร่องรอยการใช้งาน",mode:"free",price:0,description:"มีรอยตรงปกเล็กน้อย แต่ด้านในครบทุกหน้า",palette:7,createdAt:8},
  {id:"seed-9",title:"คิดแบบยิว ทำแบบญี่ปุ่น",author:"Tadashi Ono",category:"ธุรกิจ",condition:"ดีมาก",mode:"sale",price:89,description:"ส่งต่อในราคาน่ารัก หนังสือไม่มีไฮไลต์",palette:0,createdAt:9},
  {id:"seed-10",title:"เพียงชั่วเวลากาแฟยังอุ่น",author:"Toshikazu Kawaguchi",category:"นิยาย",condition:"ดี",mode:"swap",price:0,description:"อยากแลกกับนิยายแปลเรื่องอื่น",palette:1,createdAt:10},
  {id:"seed-11",title:"Design Is Storytelling",author:"Ellen Lupton",category:"ศิลปะ",condition:"ดีมาก",mode:"sale",price:180,description:"เหมาะกับคนเรียนออกแบบและสื่อสารภาพ",palette:2,createdAt:11},
  {id:"seed-12",title:"English Grammar in Use",author:"Raymond Murphy",category:"การเรียน",condition:"ดี",mode:"free",price:0,description:"ส่งต่อให้คนที่กำลังฝึกภาษาอังกฤษ",palette:3,createdAt:12}
];

const modeLabels = {free:"ให้ฟรี",swap:"แลกเปลี่ยน",sale:"ขายมือสอง"};
const modeIcons = {free:"🎁",swap:"🔄",sale:"🪙"};
const palettes = ["palette-0","palette-1","palette-2","palette-3","palette-4","palette-5","palette-6","palette-7"];
let activeFilter = "all";
let toastTimer;

function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    return fallback;
  }
}
function writeStorage(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); }
  catch (error) { showToast("บันทึกไม่ได้ ลองตรวจสอบพื้นที่จัดเก็บของเบราว์เซอร์"); }
}
function getBooks() { return readStorage(STORAGE_BOOKS, seedBooks); }
function setBooks(books) { writeStorage(STORAGE_BOOKS, books); }
function getSaved() { return readStorage(STORAGE_SAVED, []); }
function setSaved(ids) { writeStorage(STORAGE_SAVED, ids); }
function getRequests() { return readStorage(STORAGE_REQUESTS, []); }

const grid = document.getElementById("bookGrid");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const addModal = document.getElementById("addModal");
const detailModal = document.getElementById("detailModal");
const bookForm = document.getElementById("bookForm");

function escapeHTML(value="") {
  return String(value).replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
}
function safeImageUrl(value) {
  try {
    const url = new URL(value);
    return ["http:","https:"].includes(url.protocol) ? url.href : "";
  } catch { return ""; }
}
const REAL_BOOK_COVERS = {
  "Atomic Habits": "9780735211292",
  "The Little Prince": "9780156012195",
  "The Psychology of Money": "9780857197689",
  "Steal Like an Artist": "9780761169253",
  "Ikigai": "9781786330895",
  "Design Is Storytelling": "9781648960035",
  "English Grammar in Use": "9781108457651",
  "เพราะเป็นวัยรุ่นจึงเจ็บปวด": "9786162871701",
  "ความสุขของกะทิ": "9789740201315"
};

function coverHTML(book, extraClass="") {
  const isbn = REAL_BOOK_COVERS[book.title];
  const coverFromCatalog = isbn ? `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg` : "";
  const image = safeImageUrl(book.image || coverFromCatalog);
  if (image) return `<div class="cover-wrap ${extraClass}"><img src="${escapeHTML(image)}" alt="ปกหนังสือ ${escapeHTML(book.title)}" loading="lazy" onerror="this.remove();this.parentElement.insertAdjacentHTML('afterbegin','<div class=&quot;cover-placeholder ${palettes[Number(book.palette)||0]}&quot;><span class=&quot;cover-title&quot;>${escapeHTML(book.title)}</span><span class=&quot;cover-author&quot;>${escapeHTML(book.author || 'BOOKLOOP EDITION')}</span></div>')"><span class="cover-label">${modeIcons[book.mode]} ${modeLabels[book.mode]}</span></div>`;
  const palette = palettes[Math.abs(Number(book.palette) || 0) % palettes.length];
  return `<div class="cover-wrap ${extraClass}"><div class="cover-placeholder ${palette}"><span class="cover-mark">✳</span><span class="cover-title">${escapeHTML(book.title)}</span><span class="cover-author">${escapeHTML(book.author || "BOOKLOOP EDITION")}</span></div><span class="cover-label">${modeIcons[book.mode]} ${modeLabels[book.mode]}</span></div>`;
}
function priceText(book) {
  if (book.mode === "free") return "FREE · ให้ฟรี";
  if (book.mode === "swap") return "แลกเปลี่ยน";
  return `฿${Number(book.price || 0).toLocaleString("th-TH")}`;
}
function renderBooks() {
  const books = getBooks();
  const saved = getSaved();
  const query = searchInput.value.trim().toLocaleLowerCase("th");
  const category = categoryFilter.value;
  let filtered = books.filter(book => {
    const haystack = `${book.title} ${book.author || ""} ${book.category || ""} ${book.description || ""}`.toLocaleLowerCase("th");
    const matchesSearch = !query || haystack.includes(query);
    const matchesCategory = category === "all" || book.category === category;
    const matchesMode = activeFilter === "all" || (activeFilter === "saved" ? saved.includes(book.id) : book.mode === activeFilter);
    return matchesSearch && matchesCategory && matchesMode;
  });
  if (activeFilter === "all" && !query && category === "all") {
    filtered = filtered.sort((a,b) => Number(a.createdAt || 0) - Number(b.createdAt || 0));
  }
  grid.innerHTML = filtered.map(book => {
    const savedBook = saved.includes(book.id);
    const priceClass = book.mode === "free" ? "free" : book.mode === "swap" ? "swap" : "";
    const isUserBook = !String(book.id).startsWith("seed-");
    return `<article class="book-card" data-id="${escapeHTML(book.id)}" tabindex="0" role="button" aria-label="ดูรายละเอียด ${escapeHTML(book.title)}">
      ${coverHTML(book)}
      <button class="save-btn ${savedBook ? "saved" : ""}" data-save="${escapeHTML(book.id)}" aria-label="${savedBook ? "นำออกจากรายการโปรด" : "บันทึกรายการโปรด"}" title="บันทึกไว้">${savedBook ? "♥" : "♡"}</button>
      <div class="card-info"><div class="card-category">${escapeHTML(book.category || "อื่น ๆ")}</div><div class="card-title" title="${escapeHTML(book.title)}">${escapeHTML(book.title)}</div><div class="card-author">${escapeHTML(book.author || "ไม่ระบุผู้เขียน")}</div>
      <div class="card-bottom"><span class="price-tag ${priceClass}">${escapeHTML(priceText(book))}</span><span class="condition-tag">${escapeHTML(book.condition || "ดี")}</span></div>
      <button class="card-cta" data-detail="${escapeHTML(book.id)}">${isUserBook ? "ดูประกาศของฉัน ↗" : "ดูรายละเอียด ↗"}</button></div></article>`;
  }).join("");
  document.getElementById("emptyState").classList.toggle("hidden", filtered.length > 0);
  document.getElementById("resultsCount").textContent = `${filtered.length} รายการ`;
  document.getElementById("countAll").textContent = books.length;
  document.getElementById("heroBookCount").textContent = `${books.length}+`;
  document.getElementById("statBooks").textContent = books.length;
  document.getElementById("statLoops").textContent = 4 + getRequests().filter(r => r.status === "completed").length;
  document.getElementById("statSaved").textContent = saved.length;
  document.getElementById("savedCount").textContent = saved.length;
  document.getElementById("resultsLabel").textContent = activeFilter === "saved" ? "หนังสือที่บันทึกไว้" : activeFilter === "all" ? "หนังสือที่น่าจะชอบ" : `หนังสือประเภท${modeLabels[activeFilter] || ""}`;
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2800);
}
function openModal(modal) {
  modal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
  const focusable = modal.querySelector("input,button,select,textarea");
  if (focusable) setTimeout(() => focusable.focus(), 50);
}
function closeModal(modal) {
  modal.classList.add("hidden");
  document.body.style.overflow = "";
}
function openAddModal() {
  bookForm.reset();
  document.getElementById("priceLabel").classList.add("hidden");
  openModal(addModal);
}
function getBook(id) { return getBooks().find(book => book.id === id); }
function showDetails(id) {
  const book = getBook(id);
  if (!book) return;
  const isMine = !String(book.id).startsWith("seed-");
  const image = safeImageUrl(book.image || "");
  const palette = palettes[Math.abs(Number(book.palette) || 0) % palettes.length];
  const cover = image
    ? `<div class="detail-cover"><img src="${escapeHTML(image)}" alt="ปก ${escapeHTML(book.title)}"></div>`
    : `<div class="detail-cover"><div class="cover-placeholder ${palette}"><span class="cover-title">${escapeHTML(book.title)}</span><span class="cover-author">${escapeHTML(book.author || "BOOKLOOP EDITION")}</span></div></div>`;
  document.getElementById("detailContent").innerHTML = `<div class="detail-layout">${cover}<div><div class="card-category">${escapeHTML(book.category || "อื่น ๆ")}</div><h2 id="detailTitle">${escapeHTML(book.title)}</h2><div class="detail-author">โดย ${escapeHTML(book.author || "ไม่ระบุผู้เขียน")}</div><div class="detail-price">${escapeHTML(priceText(book))}</div><div class="detail-meta"><span>สภาพ: ${escapeHTML(book.condition || "ดี")}</span><span>${escapeHTML(modeLabels[book.mode])}</span></div><p class="detail-description">${escapeHTML(book.description || "ไม่มีรายละเอียดเพิ่มเติม")}</p>${isMine ? `<button class="btn btn-light" data-delete="${escapeHTML(book.id)}">ลบประกาศนี้</button>` : `<button class="btn btn-dark" id="requestBook" data-request="${escapeHTML(book.id)}">${book.mode === "free" ? "ขอรับหนังสือเล่มนี้" : book.mode === "swap" ? "ส่งคำขอแลกเปลี่ยน" : "สนใจซื้อหนังสือ"} <span>↗</span></button>`}<p class="form-footnote">* ต้นแบบนี้เป็นการจำลองคำขอ ยังไม่มีการส่งข้อความหาผู้ลงประกาศจริง</p></div></div>`;
  openModal(detailModal);
}
function toggleSaved(id) {
  let saved = getSaved();
  if (saved.includes(id)) {
    saved = saved.filter(item => item !== id);
    showToast("นำออกจากรายการโปรดแล้ว");
  } else {
    saved.push(id);
    showToast("บันทึกหนังสือไว้แล้ว ♡");
  }
  setSaved(saved);
  renderBooks();
}
function setFilter(filter) {
  activeFilter = filter;
  document.querySelectorAll(".filter-tab").forEach(button => button.classList.toggle("active", button.dataset.filter === filter));
  renderBooks();
}
function requestBook(id) {
  const book = getBook(id);
  if (!book) return;
  const requests = getRequests();
  if (requests.some(item => item.bookId === id && item.status === "pending")) {
    showToast("คุณส่งคำขอเล่มนี้ไปแล้วในต้นแบบนี้");
    return;
  }
  requests.push({id:`req-${Date.now()}`,bookId:id,title:book.title,mode:book.mode,status:"pending",createdAt:new Date().toISOString()});
  writeStorage(STORAGE_REQUESTS, requests);
  closeModal(detailModal);
  renderBooks();
  showToast("ส่งคำขอจำลองแล้ว! อย่าลืมนัดรับอย่างปลอดภัย 💌");
}

document.querySelectorAll("#openAddTop,#openAddHero,#openAddHow,#emptyAdd").forEach(button => button.addEventListener("click", openAddModal));
document.getElementById("closeAdd").addEventListener("click", () => closeModal(addModal));
document.getElementById("closeDetail").addEventListener("click", () => closeModal(detailModal));
[addModal, detailModal].forEach(modal => {
  modal.addEventListener("click", event => { if (event.target === modal) closeModal(modal); });
});
document.addEventListener("keydown", event => {
  if (event.key === "Escape") { closeModal(addModal); closeModal(detailModal); }
});
document.getElementById("savedShortcut").addEventListener("click", () => { setFilter("saved"); document.getElementById("explore").scrollIntoView({behavior:"smooth"}); });
document.getElementById("showAll").addEventListener("click", () => { searchInput.value = ""; categoryFilter.value = "all"; setFilter("all"); });
searchInput.addEventListener("input", renderBooks);
categoryFilter.addEventListener("change", renderBooks);
document.querySelectorAll(".filter-tab").forEach(button => button.addEventListener("click", () => setFilter(button.dataset.filter)));

document.querySelector('input[name="mode"][value="sale"]').addEventListener("change", () => document.getElementById("priceLabel").classList.remove("hidden"));
document.querySelectorAll('input[name="mode"]').forEach(input => input.addEventListener("change", () => {
  document.getElementById("priceLabel").classList.toggle("hidden", bookForm.elements.mode.value !== "sale");
}));

bookForm.addEventListener("submit", event => {
  event.preventDefault();
  const form = new FormData(bookForm);
  const mode = form.get("mode");
  const title = String(form.get("title") || "").trim();
  const price = Number(form.get("price") || 0);
  if (!title) { showToast("ใส่ชื่อหนังสือก่อนน้า"); return; }
  if (mode === "sale" && (!price || price < 1)) { showToast("ใส่ราคาขายอย่างน้อย 1 บาท"); bookForm.elements.price.focus(); return; }
  const books = getBooks();
  const book = {
    id:`user-${Date.now()}`, title, author:String(form.get("author") || "").trim(),
    category:String(form.get("category") || "อื่น ๆ"), condition:String(form.get("condition") || "ดี"),
    mode, price:mode === "sale" ? price : 0, image:safeImageUrl(String(form.get("image") || "")),
    description:String(form.get("description") || "").trim(), palette:Math.floor(Math.random()*palettes.length),
    createdAt:Date.now()
  };
  books.unshift(book);
  setBooks(books);
  closeModal(addModal);
  searchInput.value = "";
  categoryFilter.value = "all";
  setFilter("all");
  showToast("ลงประกาศสำเร็จ! หนังสือพร้อมเริ่มบทใหม่แล้ว 📚");
  document.getElementById("explore").scrollIntoView({behavior:"smooth"});
});

grid.addEventListener("click", event => {
  const saveButton = event.target.closest("[data-save]");
  if (saveButton) { event.stopPropagation(); toggleSaved(saveButton.dataset.save); return; }
  const detailButton = event.target.closest("[data-detail]");
  if (detailButton) { event.stopPropagation(); showDetails(detailButton.dataset.detail); return; }
  const card = event.target.closest(".book-card");
  if (card) showDetails(card.dataset.id);
});
grid.addEventListener("keydown", event => {
  if ((event.key === "Enter" || event.key === " ") && event.target.classList.contains("book-card")) {
    event.preventDefault(); showDetails(event.target.dataset.id);
  }
});
document.getElementById("detailContent").addEventListener("click", event => {
  const requestButton = event.target.closest("[data-request]");
  if (requestButton) { requestBook(requestButton.dataset.request); return; }
  const deleteButton = event.target.closest("[data-delete]");
  if (deleteButton) {
    const id = deleteButton.dataset.delete;
    if (!confirm("ต้องการลบประกาศหนังสือเล่มนี้ใช่ไหม?")) return;
    setBooks(getBooks().filter(book => book.id !== id));
    setSaved(getSaved().filter(savedId => savedId !== id));
    closeModal(detailModal);
    renderBooks();
    showToast("ลบประกาศแล้ว");
  }
});

if (!localStorage.getItem(STORAGE_BOOKS)) setBooks(seedBooks);
renderBooks();
