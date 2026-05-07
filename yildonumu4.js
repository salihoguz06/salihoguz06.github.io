
        // --- 1. SYSTEM SETTINGS & DATES ---
        const startDay = new Date("2025-04-26T04:00:00");
        const warsawFlightUnlockDate = new Date("2026-05-15T00:00:00");

        // --- 2. CURSOR TRACKING ---
        const cursor = document.getElementById('custom-cursor');
        document.addEventListener('mousemove', (e) => {
            requestAnimationFrame(() => {
                cursor.style.left = e.clientX + 'px';
                cursor.style.top = e.clientY + 'px';
            });
        });

// --- 3. TYPEWRITER ---
        function initTypewriter(el) {
            const text = el.getAttribute('data-text'); 
            
            // GÜVENLİK KİLİDİ: Eğer elementin içinde henüz yazı yoksa sistemi çökertme, işlemi durdur.
            if (!text) return; 

            el.innerHTML = ''; // İçeriği temizle
            
            // Metni kelimelere bölüyoruz
            const words = text.split(' ');
            let charIndex = 0;

            words.forEach((word, wIdx) => {
                // Her kelimeyi dağılmaması için bir kapsayıcı (span) içine alıyoruz
                const wordSpan = document.createElement('span');
                wordSpan.style.display = 'inline-block';
                wordSpan.style.whiteSpace = 'nowrap'; // Kelimenin ortadan bölünmesini KESİNLİKLE engeller

                // Kelimenin harflerini ekliyoruz
                word.split('').forEach((char) => {
                    const span = document.createElement('span');
                    span.innerText = char;
                    span.className = 'letter';
                    wordSpan.appendChild(span);
                    
                    setTimeout(() => {
                        span.classList.add('visible');
                    }, charIndex * 40); // Hızını 40ms yaptım daha akıcı olsun
                    charIndex++;
                });

                el.appendChild(wordSpan);

                // Son kelime değilse araya boşluk ekliyoruz (Satır atlama sadece bu boşluklardan olacak)
                if (wIdx < words.length - 1) {
                    const spaceSpan = document.createElement('span');
                    spaceSpan.innerHTML = '&nbsp;'; // HTML boşluk kodu
                    spaceSpan.className = 'letter'; 
                    el.appendChild(spaceSpan);
                    
                    setTimeout(() => {
                        spaceSpan.classList.add('visible');
                    }, charIndex * 40);
                    charIndex++;
                }
            });
        }

        // Observer (Kullanıcı aşağı kaydırdıkça sıradaki animasyonları tetikler)
        const obs = new IntersectionObserver((es) => {
            es.forEach(e => { 
                if (e.isIntersecting) { 
                    initTypewriter(e.target); 
                    obs.unobserve(e.target); 
                }
            });
        }, { threshold: 0.4 });

        // Sitedeki tüm soft-typewriter class'lı yazıları dinlemeye al
        document.querySelectorAll('.soft-typewriter').forEach(el => obs.observe(el));

        // --- 4. COUNTER ---
        setInterval(() => {
            const diff = new Date() - startDay;
            document.getElementById("days").innerText = Math.floor(diff / 86400000);
            document.getElementById("hours").innerText = String(Math.floor((diff / 3600000) % 24)).padStart(2, '0');
            document.getElementById("mins").innerText = String(Math.floor((diff / 60000) % 60)).padStart(2, '0');
            document.getElementById("secs").innerText = String(Math.floor((diff / 1000) % 60)).padStart(2, '0');
        }, 1000);

        // --- 5. GALLERY DATA ---
        const galleryData = {
            'lizbon': [
                { img: 'İlk aylar/IMG-20250426-WA0043.jpg', text: 'The day I reborned...' },
                { img: 'İlk aylar/1.2.jpeg', text: 'Life was getting better and better.' },
                { img: 'İlk aylar/kamp.jpeg', text: 'Finally my plan to kidnapp you with bringing you to camp was working so well.' },
                { img: 'İlk aylar/fell_love.jpeg', text: 'But I fell in love so harsh...' },
                { img: 'İlk aylar/dans.jpeg', text: '' },
                { img: 'İlk aylar/kamp2.jpeg', text: '' },
                { img: 'İlk aylar/qfdf.jpeg', text: '' },
                { img: 'İlk aylar/ask.jpeg', text: 'I was obsessed with that cute face.' },
                { img: 'İlk aylar/love.jpeg', text: 'That eyes were cutting my heart to half.' },
                { img: 'İlk aylar/öpucuk.jpeg', text: '❤️' },
                { img: 'İlk aylar/adalar.jpeg', text: 'Please bury me to your neck.' },
                { img: 'İlk aylar/bulgaria.jpeg', text: 'Bulgaria... 💘' }                
            ],
            'polonya': [
                { img: 'polonya/sexy.jpg', text: 'Deciding to come was best decision I made.' },
                { img: 'polonya/cute.jpg', text: 'Cutest pic ever.' },
                { img: 'polonya/princess.jpg', text: 'My little passenger princess.' },
                { img: 'polonya/malborough.jpg', text: 'Its addicting to travel with you.' },
                { img: 'polonya/kiss.jpeg', text: 'To kiss...' },
                { img: 'polonya/kiss2.jpg', text: '❤️' },
                { img: 'polonya/kiss4.jpg', text: 'Kocham Cię' },
                { img: 'polonya/kiss5.jpg', text: '' },
                { img: 'polonya/eat.jpg', text: 'To eat...' },
                { img: 'polonya/sexy2.jpg', text: '' },
                { img: 'polonya/gdansk.jpg', text: 'Gdansk' },
                { img: 'polonya/gzl.jpg', text: '' }
            ],

            'izmir': [
                { img: 'fotolar/deniz2.jpeg', text: 'That touch killed me.' },
                { img: 'fotolar/fur.jpeg', text: 'Mmmm, that white fur.' },
                { img: 'fotolar/kiss.jpg', text: 'More kisses' },
                { img: 'fotolar/kiss2.jpeg', text: '' },
                { img: 'fotolar/kiss3.jpeg', text: 'Kham' },
                { img: 'fotolar/izmir.jpeg', text: 'Ahh that dress 😫.' },
                { img: 'fotolar/sexynight.jpeg', text: 'I remember this sexy night so clear.' },
                { img: 'fotolar/sexy.jpeg', text: 'Masculine man diet: Some underground rock bar in Warsaw, beer and these sexy legs with fishnet.' },
                { img: 'fotolar/halloween.jpeg', text: 'That Halloween ' },
                { img: 'fotolar/west.jpeg', text: 'I fell in love again in westest point of europe.' },
                { img: 'fotolar/poland2.jpeg', text: '' },
                { img: 'fotolar/cutie.jpeg', text: 'Cute girlfriend helps her boyfriend.' },            ]
        };

        let currentAlbum = '';
        let currentIndex = 0;

        function openGallery(album) {

            if (album === 'izmir') {
                const password = prompt("It's locked. Please enter the password.");
                
                if (password === null) return;
                // Şifreyi aşağıya yazabilirsin (Şu an "2604" olarak ayarlı)
                if (password !== "3112") { 
                    alert("Wrong password thief. Only she can know it... 🕵️‍♀️");
                    return; // Şifre yanlışsa işlemi durdur ve galeriyi açma
                }
            }

            currentAlbum = album;
            currentIndex = 0;
            updateModal();
            document.getElementById('galleryModal').classList.add('open');
        }

        function closeGallery() { document.getElementById('galleryModal').classList.remove('open'); }

        function updateModal() {
    const modalImg = document.getElementById('modalImg');
    const modalText = document.getElementById('modalText');
    const data = galleryData[currentAlbum][currentIndex];

    // 1. Önce mevcut fotoğrafı ve yazıyı görünmez yap
    modalImg.style.opacity = '0';
    modalText.style.opacity = '0';

    // 2. Kararma efekti için 300ms bekle, sonra içeriği değiştir
    setTimeout(() => {
        modalImg.src = data.img;
        modalText.innerText = data.text;

        // 3. Yeni fotoğraf yüklenmeye başladığında tekrar görünür yap
        // Bu sayede geçiş "pürüzsüz" olur
        modalImg.onload = () => {
            modalImg.style.opacity = '1';
            modalText.style.opacity = '1';
        };

        // Resim önbellekteyse onload bazen tetiklenmeyebilir, güvenlik için:
        modalImg.style.opacity = '1';
        modalText.style.opacity = '1';
    }, 300);
}

        function nextSlide() { currentIndex = (currentIndex + 1) % galleryData[currentAlbum].length; updateModal(); }
        function prevSlide() { currentIndex = (currentIndex - 1 + galleryData[currentAlbum].length) % galleryData[currentAlbum].length; updateModal(); }

        // --- 6. WARSAW & LOCK CONTROL ---
        function checkWarsawFlight() {
            const now = new Date();
            if (now < warsawFlightUnlockDate) {
                alert("Signal Weak, My Love! 🛸\n\nAccess to May 16th Warsaw flight tracking will open on May 15th. Until then, it stays locked!");
            } else {
                window.open("https://www.google.com/search?q=Warsaw+Flight+Tracking+16+May+2026", "_blank");
            }
        }

        function checkUnlockDate(date, title) {
            const diff = new Date(date) - new Date();
            if(diff <= 0) alert(title + " is now unlocked!");
            else alert("Be patient, my love... \n\n" + title + " will unlock in " + Math.ceil(diff/86400000) + " days. ❤️");
        }

        // --- 8. BALLOONS, SCRATCH & STALK ---
        async function releaseBalloon() {
            const input = document.getElementById('wishInput');
            const wishText = input.value.trim();
            
            if(wishText === "") return; // Boşsa hiçbir şey yapma

            // 1. Önce görsel şöleni başlatalım (Balon uçsun)
            const b = document.createElement('div'); 
            b.className = 'balloon'; 
            b.innerHTML = '❤';
            b.style.left = (Math.random() * 90 + 5) + '%';
            document.body.appendChild(b);
            
            input.value = ""; // Kutuyu temizle
            setTimeout(() => b.remove(), 9000); // 9 saniye sonra balonu sil

            // 2. Dileği e-posta olarak gönder (Arka planda sessizce)
            try {
                await fetch("https://api.web3forms.com/submit", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
                    body: JSON.stringify({
                        access_key: "df634fe3-2117-4a05-8ed7-4304d46bc27d", // Gelen kodu buraya yapıştır
                        subject: "🎈 Sevgilinden Yeni Bir Dilek Var!", // Mailin başlığı
                        message: wishText, // Sevgilinin yazdığı mesaj
                    }),
                });
            } catch (error) {
                console.error("Dilek uçarken bir rüzgara takıldı:", error);
            }
        }

        // --- 9. UÇAN MİNİK KALPLER ---
        function spawnMiniHeart() {
            const heart = document.createElement('div');
            heart.className = 'mini-heart';
            heart.innerHTML = '❤';
            
            // Ekranın sağ-sol ekseninde rastgele bir yerinden çıksın
            heart.style.left = Math.random() * 100 + 'vw';
            
            // Çıkış süresi ve boyutu da her kalp için rastgele olsun ki doğal dursun
            heart.style.animationDuration = (Math.random() * 3 + 5) + 's'; // 5 ile 8 saniye arası
            heart.style.fontSize = (Math.random() * 10 + 10) + 'px'; // 10px ile 20px arası
            
            document.body.appendChild(heart);
            
            // Uçuşu biten kalbi koddan sil (Siteyi kasmasın diye)
            setTimeout(() => heart.remove(), 12000); 
        }
        // Her 800 milisaniyede bir yeni kalp üret
        setInterval(spawnMiniHeart, 800);


        // --- 11. PLAK VE ÇALMA LİSTESİ (HİKAYELİ KUTU) ---
