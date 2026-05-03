# Chat Conversation

Note: _This is purely the output of the chat conversation and does not contain any raw data, codebase snippets, etc. used to generate the output._

### User Input

kodlari analiz ele

*User accepted the command `git clone https://github.com/Optimuspime123/waview`*

*Listed directory [waview](file:///c:/Users/Victus/OneDrive/Desktop/Tehmaz/WP/waview) *

*Listed directory [WP](file:///c:/Users/Victus/OneDrive/Desktop/Tehmaz/WP) *

*Listed directory [waview-main](file:///c:/Users/Victus/OneDrive/Desktop/Tehmaz/WP/waview-main) *

*Viewed [README.md](file:///c:/Users/Victus/OneDrive/Desktop/Tehmaz/WP/waview-main/README.md) *

*Viewed [package.json](file:///c:/Users/Victus/OneDrive/Desktop/Tehmaz/WP/waview-main/package.json) *

*Viewed [bypass.js](file:///c:/Users/Victus/OneDrive/Desktop/Tehmaz/WP/waview-main/bypass.js) *

*Viewed [patch-baileys.js](file:///c:/Users/Victus/OneDrive/Desktop/Tehmaz/WP/waview-main/patch-baileys.js) *

*Viewed [telegram.js](file:///c:/Users/Victus/OneDrive/Desktop/Tehmaz/WP/waview-main/telegram.js) *

### Planner Response

Layihəni analiz etdim. `waview` layihəsi WhatsApp-ın "Bir dəfəlik baxış" (View Once) funksiyasını yan keçmək (bypass) və silinən mesajları izləmək üçün hazırlanmış bir PoC (Proof of Concept) alətidir.

Budur kodun əsas hissələrinin analizi:

### 1. Əsas İş Mexanizmi (Bypass Strategiyası)
Layihənin ən kritik hissəsi `patch-baileys.js` faylıdır. 
*   **Cihaz Simulyasiyası:** Bu skript `baileys` kitabxanasını modifikasiya edərək, botu WhatsApp serverlərinə bir "Veb Brauzer" kimi deyil, bir **Android Telefon** (Pixel 10) kimi təqdim edir.
*   **Niyə?** WhatsApp serverləri "View Once" mediasını adətən veb/masaüstü müştərilərə göndərmir. Özünü mobil cihaz kimi göstərməklə, bot bu medianı serverdən uğurla qəbul edə bilir.

### 2. `bypass.js` (Əsas Məntiq)
Bu fayl botun işini idarə edir:
*   **Media Yükləmə:** Gələn mesajlarda "View Once" (bir dəfəlik) işarəsi aşkar edildikdə, media avtomatik olaraq `downloads/` qovluğuna yüklənir.
*   **Presence (Onlayn Status):** Botun həqiqi bir istifadəçi kimi görünməsi üçün müəyyən fasilələrlə onlayn/oflayn statuslarını yeniləyir (`sendPresenceUpdate`).
*   **Filtrləmə:** Şəxsi mesajları (DMs) və qrupları fərqləndirə bilir, yalnız istədiyiniz məlumatları Telegram-a yönləndirməyə imkan verir.

### 3. Telegram İnteqrasiyası (`telegram.js`)
Yüklənən media və mesajlar Telegram botu vasitəsilə təyin olunmuş `CHAT_ID`-yə göndərilir:
*   **Metadata:** Mesajı göndərənin adı, JID-si (ID), istifadə etdiyi cihazın növü və vaxtı barədə ətraflı məlumat əlavə edilir.
*   **Avtomatik Təmizləmə:** `downloads/` qovluğu hər 48 saatdan bir təmizlənir ki, yaddaş dolmasın.

### 4. Fayl Strukturunun Analizi:
*   `patch-baileys.js`: `npm install` komandasından sonra avtomatik işləyir və kitabxananı "yamaqlayır".
*   `bypass.js`: Botun əsas giriş nöqtəsidir (`npm start` ilə işə düşür).
*   `auth_info_android_bypass/`: WhatsApp-a giriş məlumatları (session) burada saxlanılır.

### Müsbət tərəfləri:
*   **Ağıllı yanaşma:** Kitabxana səviyyəsində edilən modifikasiya bypass-ı çox effektiv edir.
*   **Xəta idarəetməsi:** Hər hansı bir xəta (bağlantı kəsilməsi, yükləmə xətası) baş verdikdə Telegram-a bildiriş göndərir.

### Diqqət edilməli məqamlar:
*   **Təhlükəsizlik:** `.env` faylında Telegram tokeninizi və `auth_info_...` qovluğunda WhatsApp sessiyanızı qorumalısınız.
*   **Kitabxana Yeniləmələri:** `baileys` kitabxanası yenilənərsə, `patch-baileys.js` faylındakı sətirlər artıq uyğun gəlməyə bilər və skript işləməz.

Kodlarla bağlı xüsusi bir dəyişiklik və ya təkmilləşdirmə istəyirsinizsə, bildirə bilərsiniz.