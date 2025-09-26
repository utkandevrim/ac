# Actor Club - Üye Şifreleri

## 📊 Özet
- **Toplam Kullanıcı:** 190
- **Admin/Test Kullanıcıları (Hariç):** 5 
- **Şifre Oluşturulan Üyeler:** 185

## 🔒 Hariç Tutulan Kullanıcılar
- `admin.yonetici` (Admin Yönetici) - Admin hesabı
- `muzaffer.isgoren` (Muzaffer İşgören) - Admin hesabı
- `test.kullanici` (Test Kullanıcıkjkjkj) - Test hesabı  
- `test.kullanıcı` (Test Kullanıcı) - Test hesabı
- `test.yenimember` (Test Yenimember) - Test hesabı

## 🔑 Şifre Politikası
- **Uzunluk:** 8-16 karakter
- **İçerik:** En az 1 harf + 1 özel karakter
- **Format:** Kelime + Yıl + Özel Karakter
- **Örnekler:** Actor2024!, Stage2025@, Drama2024#

## 📱 Kullanım Talimatları

### Üyelere Dağıtım:
1. Her üyeye kullanıcı adı ve şifresini güvenli şekilde gönderin
2. İlk girişte şifre değiştirmeleri gerektiğini belirtin
3. Profil sayfasında "Şifre Değiştir" butonunu kullanabileceklerini söyleyin

### Şifre Değiştirme:
- Kullanıcılar profil sayfasında "Şifre Değiştir" butonuna tıklayabilir
- Mevcut şifre, yeni şifre ve doğrulama girmeleri gerekir
- Yeni şifre aynı politikaya uymalı (8-16 kar, harf + özel kar)

## 📄 Şifre Listesi

**185 üye için oluşturulmuş şifreler `/app/member_passwords.json` dosyasında mevcuttur.**

### İlk 20 Örnek:

| Kullanıcı Adı | Ad Soyad | Şifre |
|---------------|----------|--------|
| abdullah.bas | Abdullah Baş | Script2025% |
| abdullah.baş | Abdullah Baş | Dance2025! |
| abdulmetin.urunveren | Abdülmetin Ürünveren | Actor2025# |
| abdülmetin.ürünveren | Abdülmetin Ürünveren | Voice2025# |
| afet.bakay | Afet Bakay | Music2025# |
| ahmet.burhanoglu | Ahmet Rasim Burhanoğlu | Stage2024@ |
| ahmet.i̇sleyen | Ahmet İşleyen | Director2025$ |
| ahmet.i̇şleyen | Ahmet İşleyen | Scene2025* |
| ahmetrasim.burhanoğlu | Ahmet Rasim Burhanoğlu | Art2024* |
| alev.atam | Alev Atam | Stage2025# |
| amir.karabugday | Amir Karabuğday | Movie2024! |
| amir.karabuğday | Amir Karabuğday | Stage2025& |
| anil.ozcelik | Anıl Özçelik | Show2024* |
| anıl.özçelik | Anıl Özçelik | Movie2024# |
| asli.cindaruk | Aslı Cindaruk | Film2025% |
| aslı.cindaruk | Aslı Cindaruk | Music2024* |
| aybike.karakaya | Aybike Asena Karakaya | Art2024@ |
| aybikeasena.karakaya | Aybike Asena Karakaya | Music2024& |
| ayse.tumba | Ayşe Tumba | Show2024$ |
| ayşe.tumba | Ayşe Tumba | Studio2024* |

**Tam liste için `/app/member_passwords.json` dosyasını kontrol edin.**

## 🚨 Güvenlik Uyarıları
- ⚠️ Bu şifreler geçicidir
- ⚠️ Üyeler ilk girişte değiştirmeli
- ⚠️ Güvenli şekilde dağıtın
- ⚠️ Dağıtım sonrasında bu dosyaları silin

## ✅ Ek Özellikler
- **Şifre Değiştirme:** Tüm kullanıcılar profil sayfasından şifrelerini değiştirebilir
- **Validation:** Backend ve frontend validation mevcut
- **Policy Enforcement:** Yeni şifreler de aynı kurallara uymalı
- **Test Edildi:** Tüm işlevsellik test edildi ve çalışıyor

---
*Oluşturulma Tarihi: 26 Eylül 2025*
*Sistem: Actor Club Üye Portalı*