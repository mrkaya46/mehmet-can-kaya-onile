const gorevInput = document.getElementById('gorevInput');
const kategoriSelect = document.getElementById('kategoriSelect');
const resimInput = document.getElementById('resimInput');
const gorevListesi = document.getElementById('gorevListesi');

const gsResimleri = [
  'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=1920&q=80'
];

let mevcutResimIndex = 0;

document.addEventListener('DOMContentLoaded', () => {
  gorevleriYukle();
  havaDurumuGetir();
  tarihGuncelle();
  temaKontrol();
  arkaPlanBaslat();
  gsBilgileriYukle();
});

function arkaPlanBaslat() {
  const bgSlider = document.getElementById('bgSlider');
  
  function resimDegistir() {
    bgSlider.style.backgroundImage = `url('${gsResimleri[mevcutResimIndex]}')`;
    mevcutResimIndex = (mevcutResimIndex + 1) % gsResimleri.length;
  }

  resimDegistir();
  setInterval(resimDegistir, 7000);
}

function gsBilgileriYukle() {
  // Anlık puan durumu, son ve gelecek maç verisi
  document.getElementById('gsSira').textContent = '1. Sıra (13 Puan)';
  document.getElementById('sonMac').textContent = 'GS 1 - 0 Kocaelispor';
  document.getElementById('gelecekMac').textContent = 'Trabzonspor - GS';
}

function tarihGuncelle() {
  const tarihSaatEl = document.getElementById('tarihSaat');
  const simdi = new Date();
  const secenekler = { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' };
  tarihSaatEl.textContent = simdi.toLocaleDateString('tr-TR', secenekler);
}

async function havaDurumuGetir() {
  const sehirAdiEl = document.getElementById('sehirAdi');
  const sicaklikEl = document.getElementById('sicaklik');

  try {
    const enlem = 37.00;
    const boylam = 35.32;
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${enlem}&longitude=${boylam}&current_weather=true`;

    const response = await fetch(url);
    if (!response.ok) throw new Error('Ağ hatası');
    
    const data = await response.json();
    const sicaklik = Math.round(data.current_weather.temperature);
    
    sehirAdiEl.textContent = '📍 Adana';
    sicaklikEl.textContent = `${sicaklik}°C 🌤️`;
  } catch (error) {
    sehirAdiEl.textContent = '📍 Adana';
    sicaklikEl.textContent = '24°C 🌤️';
  }
}

function gorevEkle() {
  const gorevMetni = gorevInput.value.trim();
  const kategori = kategoriSelect.value;
  const dosya = resimInput.files[0];

  if (gorevMetni === '') {
    alert('Lütfen bir görev yazın!');
    return;
  }

  if (dosya) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const resimData = e.target.result;
      listeyeEkleUI(gorevMetni, kategori, resimData, false);
      hafizayaKaydet(gorevMetni, kategori, resimData, false);
      sifirlaForm();
    };
    reader.readAsDataURL(dosya);
  } else {
    listeyeEkleUI(gorevMetni, kategori, null, false);
    hafizayaKaydet(gorevMetni, kategori, null, false);
    sifirlaForm();
  }
}

function sifirlaForm() {
  gorevInput.value = '';
  resimInput.value = '';
}

function listeyeEkleUI(metin, kategori, resimData, tamamlandiMi) {
  const li = document.createElement('li');
  if (tamamlandiMi) li.classList.add('tamamlandi');

  const icerikBox = document.createElement('div');
  icerikBox.className = 'task-content';

  if (resimData) {
    const img = document.createElement('img');
    img.src = resimData;
    img.className = 'task-img';
    icerikBox.appendChild(img);
  }

  const badge = document.createElement('span');
  badge.className = 'badge';
  badge.textContent = kategori;

  const span = document.createElement('span');
  span.className = 'metin';
  span.textContent = metin;
  
  span.addEventListener('click', function() {
    li.classList.toggle('tamamlandi');
    hafizayiGuncelle();
  });

  icerikBox.appendChild(badge);
  icerikBox.appendChild(span);

  const btnBox = document.createElement('div');
  btnBox.className = 'action-btns';

  const editBtn = document.createElement('button');
  editBtn.textContent = '✏️';
  editBtn.className = 'edit-btn';
  editBtn.addEventListener('click', function() {
    const yeniMetin = prompt('Görevi düzenleyin:', span.textContent);
    if (yeniMetin && yeniMetin.trim() !== '') {
      span.textContent = yeniMetin.trim();
      hafizayiGuncelle();
    }
  });

  const silBtn = document.createElement('button');
  silBtn.textContent = '🗑️';
  silBtn.className = 'sil-btn';
  silBtn.addEventListener('click', function() {
    li.remove();
    hafizayiGuncelle();
  });

  btnBox.appendChild(editBtn);
  btnBox.appendChild(silBtn);

  li.appendChild(icerikBox);
  li.appendChild(btnBox);
  gorevListesi.appendChild(li);
}

function filtrele(tip, btn) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  const elemanlar = gorevListesi.querySelectorAll('li');
  elemanlar.forEach(li => {
    switch(tip) {
      case 'tum':
        li.style.display = 'flex';
        break;
      case 'aktif':
        li.style.display = li.classList.contains('tamamlandi') ? 'none' : 'flex';
        break;
      case 'tamamlanan':
        li.style.display = li.classList.contains('tamamlandi') ? 'flex' : 'none';
        break;
    }
  });
}

function temaDegistir() {
  document.body.classList.toggle('dark-mode');
  const isDark = document.body.classList.contains('dark-mode');
  localStorage.setItem('darkMode', isDark);
  document.getElementById('themeToggle').textContent = isDark ? '☀️' : '🌙';
}

function temaKontrol() {
  if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark-mode');
    document.getElementById('themeToggle').textContent = '☀️';
  }
}

function tumunuTemizle() {
  if (gorevListesi.children.length === 0) return;
  if (confirm('Tüm görevleri silmek istediğinizden emin misiniz?')) {
    gorevListesi.innerHTML = '';
    localStorage.removeItem('gorevler');
  }
}

function hafizayaKaydet(metin, kategori, resimData, tamamlandiMi) {
  let gorevler = hafizadanAl();
  gorevler.push({ metin, kategori, resimData, tamamlandi: tamamlandiMi });
  localStorage.setItem('gorevler', JSON.stringify(gorevler));
}

function hafizadanAl() {
  return localStorage.getItem('gorevler') ? JSON.parse(localStorage.getItem('gorevler')) : [];
}

function gorevleriYukle() {
  let gorevler = hafizadanAl();
  gorevler.forEach(g => listeyeEkleUI(g.metin, g.kategori || 'Genel', g.resimData || null, g.tamamlandi));
}

function hafizayiGuncelle() {
  let gorevler = [];
  gorevListesi.querySelectorAll('li').forEach(li => {
    const metin = li.querySelector('.metin').textContent;
    const kategori = li.querySelector('.badge').textContent;
    const imgEl = li.querySelector('.task-img');
    const resimData = imgEl ? imgEl.src : null;
    const tamamlandi = li.classList.contains('tamamlandi');
    gorevler.push({ metin, kategori, resimData, tamamlandi });
  });
  localStorage.setItem('gorevler', JSON.stringify(gorevler));
}