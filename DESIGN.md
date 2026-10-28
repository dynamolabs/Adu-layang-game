# Adu Layang — spesifikasi desain v1 (game ketiga Studio Aigame)

Dibuat 2026-10-27. Creative director: dinamo. Dasar: pitch Divisi Desain di `../game2/PITCH.md`.
Target: HP dulu (layar tegak, satu jari), tetap bisa dimainkan di laptop. Teknologi sama seperti Langit Merah:
Phaser 3.60 dari cdnjs, semua gambar digambar oleh kode, suara Web Audio, satu file `index.html`.

## Satu kalimat
Terbangkan layangan merah putih dari atap rumah di langit sore, hindari kabel listrik dan burung, lalu adu benang
dengan layangan tetangga sampai benang mereka putus.

## Kontrol (satu jari)
- **Tahan layar = tarik benang.** Layangan naik, dan bergerak ke arah posisi jari (kiri/kanan).
- **Lepas = benang kendur.** Layangan turun pelan dan terbawa angin.
- Laptop: tahan spasi atau klik mouse = tarik; panah kiri/kanan atau posisi mouse = arah.
- *Perubahan dari pitch:* pitch hanya memakai "tahan/lepas" sehingga arah kiri/kanan sepenuhnya ditentukan angin.
  Dalam uji rasa itu membuat adu benang terasa untung-untungan, jadi posisi jari ikut mengarahkan.
  Tetap satu jari, tanpa tombol tambahan.

## Fisika (nilai awal)
| Nilai | Angka |
|---|---|
| Ukuran layar logika | 450 × 800, skala FIT |
| Gaya naik saat tarik | 520 px/dtk² ke atas |
| Gaya turun saat kendur | 150 px/dtk² ke bawah |
| Kecepatan maksimum | 300 px/dtk |
| Kemudi ke arah jari | 6 × selisih jarak, maks 380 px/dtk² |
| Hanyut angin saat kendur | kecepatan mendekati angin dengan faktor 1,6/dtk |
| Hanyut angin saat tarik | 35% dari angin |
| Panjang benang maksimum | 720 px dari gulungan |
- Benang digambar sebagai kurva yang melendut; makin kendur makin melendut dan terdorong angin.
- Angin berganti tiap 10–15 detik, antara −95 dan +95 px/dtk. Ditandai panah di atas layar dan daun yang terbang.
  Di atas 70: tulisan "ANGIN KENCANG!" dan layangan sedikit bergoyang acak.

## Bahaya (kena = benang putus = game selesai)
- **Kabel listrik** melintang di bawah (y ≈ 625). Layangan menyentuh kabel = putus.
- **Burung** terbang menyeberang layar mulai detik 12. Tanda panah kuning di tepi layar 1,2 detik sebelum muncul.
  Jeda antar burung: 7 dtk di awal, turun sampai 3 dtk. Setelah detik 60 bisa datang berdua atau bertiga.

## Adu benang
- Layangan lawan diterbangkan dari atap tetangga di pojok kiri atau kanan bawah. Benang mereka terlihat.
- **Benang bersilang** = bergesekan. Muncul percikan dan bunyi "srettt".
- Siapa yang menang gesekan dihitung tiap saat:
  - Kekuatanmu = 1,0 kalau sedang tarik (0,25 kalau kendur) + 0,6 kalau layanganmu lebih tinggi dari lawan.
  - Kekuatan lawan = (1,0 kalau dia tarik, 0,25 kalau tidak) × kekuatan jenis + 0,6 kalau dia lebih tinggi.
  - Yang kalah kehilangan "nyawa benang" 1,7 per detik. Nyawa benang penuh = 1. Jadi gesekan ±0,6 detik memutus benang.
- Nyawa benangmu terlihat di bar "BENANG" dan pulih 0,12 per detik saat tidak bergesekan. Habis = game selesai.
- Benang lawan putus: layangannya melayang jatuh terbawa angin sambil berputar, tulisan "PUTUS!".

| Jenis lawan | Warna | Kecepatan | Peluang tarik | Kekuatan | Muncul |
|---|---|---|---|---|---|
| Pelan | biru-kuning | 70 | 25% | 0,9 | dari detik 6 |
| Cepat | hijau | 125 | 40% | 1,0 | dari detik 35 |
| Jagoan | hitam-emas | 105 | 85% saat bergesekan | 1,15 | dari detik 70, mengejar benangmu |
- Jumlah lawan sekaligus: 1 (sebelum detik 40), 2 (sampai detik 90), lalu 3.

## Skor
- +1 tiap detik di udara.
- +100 tiap benang lawan yang diputus, dikali beruntun (memutus lagi dalam 8 detik: ×2, ×3, maks ×5).
- Tiga putusan beruntun: bonus +300 dan tulisan "BORONG!".
- Skor terbaik disimpan di browser.

## Layar
- Menu: judul, layangan terbang di latar, cara main 2 baris, tombol MAIN, skor terbaik, tombol bisu.
- HUD: skor (kiri atas), bar BENANG, panah angin (tengah atas), tombol bisu + jeda (kanan atas).
- Game over: "BENANGMU PUTUS!" + sebabnya (kabel / burung / kalah adu), skor, skor terbaik, jumlah lawan diputus, tombol MAIN LAGI.
- Jeda otomatis saat tab disembunyikan.

## Suara (Web Audio, tanpa file)
Desau angin pelan yang mengikuti kekuatan angin, "srettt" saat bergesekan, bunyi putus + nada naik saat menang,
cicit burung, nada turun saat game selesai. Tombol bisu, statusnya diingat.

