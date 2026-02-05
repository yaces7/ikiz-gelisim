
export interface Question {
    id: number;
    text: string;
    options: string[];
}

export interface TestModule {
    id: string; // Unique ID formatted as w{week}-t{order}
    week: number;
    order: number;
    title: string;
    description: string;
    questions: Question[];
}

export const allTests: TestModule[] = [
    // --- WEEK 1: Kimlik Gelişimi ve Farkındalık ---
    {
        id: "w1-t1",
        week: 1, order: 1,
        title: "Test 1: Kimlik Aynası",
        description: "Kendini ikizinden bağımsız bir birey olarak nasıl tanımlıyorsun?",
        questions: [
            { id: 101, text: "Aynaya baktığında ilk gördüğün şey nedir?", options: ["Kendi özgün yüzüm", "Kardeşimle benzerliğim", "İkimizden bir parça", "Sadece bir çocuk"] },
            { id: 102, text: "İsminle hitap edildiğinde ne hissedersin?", options: ["Değerli ve özel", "Normal", "Bazen 'ikizler' denmesini bekliyorum", "Fark etmez"] },
            { id: 103, text: "En sevdiğin renk ikizinin nefret ettiği bir renk olsa giyer misin?", options: ["Gururla giyerim", "Belki giyerim", "Onu kırmamak için giymem", "Genelde aynı renk giyeriz"] },
            { id: 104, text: "Kendi başına bir hobi seçerken hangisi daha önemli?", options: ["Tamamen benim sevmem", "İkizimin de katılması", "Ortak bir ilgi olması", "Onun seçmesi"] },
            { id: 105, text: "Başkaları seni 'diğer yarın' diye tanımladığında ne hissedersin?", options: ["Ben tam bir bireyim", "Biraz hoşuma gider", "Alıştım artık", "Kendimi öyle hissediyorum"] }
        ]
    },
    {
        id: "w1-t2",
        week: 1, order: 2,
        title: "Test 2: Benlik Algısı",
        description: "Kendi kararlarını alma ve özgünlük seviyeni ölç.",
        questions: [
            { id: 111, text: "Bir yemeği denemeden önce ikizinin beğenmesini bekler misin?", options: ["Hayır, tadına bakarım", "Bazen sorarım", "Onun zevkine güvenirim", "O ne yerse onu yerim"] },
            { id: 112, text: "Kendi tarzını yaratmak sence ne kadar önemli?", options: ["Hayatımdaki en önemli şey", "Zaman zaman önemli", "Gereksiz bir çaba", "Benzerlik daha güzel"] },
            { id: 113, text: "İkizinden farklı bir sınıfta olsaydın ne hissederdin?", options: ["Özgür ve bağımsız", "Biraz heyecanlı", "Endişeli ve yalnız", "Çok korkunç"] },
            { id: 114, text: "Hayallerini kurarken 'biz' mi diyorsun 'ben' mi?", options: ["Hep 'ben'", "Çoğunlukla 'ben'", "Bazen 'biz'", "Her zaman 'biz'"] },
            { id: 115, text: "Kendi yeteneklerini onunkinden üstün gördüğünde suçluluk duyar mısın?", options: ["Hayır, her birey farklıdır", "Azıcık duyabilirim", "Evet, üzülürüm", "Onu geçersem saklarım"] }
        ]
    },
    {
        id: "w1-t3",
        week: 1, order: 3,
        title: "Test 3: Duygusal Ayrışma",
        description: "Kendi duygularını başkasınınkinden ayırabiliyor musun?",
        questions: [
            { id: 121, text: "İkizin ağladığında sen de ağlamaya başlar mısın?", options: ["Hayır, nedenini sorarım", "Empati kurarım ama ağlamam", "Gözlerim dolar", "Hemen ağlarım"] },
            { id: 122, text: "Onun başardığı bir şeye içtenlikle sevinebilir misin?", options: ["Evet, onun adına sevinirim", "Güzel ama keşke ben de yapsaydım", "Biraz kıskanırım", "Kendi başarım sayarım"] },
            { id: 123, text: "Duygularını ifade ederken zorlanır mısın?", options: ["Hayır, çok netim", "Yazarak daha iyi", "Zaman zaman", "O benim yerime söyler"] },
            { id: 124, text: "Fiziksel bir acı hissettiğinde ikizinin de hissettiğini düşünür müsün?", options: ["Asla", "Çok nadir", "Bazen", "Evet, her zaman"] },
            { id: 125, text: "Kendi başına uyurken korkar mısın?", options: ["Hayır, çok rahatım", "Bazen ışığı açarım", "Onun varlığına alıştım", "Asla tek uyumam"] }
        ]
    },

    // --- WEEK 2: Sosyal İlişkiler ve Sınırlar ---
    {
        id: "w2-t1",
        week: 2, order: 1,
        title: "Test 1: Sosyal Çember",
        description: "Arkadaşlık ilişkilerindeki bağımsızlığını test et.",
        questions: [
            { id: 201, text: "İkizinin tanımadığı kaç arkadaşın var?", options: ["Çok fazla", "Birkaç tane", "Hepsini tanıyor", "Sadece ortak arkadaşlarımız var"] },
            { id: 202, text: "İkizin olmadan bir doğum günü partisine gitmek sence nasıl?", options: ["Çok eğlenceli ve özgür", "Güzel olabilir", "Biraz garip", "Gitmem"] },
            { id: 203, text: "Arkadaşların seni ikizinle karıştırınca tepkin ne olur?", options: ["Hemen uyarırım", "Gülerek düzeltirim", "Alıştım, takmam", "Cevap bile vermem"] },
            { id: 204, text: "Sosyal medyada (olsa) ayrı hesap açmak istenir mi?", options: ["Kesinlikle evet", "Olabilir", "Ortak hesap daha iyi", "Ayırmaya gerek yok"] },
            { id: 205, text: "Hangi arkadaşınla daha çok vakit geçiriyorsun?", options: ["En iyi kendi arkadaşımla", "Ortak arkadaşla", "Sadece ikizimle", "Kimseyle"] }
        ]
    },
    {
        id: "w2-t2",
        week: 2, order: 2,
        title: "Test 2: Özel Alan ve Mahremiyet",
        description: "Sınırlarını ne kadar net çizebiliyorsun?",
        questions: [
            { id: 211, text: "Odanızın kapısını kapatma ihtiyacı duyar mısın?", options: ["Evet, her zaman", "Bazen yalnız kalmak için", "Genelde açık", "Hiç kapatmam"] },
            { id: 212, text: "İkizin günlüğünü okusa ne yapardın?", options: ["Çok büyük bir olay olur", "Kızarım ama affederim", "Sırrım yok, okusun", "Zaten beraber tutuyoruz"] },
            { id: 213, text: "Eşyalarını (kıyafet vb) izinsiz almasına ne dersin?", options: ["Asla kabul etmem", "Sorması lazım", "Bir şey demem", "Her şeyimiz ortak zaten"] },
            { id: 214, text: "Telefonda özel bir konuşma yaparken odadan çıkar mı?", options: ["Evet, mutlaka", "Bazen", "Gerek yok", "Her şeyi duyar"] },
            { id: 215, text: "İkizine 'hayır' demek senin için ne kadar zor?", options: ["Hiç zor değil", "Biraz zorlanırım", "Vicdan yaparım", "Asla hayır diyemem"] }
        ]
    },
    {
        id: "w2-t3",
        week: 2, order: 3,
        title: "Test 3: Sosyal Roller",
        description: "Takım içinde bir 'parça' mısın yoksa 'ana karakter' mi?",
        questions: [
            { id: 221, text: "Grup çalışmalarında ikizinle aynı grupta mı olmak istersin?", options: ["Hayır, farklı gruplar", "Fark etmez", "Evet, daha güvenli", "Onsuz grup çalışamam"] },
            { id: 222, text: "Liderlik rolünü kim üstlenir?", options: ["Ben kendi alanımda liderim", "İkimiz de lideriz", "Daha çok o", "Her zaman o"] },
            { id: 223, text: "Okulda öğretmenlerin seni isminle mi çağırıyor?", options: ["Evet, hep", "Çoğunlukla", "Bazen 'diğer ikiz'", "Hep karıştırıyorlar"] },
            { id: 224, text: "Yeni bir ortama girince ilk kim konuşur?", options: ["Ben atılırım", "Sırayla", "Genelde o", "O konuşsun ben beklerim"] },
            { id: 225, text: "Kendi fikirlerini savunurken ne kadar cesursun?", options: ["Kim olursa olsun savunurum", "Genelde ama zorlanırım", "İkizim yanımdayken evet", "Sessiz kalırım"] }
        ]
    },

    // --- WEEK 3: Duygusal Bağımsızlık ---
    {
        id: "w3-t1",
        week: 3, order: 1,
        title: "Test 1: Duygu Dedektifi",
        description: "Kendi hislerinin kaynağını bul.",
        questions: [
            { id: 301, text: "Kötü bir gün geçirdiğinde ikizine anlatır mısın?", options: ["Hemen", "Bir süre beklerim", "Bazen saklarım", "O zaten anlar, anlatmam"] },
            { id: 302, text: "O bir tartışmada haksızsa onu savunur musun?", options: ["Hayır, hatasını söylerim", "Başbaşa kalınca söylerim", "Yine de savunurum", "Ne yaparsa arkasındayım"] },
            { id: 303, text: "Kendi başına ağlamak seni korkutur mu?", options: ["Hayır, bazen gerekli", "Biraz yalnız hissederim", "Onun yanımda olmasını isterim", "Asla tek ağlamam"] },
            { id: 304, text: "Mutluluğunu paylaşmak için ilk kime koşarsın?", options: ["Arkadaşıma/Aileme", "İkizime", "Kimseye", "Bağırırım"] },
            { id: 305, text: "Duyguların ikizinin ruh haline göre mi şekillenir?", options: ["Asla, ben hep benimdir", "Biraz etkilenirim", "Çoğunlukla evet", "O nasılsa ben de öyleyim"] }
        ]
    },
    {
        id: "w3-t2",
        week: 3, order: 2,
        title: "Test 2: Çatışma Çözme Stili",
        description: "Tartışmaların ne kadar sağlıklı?",
        questions: [
            { id: 311, text: "Tartışınca ilk kim özür diler?", options: ["Hatası olan", "Kim daha önce sakinleşirse", "Hep ben", "Hep o"] },
            { id: 312, text: "Birbirinize küstüğünüzde ne kadar sürer?", options: ["5 dakika", "Birkaç saat", "Bütün gün", "Haftalar sürer"] },
            { id: 313, text: "Kavga edince fiziksel temas kurar mısınız?", options: ["Asla, sadece konuşuruz", "Bazen itişiriz", "Sert tartışırız", "Çok şiddetli"] },
            { id: 314, text: "Ebeveynleriniz tartışmanıza müdahale etmeli mi?", options: ["Hayır, kendimiz çözeriz", "Sadece çok büyürse", "Evet, hakem olmalılar", "Her tartışmada yardıma gelirler"] },
            { id: 315, text: "Tartıştıktan sonra ayrılmak ister misin?", options: ["Kendi odama giderim", "Bir süre sessiz kalırım", "Ondan uzaklaşamam", "Yan yana durup somurturuz"] }
        ]
    },
    {
        id: "w3-t3",
        week: 3, order: 3,
        title: "Test 3: Kıskançlık ve Takdir",
        description: "Rekabetin rengini keşfet.",
        questions: [
            { id: 321, text: "İkizine birisi iltifat ettiğinde ne hissedersin?", options: ["Gurur duyarım", "Benim için de geçerli sayarım", "Keşke bana da deseler", "Kıskanırım"] },
            { id: 322, text: "Ona alınan bir hediyeyi daha çok beğensen ne yaparsın?", options: ["Onun adına mutlu olurum", "Değişmeyi teklif ederim", "Sussam da üzülürüm", "Hemen kavga çıkarırım"] },
            { id: 323, text: "Sizce hanginiz daha popüler?", options: ["İkimiz de farklı çevrelerde", "Popülerliğe önem vermem", "O daha popüler", "Ben daha popülerim"] },
            { id: 324, text: "Aynı alanda (örn. Matematik) yarışmak sizi nasıl etkiler?", options: ["Birbirimizi geliştiririz", "Heyecan verir", "Gerilim yaratır", "Asla aynı alanda yarışmayız"] },
            { id: 325, text: "Gelecekte ikizinden daha başarılı olursan?", options: ["Onu da desteklerim", "Hakkımdır sevinirim", "Ona karşı mahcup hissederim", "Başarımı saklarım"] }
        ]
    },

    // --- WEEK 4: Akademik ve Bilişsel Gelişim ---
    {
        id: "w4-t1",
        week: 4, order: 1,
        title: "Test 1: Öğrenme Stili",
        description: "Bilgiyi nasıl işlediğini keşfet.",
        questions: [
            { id: 401, text: "Ders çalışırken yanınızda birinin olmasını ister misin?", options: ["Asla, yalnız daha iyiyim", "Bazen sessizce olabilir", "İkizim yanımda olmalı", "Mutlaka beraber çalışırız"] },
            { id: 402, text: "Bir konuyu en iyi nasıl anlarsın?", options: ["Okuyarak ve not tutarak", "Dinleyerek", "Yaparak ve yaşayarak", "İkizimin anlatmasıyla"] },
            { id: 403, text: "Farklı bir sınıfta olsaydın notların nasıl olurdu?", options: ["Daha iyi olurdu", "Fark etmezdi", "Biraz düşerdi", "Okula bile gitmek istemezdim"] },
            { id: 404, text: "Öğretmenin bir hata yaptığında uyarır mısın?", options: ["Hemen uyarırım", "İkizime sorarım doğru mu diye", "Kimse duymazken söylerim", "Asla uyarmam"] },
            { id: 405, text: "Sınav başarını neye borçlusun?", options: ["Kendi azmime", "İkizimle çalışmama", "Şansa", "Ona"] }
        ]
    },
    {
        id: "w4-t2",
        week: 4, order: 2,
        title: "Test 2: Dikkat ve Odaklanma",
        description: "Bireysel konsantrasyon gücünü ölç.",
        questions: [
            { id: 411, text: "İkizin başka bir işle uğraşırken sen ders çalışabilir misin?", options: ["Çok rahat", "Biraz zorlanarak", "Dikkatim dağılır", "Bırakıp yanına giderim"] },
            { id: 412, text: "Okuduğun bir kitabı ikizine anlatırken ne hissedersin?", options: ["Kendi yorumumu katarım", "Özetini geçerim", "Onun da okumasını beklerim", "Sıkılırım, anlatmam"] },
            { id: 413, text: "Bulmaca çözerken yardım ister misin?", options: ["Son ana kadar uğraşırım", "Zorlanınca ikizime sorarım", "Ebeveynime sorarım", "Hemen yardım isterim"] },
            { id: 414, text: "Kendi başına yeni bir dil veya beceri öğrenmek sence?", options: ["Harika bir fikir", "Zaman alır ama yaparım", "Zor ve sıkıcı", "İkizim yoksa öğrenmem"] },
            { id: 415, text: "Zaman yönetimin nasıldır?", options: ["Kendi planımı yaparım", "Onun planına uyarım", "Doğaçlama", "Her şeyi son ana bırakırız"] }
        ]
    },
    {
        id: "w4-t3",
        week: 4, order: 3,
        title: "Test 3: Karar Verme Süreçleri",
        description: "Kritik anlardaki bağımsızlığın.",
        questions: [
            { id: 421, text: "Önemli bir karar alırken ilk kimin fikrini sorarsın?", options: ["Kendi iç sesimin", "Dijital rehberlerin", "Ebeveynimin", "İkizimin"] },
            { id: 422, text: "Hata yaptığında sorumluluğu üstlenir misin?", options: ["Evet, tamamen bana ait", "Kısmen kadere atarım", "Beraber yaptık derim", "Onun üzerine atarım"] },
            { id: 423, text: "Bir oyunun kurallarını kim belirler?", options: ["Kurallara hepimiz uyarız", "Fikrimi söylerim", "O ne derse o olur", "Kuralları sevmem"] },
            { id: 424, text: "Yeni bir teknolojik aleti ilk kim kullanır?", options: ["Ben, keşfetmeyi severim", "Kurcalayarak öğrenirim", "İkizimin çözmesini beklerim", "Babamın/Annemin"] },
            { id: 425, text: "Risk almayı sever misin?", options: ["Evet, heyecan verici", "Ölçülü riskler", "Asla risk almam", "İkizim alıyorsa alırım"] }
        ]
    },

    // --- WEEK 5: Çatışma Çözümü ve Uyum ---
    {
        id: "w5-t1",
        week: 5, order: 1,
        title: "Test 1: Kriz Yönetimi",
        description: "Baskı altında nasıl davranıyorsun?",
        questions: [
            { id: 501, text: "Bir oyuncağınız bozulduğunda ilk ne yaparsın?", options: ["Tamir etmeye çalışırım", "Yeni aldırırım", "Ağlarım", "İkizime veririm o yapsın"] },
            { id: 502, text: "Yolunuzu kaybettiğinizde tepkin ne olur?", options: ["Haritaya bakarım/Sorarım", "Sakin kalmaya çalışırım", "Panik yaparım", "İkizimin arkasına saklanırım"] },
            { id: 503, text: "İkizin bir kaza yapsa (ufak bir düşme gibi) ilk tepkin?", options: ["Hemen yardım ederim", "Sakinleştiririm", "Ben de panik yaparım", "Gülürüm/Kızarım"] },
            { id: 504, text: "Para biriktirme konusunda nasılsın?", options: ["Kendi kumbaram var", "Bazen harcarım", "Ortak kumbara", "Hiç param yok"] },
            { id: 505, text: "Planlar bozulunca ne yaparsın?", options: ["Yeni plan yaparım", "Keyfim kaçar", "Ona sorarım ne yapalım diye", "Günü boş geçiririm"] }
        ]
    },
    {
        id: "w5-t2",
        week: 5, order: 2,
        title: "Test 2: Empati ve Empati Sınırı",
        description: "Anlayış ve bireysellik dengesi.",
        questions: [
            { id: 511, text: "İkizinin bir sırrını bilmek seni rahatsız eder mi?", options: ["Hayır, bilmeliyim", "Merak ederim", "Onun özeli kalsın isterim", "Zaten her şeyi biliyorum"] },
            { id: 512, text: "Onun bir hatasına başkası kızsa savunur musun?", options: ["Haksızsa savunmam", "Hatasını söylerim sonra savunurum", "Koşulsuz savunurum", "Birlikte kızarım"] },
            { id: 513, text: "Bireysel başarı mı daha tatlı ortak başarı mı?", options: ["Bireysel, çünkü 'ben' yaptım", "Fark etmez", "İkisi de güzel", "Ortak, paylaşılan daha iyi"] },
            { id: 514, text: "İkizine bir sürpriz yapmak senin için?", options: ["Çok keyifli", "Bazen yaparım", "Unuturum", "Gerek yok o her şeyi biliyor"] },
            { id: 515, text: "Onun seni en çok etkileyen yönü nedir?", options: ["Güçlü karakteri", "Zekası", "Desteği", "Sadece yanımda olması"] }
        ]
    },
    {
        id: "w5-t3",
        week: 5, order: 3,
        title: "Test 3: İşbirliği Yeteneği",
        description: "İki beyin birleşince ne oluyor?",
        questions: [
            { id: 521, text: "Bir yapbozu beraber tamamlarken ne hissedersin?", options: ["Uyumlu ve hızlı", "Bazen çatışmalı", "Zorlayıcı", "O yapsın ben izlerim"] },
            { id: 522, text: "Fikir ayrılığına düştüğünüzde nasıl çözersiniz?", options: ["Tartışarak ortak nokta buluruz", "Kura çekeriz", "Eğilim kimdeyse ona uyarız", "Çözemeyiz, küseriz"] },
            { id: 523, text: "İkizin bir şeyi yanlış yapınca ne dersin?", options: ["'Bunu şöyle dene' derim", "Hemen düzeltirim", "Alay ederim", "Hiç müdahale etmem"] },
            { id: 524, text: "Takım oyunlarında beraber mi oynamayı seversiniz?", options: ["Farklı takımlarda olmak heyecanlı", "Uyumumuz iyidir ama gerek yok", "Mutlaka aynı takımda", "Yanımda değilse oynamam"] },
            { id: 525, text: "Sizce dünyanın en iyi ekibi misiniz?", options: ["Kendi alanlarımızda evet", "Çok iyi bir ekibiz", "İdare eder", "Beraber bir şey yapamayız"] }
        ]
    },

    // --- WEEK 6: Gelecek Planlaması ve Bireyselleşme ---
    {
        id: "w6-t1",
        week: 6, order: 1,
        title: "Test 1: Kariyer ve Hayaller",
        description: "Gelecek planlamandaki özerklik.",
        questions: [
            { id: 601, text: "Farklı bir şehirde üniversite okumak ister miydin?", options: ["Evet, özgürlük için", "Zaman zaman düşünüyorum", "Çok zorlanırım", "İkizim yoksa asla gitmem"] },
            { id: 602, text: "Kariyer seçiminde senin için en önemli kriter?", options: ["Kendi yeteneklerim", "Geleceği parlak olması", "Ailemin ve ikizimin desteği", "Onunla aynı işi yapmak"] },
            { id: 603, text: "Gelecekte farklı ülkelerde olsanız bağınız ne olur?", options: ["İletişimimiz hiç kopmaz", "Eskiye göre zayıflar", "Görüntülü konuşuruz", "Düşüncesi bile kötü"] },
            { id: 604, text: "Kendini 10 yıl sonra nerede görüyorsun?", options: ["Kendi hayalimi gerçekleştirmiş olarak", "Bağımsız bir birey", "İkizimle ortak iş kurmuş", "Onun yanında"] },
            { id: 605, text: "Kendi başarı hikayeni mi yazmak istersin?", options: ["Evet, imzamla", "Destek alarak", "Ortak bir hikaye", "Başkası yazsın"] }
        ]
    },
    {
        id: "w6-t2",
        week: 6, order: 2,
        title: "Test 2: Değişim ve Dönüşüm",
        description: "6 haftalık serüvenin özeti.",
        questions: [
            { id: 611, text: "Bu süreçte kendini daha iyi tanıdın mı?", options: ["Kesinlikle, farkındalığım arttı", "Genelde evet", "Biraz", "Aynıyım"] },
            { id: 612, text: "Programa başlamadan önce 'biz' diyorken şimdi?", options: ["'Ben' demeyi öğrendim", "'Ben' ve 'Biz' dengelendi", "Hala 'Biz' diyormuşum gibi", "Sıradan bir süreçti"] },
            { id: 613, text: "En çok hangi modül seni etkiledi?", options: ["Kimlik Gelişimi", "Sosyal İlişkiler", "Gelecek Planlaması", "Duygusal Bağımsızlık"] },
            { id: 614, text: "Kendini ne kadar cesur hissediyorsun?", options: ["Tek başıma dünyayı fethedecek kadar", "Sevdiklerimle olunca evet", "Normale göre daha iyi", "Çekingen"] },
            { id: 615, text: "Artık başkaları seni karıştırınca?", options: ["Artık bu benim sorunum değil derim", "Daha az bozuluyorum", "Hemen düzeltirim", "Alıştım"] }
        ]
    },
    {
        id: "w6-t3",
        week: 6, order: 3,
        title: "Test 3: Mezuniyet Hazırlığı",
        description: "Hayata atılmaya hazır mısın?",
        questions: [
            { id: 621, text: "Bu platformdan sonra ne yapacaksın?", options: ["Öğrendiklerimi uygulayacağım", "Günlük tutmaya devam", "Arada girerim", "Her şeyi unuturum"] },
            { id: 622, text: "İkizine teşekkür etmek ister misin?", options: ["Yanımda olduğu için teşekkürler", "İkimize de teşekkür ederim", "Gerek yok", "Ona her zaman yanındayım derim"] },
            { id: 623, text: "Kendi yolunda yürümeye hazır mısın?", options: ["Evet, bütün kalbimle", "Heyecanlıyım ama korkuyorum", "Yavaş yavaş", "Hazır değilim"] },
            { id: 624, text: "Liderlik ettiğin bir geleceğe ne dersin?", options: ["Çok isterim", "Zaman gösterir", "Biraz korkutucu", "Fikrim yok"] },
            { id: 625, text: "Son bir söz seç!", options: ["Ben benim, sen sensin", "Güzel bir serüvendi", "Teşekkürler", "Kalıcıyız"] }
        ]
    }
];