const playlist = [
    { 
        src: "müzik/zeki-muren-simdi-uzaklardasin_Mp3.mp3", // Buraya 1. MP3 linki
        title: "Şimdi Uzaklardasın", 
        meaning: "Symbol of our sadness after I leave istanbul in that cursed july." 
    },
    { 
        src: "müzik/Herbert_Rehbein_and_His_Orchestra_-_My_Way_of_Life_(SkySound.cc).mp3", // Buraya 2. MP3 linki
        title: "You're My Way of Life (Recommended)", 
        meaning: "You became my way of life." 
    },
    { 
        src: "müzik/Duman-Kopru-Alti.mp3", // Buraya 3. MP3 linki
        title: "Köprü Altı - Duman", 
        meaning: "Such a duman classic of our relationship" 
    },
    { 
        src: "müzik/Nilufer-Son-Arzum.mp3", // Buraya 3. MP3 linki
        title: "My Last Wish", 
        meaning: "If they ask me, what my last wish is I hope they'll look into my eyes and understand everything." 
    }
];

        function setTimeGreeting() {
            const hour = new Date().getHours();
            const greetingEl = document.getElementById('time-greeting');
            let message = "";

            if (hour >= 5 && hour < 12) {
                message = "Dzien Dobry my love!";
            } else if (hour >= 12 && hour < 18) {
                message = "I wish you a lovely day Ms. Ola";
            } else if (hour >= 18 && hour < 23) {
                message = "Good evening my beauty.";
            } else {
                message = "Have a good night my only love. You'll sleep like a baby tonight:)";
            }
            greetingEl.setAttribute('data-text', message); // Mesajı animasyon verisine yazar
            initTypewriter(greetingEl); // Diğer yazılardaki gibi daktilo animasyonunu başlatır
        }

        // --- 14. I LOVE YOU BECAUSE GENERATOR ---
        const reasons = [
            "Every minute I spend with you feels like once in life experience.",
            "Since I first saw you, my life changed so much in always positive direction. I feel that as blessing.",
            "I like your way to love me. That is much more important to me then it looks.",
            "I love how clewer you are.",
            "You are not just my lover, but my greatest and favorite travel companion.",
            "You're the mosttt attractive girl I've ever met.",
            "As a person who is stubborn and loves to play with fate, the fact that you're like that too makes me obsessed.",
            "I am in love with those moments when we can be childish together and share the most sincere laughs.",
            "I know you are 'the one' in my lifetime. This much love happens only one time in life."
        ];

        let reasonOrder = [];
        let currentReasonIndex = 0;

        // Sözleri sayfa açıldığında bir kez karıştırıp gizli bir sıraya diziyoruz
        function initReasons() {
            reasonOrder = reasons.map((_, i) => i);
            for (let i = reasonOrder.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [reasonOrder[i], reasonOrder[j]] = [reasonOrder[j], reasonOrder[i]];
            }
        }
        initReasons(); // Sıralamayı hazırla

        function generateReason() {
            const reasonEl = document.getElementById('random-reason');
            
            // Eğer listedeki tüm sözler bittiyse, yeniden karıştırıp baştan başla
            if (currentReasonIndex >= reasonOrder.length) {
                initReasons();
                currentReasonIndex = 0;
            }

            // Sıradaki sözü seç
            const selectedIndex = reasonOrder[currentReasonIndex];
            currentReasonIndex++; // Bir sonraki tıklama için sırayı ilerlet

            reasonEl.style.opacity = 0;
            
            setTimeout(() => {
                reasonEl.innerText = "“" + reasons[selectedIndex] + "”";
                reasonEl.style.opacity = 1;
            }, 400); 
        }

        // --- 15. SCROLL INDICATOR FADE OUT ---
        window.addEventListener('scroll', () => {
            const indicator = document.getElementById('scrollIndicator');
            // Kullanıcı sayfayı 50 pikselden fazla aşağı kaydırırsa oku gizle
            if (window.scrollY > 50) {
                indicator.style.opacity = '0';
            } else {
                indicator.style.opacity = '0.8';
            }
        });
        
        // Fonksiyonu sayfa açılır açılmaz çalıştır
        setTimeGreeting();

        function startStalking() {
            const overlay = document.getElementById('stalk-overlay');
            const radarScreen = document.getElementById('radar-screen');
            const locationResult = document.getElementById('location-result');
            const status = document.getElementById('status-text');

            // 1. Ekranları başlangıç durumuna sıfırla (Kapatıp tekrar açarsa diye)
            radarScreen.style.display = 'block';
            locationResult.style.display = 'none';
            status.innerText = "SCANNING GPS...";
            
            // 2. Arayüzü göster
            overlay.style.display = 'flex';

            // 3. Yazı animasyonları
            const logs = ["CONNECTING TO SATELLITE...", "GPS DATA ANALYSIS...", "TARGET LOCKED!"];
            logs.forEach((log, i) => { 
                setTimeout(() => { 
                    status.innerText = log; 
                }, (i + 1) * 900); 
            });

            // 4. Radar bittikten sonra sonuç ekranını göster
            setTimeout(() => {
                radarScreen.style.display = 'none';
                locationResult.style.display = 'block';
            }, 3500); // Animasyonlarla uyumlu olması için 3.5 saniyeye çektim
        }

        function stopStalking() { 
            document.getElementById('stalk-overlay').style.display = 'none'; 
        }

