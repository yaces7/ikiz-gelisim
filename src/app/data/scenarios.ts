
export const scenarios = [
    {
        id: 1,
        title: 'Hafta Sonu İkilemi',
        stage: 'Senaryo 1 / 20',
        description: 'Arkadaşlarınla uzun zamandır planladığın sinema etkinliği var. Tam çıkmak üzereyken ikizin "Kendimi çok yalnız hissediyorum, lütfen gitme" diyor.',
        options: [
            { id: 'a', text: 'Planımı iptal eder, onunla kalırım.', icon: '🫂', independenceEffect: -10, feedback: 'Fedakarca ama kendi sınırlarını ihlal ettin.' },
            { id: 'b', text: '"Seni seviyorum ama bu plana sadık kalmalıyım" derim.', icon: '🛡️', independenceEffect: +15, feedback: 'Harika bir sınır koyma örneği!' },
            { id: 'c', text: 'Arkadaşlarımı eve çağırırım.', icon: '🏠', independenceEffect: +5, feedback: 'Orta yol, ama bireysel alanını feda ettin.' }
        ]
    },
    {
        id: 2,
        title: 'Kıyafet Seçimi',
        stage: 'Senaryo 2 / 20',
        description: 'Okulun ilk günü için kendine çok beğendiğin bir tarz oluşturdun. İkizin "İkimiz de aynı giyinsek çok havalı oluruz, lütfen!" diye ısrar ediyor.',
        options: [
            { id: 'a', text: 'Onu kırmamak için aynı giyinirim.', icon: '👕', independenceEffect: -15, feedback: 'Bireysel ifaden yerine uyumu seçtin.' },
            { id: 'b', text: '"Bugün kendi tarzımı yansıtmak istiyorum." derim.', icon: '✨', independenceEffect: +20, feedback: 'Kendi kimliğini cesurca ifade ettin!' },
            { id: 'c', text: 'Sadece bir aksesuarı ortak takmayı öneririm.', icon: '🤝', independenceEffect: +10, feedback: 'Hem bağınızı korudun hem de farlılığını.' }
        ]
    },
    {
        id: 3,
        title: 'Farklı İlgi Alanları',
        stage: 'Senaryo 3 / 20',
        description: 'Sen basketbol kursuna yazılmak istiyorsun, ikizin ise tiyatroya. Ailen sadece bir kursa gidebileceğinizi ve ortak karar vermeniz gerektiğini söylüyor.',
        options: [
            { id: 'a', text: 'Onun istediği tiyatroya giderim.', icon: '🎭', independenceEffect: -20, feedback: 'Kendi tutkularını erteledin.' },
            { id: 'b', text: 'Ailemle konuşup ayrı kurslar için ısrar ederim.', icon: '🗣️', independenceEffect: +25, feedback: 'Bireysel gelişim hakkını savundun.' },
            { id: 'c', text: 'Sırayla denemeyi öneririm.', icon: '🔄', independenceEffect: +5, feedback: 'Adil bir çözüm aradın.' }
        ]
    },
    {
        id: 4,
        title: 'Gizli Günlük',
        stage: 'Senaryo 4 / 20',
        description: 'Odanıza girdiğinde ikizini günlüğünü okurken yakaladın. "Bizim aramızda sır olmaz sanıyordum" diyerek kendini savunuyor.',
        options: [
            { id: 'a', text: '"Haklısın, okuyabilirsin" derim.', icon: '📖', independenceEffect: -25, feedback: 'Mahremiyet hakkından tamamen vazgeçtin.' },
            { id: 'b', text: 'Günlüğümü elinden alır ve odadan çıkarırım.', icon: '🚪', independenceEffect: +20, feedback: 'Sınırlarını net bir şekilde korudun.' },
            { id: 'c', text: 'Bunun özelim olduğunu sakin bir dille anlatırım.', icon: '💬', independenceEffect: +30, feedback: 'Olgun ve yapıcı bir sınır koyma.' }
        ]
    },
    {
        id: 5,
        title: 'Ayrı Odalar',
        stage: 'Senaryo 5 / 20',
        description: 'Evinizde boş bir oda var. Ebeveynleriniz odanızı ayırmak isteyip istemediğinizi soruyor. İkizin ayrılmak istemiyor.',
        options: [
            { id: 'a', text: 'İkizimi üzmemek için reddederim.', icon: '🛏️', independenceEffect: -15, feedback: 'Bağımlılığı sürdürmeyi seçtin.' },
            { id: 'b', text: 'Hemen kabul ederim, çok ihtiyacım var.', icon: '🏃', independenceEffect: +20, feedback: 'Fiziksel ayrışma için büyük bir adım.' },
            { id: 'c', text: 'Deneme süreci öneririm.', icon: '⏳', independenceEffect: +10, feedback: 'Geçiş sürecini yumuşattın.' }
        ]
    },
    {
        id: 6,
        title: 'Sosyal Medya Hesabı',
        stage: 'Senaryo 6 / 20',
        description: 'İkizinle ortak Instagram hesabınız var ama sen kendi çektiğin fotoğrafları paylaşmak için ayrı bir hesap açmak istiyorsun.',
        options: [
            { id: 'a', text: 'Gizlice hesap açarım.', icon: '🕵️', independenceEffect: +5, feedback: 'Bireyselleştin ama dürüstlükten ödün verdin.' },
            { id: 'b', text: 'Ortak hesaptan devam ederim.', icon: '📱', independenceEffect: -10, feedback: 'Dijital kimliğini birleştirdin.' },
            { id: 'c', text: 'Açıkça konuşur ve kişisel hesabımı açarım.', icon: '✅', independenceEffect: +20, feedback: 'Sağlıklı bir dijital ayrışma.' }
        ]
    },
    {
        id: 7,
        title: 'Arkadaş Grubu',
        stage: 'Senaryo 7 / 20',
        description: 'Okulda yeni bir arkadaş grubuyla tanıştın. İkizin de sürekli yanına gelip sohbete dahil olmaya çalışıyor.',
        options: [
            { id: 'a', text: 'Onu da her seferinde gruba dahil ederim.', icon: '🔗', independenceEffect: -15, feedback: 'Sosyal çevreni ayrıştıramadın.' },
            { id: 'b', text: 'Daha sonra görüşeceğimizi söylerim.', icon: '👋', independenceEffect: +15, feedback: 'Sosyal sınırlarını korudun.' },
            { id: 'c', text: 'Gruptan uzaklaşırım.', icon: '🏃', independenceEffect: +0, feedback: 'Çatışmadan kaçtın ama sosyalleşemedin.' }
        ]
    },
    {
        id: 8,
        title: 'Doğum Günü Hediyesi',
        stage: 'Senaryo 8 / 20',
        description: 'Teyzeniz doğum gününüzde ikinize de birebir aynı kazağı hediye aldı. Sen bu tarzı hiç sevmedin.',
        options: [
            { id: 'a', text: 'Teyzeme teşekkür edip giyerim.', icon: '😐', independenceEffect: -5, feedback: 'Uyumlu oldun ama kendi zevkini yok saydın.' },
            { id: 'b', text: 'İkizim giyerse ben de giyerim.', icon: '👯', independenceEffect: -10, feedback: 'Kararını ikizine endeksledin.' },
            { id: 'c', text: 'Teşekkür edip değişim kartını isterim.', icon: '🔄', independenceEffect: +20, feedback: 'Kendi zevkine sahip çıktın.' }
        ]
    },
    {
        id: 9,
        title: 'Okul Projesi',
        stage: 'Senaryo 9 / 20',
        description: 'Öğretmeniniz grup projesi veriyor. İkizin hemen "Biz eşleşelim!" diye atılıyor.',
        options: [
            { id: 'a', text: 'Kabul ederim, en kolayı bu.', icon: '👌', independenceEffect: -10, feedback: 'Konfor alanında kaldın.' },
            { id: 'b', text: '"Başkalarıyla çalışıp yeni insanlar tanımalıyız" derim.', icon: '🌍', independenceEffect: +25, feedback: 'Gelişim odaklı bir karar.' },
            { id: 'c', text: 'Sessiz kalırım.', icon: '😶', independenceEffect: -5, feedback: 'Kararı ona bıraktın.' }
        ]
    },
    {
        id: 10,
        title: 'Telefon Konuşması',
        stage: 'Senaryo 10 / 20',
        description: 'Odanda özel bir telefon konuşması yapıyorsun. İkizin içeri girip çıkmıyor.',
        options: [
            { id: 'a', text: 'Konuşmayı kısa kesip kapatırım.', icon: '📞', independenceEffect: -5, feedback: 'İletişim ihtiyacını bastırdın.' },
            { id: 'b', text: 'Odadan çıkmasını rica ederim.', icon: '👉', independenceEffect: +20, feedback: 'Makul bir sınır talebi.' },
            { id: 'c', text: 'Bağırarak kovarım.', icon: '😡', independenceEffect: +5, feedback: 'Sınır koydun ama ilişkiye zarar verdin.' }
        ]
    },
    {
        id: 11,
        title: 'Meslek Seçimi',
        stage: 'Senaryo 11 / 20',
        description: 'İkizin doktor olmak istiyor. Ailen senin de doktor olman gerektiğini, "ikizlerin ayrılmaması gerektiğini" ima ediyor.',
        options: [
            { id: 'a', text: 'Ben de tıp yazarım.', icon: '🏥', independenceEffect: -30, feedback: 'Geleceğini başkalarının hayaline feda ettin.' },
            { id: 'b', text: 'Kendi ilgi alanımı (örn. Mimarlık) savunurum.', icon: '🏗️', independenceEffect: +30, feedback: 'Geleceğin için güçlü bir duruş.' },
            { id: 'c', text: 'Kafam karışır, kararsız kalırım.', icon: '🤔', independenceEffect: 0, feedback: 'Dış etkilere açıksın.' }
        ]
    },
    {
        id: 12,
        title: 'Yemek Siparişi',
        stage: 'Senaryo 12 / 20',
        description: 'Dışarıdan yemek söyleyeceksiniz. İkizin pizza istiyor, sen hamburger. "Hep aksilik çıkarıyorsun" diyor.',
        options: [
            { id: 'a', text: 'Tamam pizza olsun.', icon: '🍕', independenceEffect: -10, feedback: 'Suçluluk duygusuna yenildin.' },
            { id: 'b', text: 'Herkes kendi istediğini söylesin.', icon: '🍔', independenceEffect: +20, feedback: 'Basit ve etkili bir özerklik çözümü.' },
            { id: 'c', text: 'Yemek yemekten vazgeçerim.', icon: '❌', independenceEffect: -15, feedback: 'Pasif agresif bir tepki.' }
        ]
    },
    {
        id: 13,
        title: 'Ödünç Alma',
        stage: 'Senaryo 13 / 20',
        description: 'İkizin senin kulaklığını alıp kaybetmiş. "Zaten yenisini alacaktık" diyor.',
        options: [
            { id: 'a', text: 'Bir şey demem.', icon: '🤐', independenceEffect: -20, feedback: 'Sorumluluk bilincini zayıflattın.' },
            { id: 'b', text: 'Yenisini onun harçlığıyla almasını isterim.', icon: '💰', independenceEffect: +25, feedback: 'Sorumluluk ve bireysel mülkiyet dersi.' },
            { id: 'c', text: 'Ailemle konuşup sorunu çözmeyi öneririm.', icon: '👨‍👩‍👧', independenceEffect: -5, feedback: 'Sorunu kendin çözemedin.' }
        ]
    },
    {
        id: 14,
        title: 'Kıyaslanma',
        stage: 'Senaryo 14 / 20',
        description: 'Bir komşu "Kardeşin senden daha girişken" dedi.',
        options: [
            { id: 'a', text: 'Kendimi kötü hissederim.', icon: '😔', independenceEffect: -10, feedback: 'Başkalarının yargısını içselleştirdin.' },
            { id: 'b', text: '"Herkesin karakteri farklıdır" derim.', icon: '😌', independenceEffect: +20, feedback: 'Mükemmel bir özgüven cevabı.' },
            { id: 'c', text: 'Odayı terk ederim.', icon: '🚪', independenceEffect: 0, feedback: 'Durumla yüzleşmedin.' }
        ]
    },
    {
        id: 15,
        title: 'Yatılı Misafir',
        stage: 'Senaryo 15 / 20',
        description: 'İkizin arkadaşını yatıya çağırmış ama senin ertesi gün sınavın var.',
        options: [
            { id: 'a', text: 'Sessiz olmalarını umarak çalışırım.', icon: '📚', independenceEffect: -5, feedback: 'Kendi ihtiyacını riske attın.' },
            { id: 'b', text: 'Misafirin gelmemesini isterim.', icon: '🚫', independenceEffect: +20, feedback: 'Önceliklerini doğru belirledin.' },
            { id: 'c', text: 'Ben de onlara katılırım.', icon: '🎉', independenceEffect: -15, feedback: 'Sorumluluğunu unuttun.' }
        ]
    },
    {
        id: 16,
        title: 'Saç Modeli',
        stage: 'Senaryo 16 / 20',
        description: 'Saçlarını kısa kestirdin. İkizin "Şimdi benzesiz olduk, ben de kestireceğim" diyor.',
        options: [
            { id: 'a', text: '"Harika olur" derim.', icon: '✂️', independenceEffect: -10, feedback: 'Bireysel imajını koruyamadın.' },
            { id: 'b', text: '"Bence sen kendi istediğin gibi yapmalısın" derim.', icon: '🤔', independenceEffect: +15, feedback: 'Onu da bireyselliğe teşvik ettin.' },
            { id: 'c', text: 'Karışmam.', icon: '🤷', independenceEffect: 0, feedback: 'Nötr kaldın.' }
        ]
    },
    {
        id: 17,
        title: 'Sır Saklama',
        stage: 'Senaryo 17 / 20',
        description: 'Arkadaşın sana bir sır verdi ve "Kimseye söyleme" dedi. İkizin "Bana da söyle, biz biriz" diyor.',
        options: [
            { id: 'a', text: 'Anlatırım.', icon: '🗣️', independenceEffect: -20, feedback: 'Üçüncü şahıslara karşı sınırın yok.' },
            { id: 'b', text: '"Bu bana ait bir sır değil" derim.', icon: '🤐', independenceEffect: +25, feedback: 'Güvenilirlik ve sınır koruma.' },
            { id: 'c', text: 'Yalan söylerim.', icon: '🤥', independenceEffect: -5, feedback: 'Dürüstlüğü kaybettin.' }
        ]
    },
    {
        id: 18,
        title: 'Tek Başına Seyahat',
        stage: 'Senaryo 18 / 20',
        description: 'Okul gezisi var. İkizin hasta olduğu için gidemiyor. Sen?',
        options: [
            { id: 'a', text: 'O yoksa ben de gitmem.', icon: '🏠', independenceEffect: -25, feedback: 'Deneyimden mahrum kaldın.' },
            { id: 'b', text: 'Gider, ona bol bol fotoğraf atarım.', icon: '📸', independenceEffect: +20, feedback: 'Sağlıklı bir ayrılık deneyimi.' },
            { id: 'c', text: 'Giderim ama suçlu hissederim.', icon: '😟', independenceEffect: +5, feedback: 'Eylem doğru ama duygu yükü var.' }
        ]
    },
    {
        id: 19,
        title: 'İsim Karışıklığı',
        stage: 'Senaryo 19 / 20',
        description: 'Öğretmen sana ikizinin adıyla hitap etti.',
        options: [
            { id: 'a', text: 'Bozuntuya vermem.', icon: '😶', independenceEffect: -10, feedback: 'Kendi kimliğini sildin.' },
            { id: 'b', text: 'Nazikçe düzeltirim.', icon: '☝️', independenceEffect: +20, feedback: 'Benliğini hatırlattın.' },
            { id: 'c', text: 'Sinirlenirim.', icon: '😡', independenceEffect: +5, feedback: 'Tepkili ama haklısın.' }
        ]
    },
    {
        id: 20,
        title: 'Final Kararı',
        stage: 'Senaryo 20 / 20',
        description: 'Gelecekteki hayatını hayal ederken, ikizin nerede?',
        options: [
            { id: 'a', text: 'Hep yanımda, aynı evde.', icon: '🏘️', independenceEffect: -20, feedback: 'Ayrışma tamamlanmamış.' },
            { id: 'b', text: 'Kendi hayatlarımız var ama bağımız güçlü.', icon: '❤️', independenceEffect: +30, feedback: 'İdeal ikiz ilişkisi hedefi.' },
            { id: 'c', text: 'Uzak olsun, görüşmeyelim.', icon: '🚀', independenceEffect: +10, feedback: 'Kopuk ilişki riski.' }
        ]
    }
];
