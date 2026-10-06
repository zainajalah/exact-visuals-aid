import backsound from "@/assets/backsound.mp3.asset.json";
import fotoRandom from "@/assets/foto-random.jpg.asset.json";
import foto2 from "@/assets/foto-2.jpg.asset.json";
import foto3 from "@/assets/foto-3.jpg.asset.json";
import foto4 from "@/assets/foto-4.jpg.asset.json";
import foto5 from "@/assets/foto-5.jpg.asset.json";

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
  photos: [fotoRandom.url, foto2.url, foto3.url, foto4.url, foto5.url],

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
  content: "Selamat ulang tahun, Ericha.\n\nNggak terasa ya, sudah sampai di hari ulang tahun kamu lagi. Aku sebenarnya agak bingung mau mulai dari mana, karena kalau mengingat semua hal yang pernah kita lewati, rasanya ada terlalu banyak hal kecil yang ternyata masih aku ingat sampai sekarang.\n\nDari awal cuma main bareng, ngobrol random, main MM2, TDS, game horror, sampai akhirnya bisa VC lama banget dan bahkan ketiduran sambil tetap nyambung. Entah kenapa hal-hal sesederhana itu justru jadi beberapa bagian yang paling berkesan buatku. Bahkan rekor VC kita yang sampai selama itu masih jadi salah satu hal yang kalau diingat bikin ngakak.\n\nMungkin waktu itu kita nggak pernah benar-benar mikirin kalau obrolan atau waktu yang kita habiskan bareng bakal jadi sesuatu yang berkesan. Tapi ternyata iya. Ada banyak momen yang kelihatannya biasa saja saat dijalani, tapi setelah waktu berlalu malah jadi sesuatu yang cukup berarti.\n\nJyujyur...\n\nDi umur kamu yang baru ini, semoga banyak hal baik datang ke kamu. Semoga kuliah, kehidupan, orang-orang di sekitar kamu, dan semua hal yang sedang kamu perjuangkan bisa berjalan semakin baik. Kalau ada hari yang berat, semoga kamu selalu punya alasan untuk tetap melangkah dan menemukan sesuatu yang bisa bikin kamu tersenyum lagi.\n\nDan semoga suatu hari nanti, ketika kita sama-sama sudah jauh lebih sibuk dengan kehidupan masing-masing, kita masih bisa mengingat masa-masa ini sebagai salah satu bagian kecil yang pernah membuat hidup terasa menyenangkan.\n\nSelamat ulang tahun sekali lagi, Ericha.\n\nSemoga tahun ini menjadi salah satu tahun terbaik buat kamu. Jaga diri baik-baik, jangan terlalu keras sama diri sendiri, dan semoga semua hal yang kamu harapkan pelan-pelan bisa sampai ke kamu.\n\nDamn, singkat saja u udah tua. Ingat umur ya.\n\nTerima kasih sudah pernah menjadi bagian dari banyak cerita yang sampai sekarang masih aku ingat.",
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