let currentSongIndex = -1; 
const audioEl = document.getElementById("bgMusic");
const vinylBtn = document.getElementById("vinyl-btn");
const meaningBox = document.getElementById("meaning-box");
const trackTitle = document.getElementById("track-title");
const trackMeaning = document.getElementById("track-meaning");

function nextSong() {
    currentSongIndex++; 
    
    // Eğer listedeki tüm şarkılar bittiyse tekrar 1. şarkıya dön
    if (currentSongIndex >= playlist.length) {
        currentSongIndex = 0; 
    }
    
    const track = playlist[currentSongIndex];
    
    // Şarkıyı değiştir ve başlat
    audioEl.src = track.src;
    audioEl.play(); 
    vinylBtn.classList.add("playing"); // Plağı döndür

    // Bilgi kutusunun içindeki yazıları değiştir
    trackTitle.innerText = track.title;
    trackMeaning.innerText = track.meaning;
    
    // Kutuyu ekranda göster (CSS'teki 'show' sınıfını ekleyerek)
    meaningBox.classList.add("show");

    // Okuması için 6 saniye bekle, sonra kutuyu yavaşça gizle
    setTimeout(() => {
        meaningBox.classList.remove("show");
    }, 6000); 
}

// Şarkı kendiliğinden bittiğinde otomatik olarak sonrakine geçsin
audioEl.addEventListener("ended", nextSong);