## Sengaja belum ada di v1
Pilihan warna layangan, dua pemain, level, musik latar, pohon.

## Cek QA v1
- [ ] Tidak ada error di konsol selama 3 menit bot bermain.
- [ ] Bot bisa memutus benang lawan (aturan adu bekerja).
- [ ] Kabel, burung, dan kalah adu masing-masing bisa mengakhiri game.
- [ ] Layar tegak HP (Pixel 7) pas, tombol mudah disentuh.
- [ ] FPS stabil (median ≥ 55 di laptop headless).

---

## v1.1 — pematangan (2026-10-27, permintaan dinamo: "solid-in dulu sebelum rilis")
- **Layar penuh di HP**: tinggi layar logika ikut bentuk layar (800–980), semua yang menempel di tanah digeser. Tidak ada pita hitam.
- **Art**: layangan 4 warna dengan rangka bambu dan busur, kilap dan bayangan; awan hanyut mengikuti angin; layangan hiasan jauh di latar;
  gunung, masjid, antena TV, isolator di tiang listrik; burung berparuh dan bersayap; percikan listrik saat kena kabel, bulu saat ditabrak burung.
- **Musik**: loop pentatonik ala gamelan (bonang, bas, gong) dengan Web Audio; berhenti saat jeda dan game selesai. SFX baru: setrum kabel, tabrakan burung, bunyi bahaya, pengumuman lawan baru. Getar HP (Android) saat memutus dan kalah.
- **Penyetelan**: nyawa benang per jenis lawan (Pelan 1, Cepat 1,25, Jagoan 1,6) dengan bar kecil di atas layangan lawan; benang lawan pulih 0,1/dtk;
  beruntun maksimal ×3; angin maksimal 55 → 80 → 95 seiring waktu; Cepat kabur saat kalah dan sesekali memburu setelah detik 60.
- **Pemula**: petunjuk "LAYANGAN LAWAN!" saat lawan pertama (sampai pertama kali memutus), papan "LAWAN BARU" untuk Cepat dan Jagoan, tepi layar merah berkedip saat benangmu kalah adu.
- **Layar**: menu dengan kartu cara main; game over dengan waktu di udara, jumlah lawan diputus, beruntun terbaik, dan tips sesuai sebab kalah.
- QA: `qa/adu-layang/test.js` 11/11 lulus, termasuk cek layar penuh di Pixel 7.

---

## v1.2 — arah seni "Sore di kampung" (2026-10-27, dinamo: "jangan seperti AI slop")
1. Satu dunia: jam lima sore di atap kampung, dibuat seperti **kertas minyak yang dipotong tangan**. Semua bidang datar, tanpa gradasi, kilau, atau bayangan lembut.
2. Palet 6 warna saja: tinta teal `#1F4E5A`, kertas `#F3E3C3`, langit pudar `#9CC3C9`, langit muda `#C9DCD2`, jingga `#E8803A`, merah bata `#B5442C`.
3. Garis tinta satu ketebalan (2 px) untuk semua benda; sudut bentuk sedikit miring tak rata seperti guntingan, tetap diam (tidak bergetar).
4. Layangan aduan wajik **tanpa ekor**, rangka bambu tipis. Punyamu bata-kertas; lawan jingga, teal, dan hitam-jingga untuk si jago.
5. Benangmu **gelasan merah bata**; benang lawan tinta tipis. Kalau benangmu aus, warnanya memudar, bukan bar merah berkedip.
6. Angin ditunjukkan di dunia: **umbul-umbul di bambu atap** berkibar ke arah angin, panjang kibarannya = kekuatannya. Tidak ada panah HUD.
7. Hemat: tidak ada papan pengumuman, tips, kilatan kamera, teks berseru, atau hujan partikel. Satu petunjuk pelan saat mulai, selebihnya belajar sambil main.
8. Kata di layar sedikit dan bahasa sehari-hari, huruf kecil: "tahan untuk menarik", "putus.", "main lagi", "rekor".
9. Judul pakai logotype Shrikhand (gaya cat papan warung) berlapis seperti potongan kertas, dengan layangan dan benang ikut jadi bagian logonya; teks lain Karla.
10. Suara jarang dan bermakna: desau angin, "srek" gulungan saat mulai menarik, gesekan gelasan, nada bonang saat memutus atau saat angin berganti. Tidak ada musik loop.

## v1.4 — tarik-ulur (2026-10-28, dinamo: "kalau ku hold terus udah menang")
- Masalah: menahan terus membuat layangan naik ke atas dan selalu lebih tinggi + selalu "menarik", jadi selalu menang adu.
- Tarikan sekarang **sentakan**: gaya naik 900 yang meluruh cepat (faktor 2,6/dtk) + tarikan tetap kecil 60. Menahan lebih dari 0,9 dtk menggulung benang:
  layangan ditarik ke arah gulungan (ke bawah, ke kabel) sampai 150 px/dtk.
- Kekuatan adu = kesegaran sentakan (turun cepat setelah 0,5 dtk menahan, minimal 0,25) + 0,45 kalau lebih tinggi + 0,3 kalau layangan sedang bergerak cepat (menyambar).
- Lawan memburu pemain yang diam lebih dari 2 detik (setelah detik 15).
- QA: bot "tahan diam" kalah 3 dari 3 (12–40 dtk); bot yang tarik-ulur tetap bisa memutus (8 putus dalam 63 dtk).
