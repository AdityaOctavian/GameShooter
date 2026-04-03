# Shooter Game

Game tembak-tembakan berbasis web yang dibuat menggunakan HTML, CSS, dan JavaScript(UNTUK TUGAS LKS).

## Fitur

- Pilih username, level kesulitan, senjata, dan target sebelum bermain
- 3 tingkat kesulitan: Easy (30 detik), Medium (20 detik), Hard (15 detik)
- 2 pilihan senjata: Desert Eagle dan USP Tactical
- 3 pilihan target: Bullseye, Dartboard, dan Classic
- Ganti senjata saat bermain dengan tombol Space
- Pause dan resume game dengan tombol Escape
- Efek tembakan (recoil, muzzle flash, ledakan)
- Penalti waktu -5 detik jika meleset
- Leaderboard sidebar saat bermain
- Match history tersimpan di localStorage
- Countdown sebelum game dimulai

## Cara Bermain

1. Masukkan username
2. Pilih level, senjata, dan target
3. Klik Play Game
4. Arahkan crosshair ke target dan klik untuk menembak
5. Setiap hit mendapat +10 poin
6. Setiap miss kena penalti -5 detik
7. Tekan Space untuk ganti senjata
8. Tekan Escape untuk pause
9. Kumpulkan poin sebanyak mungkin sebelum waktu habis

## Teknologi

- HTML
- CSS
- JavaScript
- localStorage untuk menyimpan data

## Struktur File

```
GameShooter/
├── index.html
├── style.css
├── script.js
├── README.md
└── image/
    ├── background.jpg
    ├── shooter.png
    ├── gun1.png
    ├── gun2.png
    ├── target1.png
    ├── target2.png
    ├── target3.png
    ├── boom.png
    └── pointer.png
```

## Cara Menjalankan

Buka file `index.html` di browser atau bisa langsung click ini  https://adityaoctavian.github.io/GameShooter/
