import backsound from "@/assets/backsound.mp3.asset.json";

// ==========================
// EDIT SEMUA ISI WEBSITE DI FILE INI
// ==========================

export const CONFIG = {
  name: "Ericha",
  birthdayAge: 20,

  // ==========================
  // EDIT FOTO
  // Ganti dengan link foto (https://...) atau taruh file di folder public/
  // lalu tulis "/foto1.jpg". Kosongkan untuk memakai placeholder.
  // ==========================
  photos: ["", "", "", "", ""],

  captions: [
    "game random",
    "obrolan yang kepanjangan",
    "hal kecil yang masih keinget",
    "another random moment",
    "one of those days",
  ],

  // ==========================
  // EDIT AUDIO
  // Isi dengan link/lokasi musik, mis. "/music.mp3".
  // Kalau kosong, website memakai musik ambient sintetis (tetap jalan).
  // ==========================
  music: backsound.url,
  musicVolume: 0.2,
};

// ==========================
// EDIT OPENING
// ==========================
export const OPENING_TEXT = {
  age: "20",
  name: "Ericha",
  greeting: "Selamat ulang tahun.",
  button: "Mulai perjalanan",
  loading: "Preparing a little universe...",
};

// ==========================
// EDIT GALLERY
// ==========================
export const GALLERY_TEXT = {
  title: "Beberapa potongan cerita",
  subtitle: "Hal-hal sederhana yang ternyata masih keinget.",
  button: "Masih ada satu hal lagi...",
};

// ==========================
// EDIT LETTER
// ==========================
export const LETTER_TEXT = {
  lockedTitle: "Surat ini belum bisa dibuka.",
  lockedHint:
    "Entah kenapa, sepertinya kamu harus menemukan bagian-bagiannya dulu.",
  startButton: "Mulai mencari",
  assembled: "Suratnya sudah lengkap.",

  // Tulis surat kamu di sini. Setiap baris kosong = paragraf baru.
  content: `Ericha,

Selamat ulang tahun yang ke-20.

Selamat ulang tahun. Semoga hari ini setenang yang kamu mau.

Makasih untuk semua cerita yang udah kita lewatin. Yang lucu, yang random, yang biasa aja tapi ternyata paling diinget.

Semoga di umur 20 ini kamu nggak buru-buru sama diri sendiri. Pelan-pelan aja, kamu udah cukup.

Sampai jumpa di cerita berikutnya.`,
};

// ==========================
// EDIT ENDING
// ==========================
export const ENDING_TEXT = [
  "20.",
  "Semoga tahun ini jadi tahun yang baik buat kamu.",
  "Dan semoga masih ada banyak cerita yang belum kita buat.",
  "See you in the next chapter.",
];

// ==========================
// EDIT PESAN RAHASIA (opsional, tidak wajib ditemukan)
// ==========================
export const SECRET_TEXT = {
  openingStar: ["Found something?", "Maybe there are still a few things hidden here."],
  constellation: "Some memories deserve their own constellation.",
  secretPlanet: "You weren't supposed to find this.",
  finalStar: ["Oh, you're still here.", "Okay... one last thing."],
  finalMessage: "Terima kasih sudah sampai sejauh ini, Ericha.",
  // muncul kalau semua pecahan kosmik terkumpul
  allFragments: "Kamu menemukan semua pecahannya. Ternyata kamu memang teliti.",
};