/* Scratch Card */
        const canvas = document.getElementById('scratch-canvas');
        const ctx = canvas.getContext('2d');
        let isDrawing = false;
        let isRevealed = false; // Kutlamanın sadece 1 kere tetiklenmesi için

        // Tuvali gri ile doldur ve yazıyı yaz
        ctx.fillStyle = '#333'; ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#666'; ctx.font = 'bold 14px Raleway'; ctx.textAlign = 'center';
        ctx.fillText('SCRATCH TO SEE SURPRISE...', 160, 85);

        function scratch(e) {
            if (!isDrawing || isRevealed) return; // Zaten açıldıysa kazımayı durdur
            const rect = canvas.getBoundingClientRect();
            const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
            const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;
            ctx.globalCompositeOperation = 'destination-out';
            ctx.beginPath(); ctx.arc(x, y, 14, 0, Math.PI * 2); ctx.fill(); // Fırça boyutunu 18 yaptım biraz daha kolay kazınsın

            checkScratch(); // Her kazıma hareketinde kontrol et
        }

        function checkScratch() {
            // Tuvaldeki tüm piksellerin verisini al
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const pixels = imageData.data;
            let transparentPixels = 0;
            
            // Her 4. değer alfa (saydamlık) kanalıdır
            for (let i = 3; i < pixels.length; i += 4) {
                if (pixels[i] === 0) transparentPixels++;
            }
            
            const totalPixels = pixels.length / 4;
            const percentScratched = (transparentPixels / totalPixels) * 100;
            
            // Eğer %55'ten fazlası kazındıysa kutlamayı başlat
            if (percentScratched > 75) {
                isRevealed = true;
                triggerCelebration();
            }
        }

        function triggerCelebration() {
            // 1. Gri katmanı yavaşça ve zarifçe yok et (kalan kısımlar da tamamen açılsın)
            canvas.style.transition = "opacity 1s ease-out";
            canvas.style.opacity = "0";
            
            // Tuvali gizle ki altındaki yazıya (varsa butonlara vs.) tıklanabilsin
            setTimeout(() => canvas.style.display = "none", 1000); 

            // 2. Kutlama: Senin minik kalpleri konfeti gibi art arda fırlat
            for (let i = 0; i < 40; i++) {
                setTimeout(spawnMiniHeart, i * 80); 
            }

            // 3. (Opsiyonel) Ekrana tatlı bir bildirim çıkar
            setTimeout(() => {
                alert("Ömür Boyu Sarılma Üyeliğin Aktif Edildi Sevgilim! 🎉❤");
            }, 1200);
        }

        // Olay dinleyicileri (Event Listeners)
        canvas.addEventListener('mousedown', () => isDrawing = true);
        canvas.addEventListener('touchstart', (e) => { isDrawing = true; e.preventDefault(); });
        window.addEventListener('mouseup', () => isDrawing = false);
        window.addEventListener('touchend', () => isDrawing = false);
        canvas.addEventListener('mousemove', scratch);
        canvas.addEventListener('touchmove', (e) => { scratch(e); e.preventDefault(); });