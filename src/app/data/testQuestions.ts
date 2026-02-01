
export const weeklyTests = [
    {
        id: 1,
        title: "1. Hafta: İkiz Bağı ve Farkındalık",
        description: "İkizinle olan ilişkinin sınırlarını ve derinliğini keşfet.",
        locked: false,
        questions: [
            { id: 101, text: "İkizinle aynı kıyafeti giymekten ne kadar hoşlanırsın?", options: ["Hiç hoşlanmam", "Bazen uyarım", "Farketmez", "Çok severim"] },
            { id: 102, text: "Biri sizi karıştırdığında ne hissedersin?", options: ["Kızarım", "Düzeltirim", "Güler geçerim", "Hoşuma gider"] },
            { id: 103, text: "Kendi başına bir karar alırken ikizine danışma ihtiyacı duyar mısın?", options: ["Asla", "Nadiren", "Sık sık", "Her zaman"] },
            { id: 104, text: "İkizin olmadan bir sosyal ortama girdiğinde kendini nasıl hissedersin?", options: ["Çok rahat", "Biraz eksik", "Gergin", "Girmem"] },
            { id: 105, text: "İkizinin başarısını tamamen kendi başarınız gibi hisseder misiniz?", options: ["Hayır, o onun başarısı", "kısmen", "Evet, biz biriz", "Kesinlikle"] },
            { id: 106, text: "Gelecek planlarınız ne kadar ortak?", options: ["Tamamen farklı", "Benzer yönler var", "Çoğu ortak", "Birebir aynı"] },
            { id: 107, text: "Birisi sadece seninle konuşmak istediğinde ikizini de dahil etmeye çalışır mısın?", options: ["Hayır", "Bazen", "Genellikle", "Evet"] },
            { id: 108, text: "Duygusal bir sorun yaşadığında ilk kime koşarsın?", options: ["Arkadaşıma", "Aileme", "Kendi içime", "İkizime"] },
            { id: 109, text: "Kendi odanın/alanının olmasını ne kadar önemsiyorsun?", options: ["Çok önemli", "Olsa iyi olur", "Farketmez", "Aynı odayı isterim"] },
            { id: 110, text: "İkizinizle aranızda gizli bir dil var mı?", options: ["Yok", "Birkaç kelime", "Bazen anlaşırız", "Evet, sürekli"] },
            { id: 111, text: "İkiziniz üzgün olduğunda sebebini sormadan anlar mısınız?", options: ["Hayır", "Bazen", "Çoğunlukla", "Her zaman"] },
            { id: 112, text: "Farklı hobiler edinmek sizin için ne kadar kolay?", options: ["Çok kolay", "Denedim ama bıraktım", "Zor", "İstemem"] }
        ]
    },
    {
        id: 2,
        title: "2. Hafta: Sınırlar ve Özel Alan",
        description: "Kişisel sınırlarını koruma ve mahremiyet yönetimi.",
        locked: true,
        questions: [
            { id: 201, text: "İkizin eşyalarını izinsiz aldığında tepkin ne olur?", options: ["Çok sert uyarırım", "İsterse veririm", "Görmezden gelirim", "Zaten her şeyimiz ortak"] },
            { id: 202, text: "Günlük tutuyor musun ve bunu ikizinden saklıyor musun?", options: ["Evet, saklarım", "Yazarım ama okuyabilir", "Yazmam", "Ortak günlüğümüz var"] },
            { id: 203, text: "Odanızın kapısını kilitler misin?", options: ["Sık sık", "Bazen", "Gerek yok", "Kapımız hep açık"] },
            { id: 204, text: "Telefonda konuşurken ikizinin yanında rahat mısın?", options: ["Özelimi konuşmam", "Rahat sayılırım", "Farketmez", "Her şeyi duyar"] },
            { id: 205, text: "Arkadaşlarınla buluşurken ikizinin gelmesini ister misin?", options: ["Hayır, özel zamanım", "Bazen", "Genelde", "Hep birlikteyiz"] },
            { id: 206, text: "İkizin sana ait bir sırrı başkasına söylese?", options: ["Asla affetmem", "Kızarım", "Üzülürüm", "Sorun olmaz"] },
            { id: 207, text: "Kıyafet dolaplarınız ayrılması teklif edilse?", options: ["Hemen kabul ederim", "Olabilir", "Gerek yok", "İstemem"] },
            { id: 208, text: "Banyodayken ikizinin girmesine izin verir misin?", options: ["Asla", "Acilse", "Bazen", "Sorun değil"] },
            { id: 209, text: "İkizinin senin yerine karar vermesi seni rahatsız eder mi?", options: ["Çok eder", "Biraz", "Yükümü hafifletir", "Hoşuma gider"] },
            { id: 210, text: "Sınırlarını ihlal ettiğinde bunu ona söyleyebiliyor musun?", options: ["Hemen", "Zorlanarak", "Dolaylı yoldan", "Söylemem"] }
        ]
    },
    {
        id: 3,
        title: "3. Hafta: Sosyal Çevre ve Arkadaşlık",
        description: "Bağımsız sosyal ilişkiler kurma becerisi.",
        locked: true,
        questions: [
            { id: 301, text: "Sadece sana ait (ikizinin tanımadığı) arkadaşların var mı?", options: ["Çok var", "Birkaç tane", "Yok ama istiyorum", "Gerek yok"] },
            { id: 302, text: "Bir partide ikizinden ayrı takılabilir misin?", options: ["Evet, dağılırım", "Kısa süre", "Gözüm onu arar", "Yanından ayrılmam"] },
            { id: 303, text: "Okulda/işte farklı gruplara girmek seni korkutur mu?", options: ["Heyecanlandırır", "Biraz", "Endişelenirim", "Asla yapmam"] },
            { id: 304, text: "İkizinin sevmediği bir arkadaşınla görüşmeye devam eder misin?", options: ["Elbette", "Gizli görüşürüm", "Azaltırım", "Görüşmeyi keserim"] },
            { id: 305, text: "Sosyal medyada ortak hesap mı kullanıyorsunuz?", options: ["Hayır, ayrı", "Hem ayrı hem ortak", "İsmi benzer", "Evet, ortak"] },
            { id: 306, text: "Yeni biriyle tanışırken kendini 'ikiz' olarak mı tanıtırsın?", options: ["İsmimle", "Sonradan söylerim", "Bazen", "Hemen ikizimden bahsederim"] },
            { id: 307, text: "Arkadaş grubunda 'ikizler' diye çağrılmak rahatsız eder mi?", options: ["Çok", "Biraz", "Alıştım", "Hoşuma gider"] },
            { id: 308, text: "Başkalarının sizi kıyaslamasına nasıl tepki verirsin?", options: ["Sustururum", "Umursamam", "Rahatsız olurum", "Doğal karşılarım"] },
            { id: 309, text: "İkizinle rekabet eder misin?", options: ["Hayır", "Tatlı bir rekabet", "Bazen sertleşir", "Evet, sürekli"] },
            { id: 310, text: "Bir arkadaşınız ikinizi ayırmaya çalışsa?", options: ["Arkadaşlığımı bitiririm", "Sebebini sorarım", "İkizimi savunurum", "Normal karşılarım"] }
        ]
    },
    {
        id: 4,
        title: "4. Hafta: Duygusal Ayrışma",
        description: "Kendi duygularını tanıma ve yönetme.",
        locked: true,
        questions: [
            { id: 401, text: "İkizin ağladığında sebebini bilmesen de ağlar mısın?", options: ["Hayır", "Üzülürüm", "Gözlerim dolar", "Evet"] },
            { id: 402, text: "Kendi mutluluğunu onun mutsuzluğu pahasına seçebilir misin?", options: ["Evet", "Zorlanırım", "Çok zor", "Asla"] },
            { id: 403, text: "Duygularını ifade ederken 'biz' yerine 'ben' dilini kullanır mısın?", options: ["Hep", "Genelde", "Bazen", "Nadiren"] },
            { id: 404, text: "İkizine öfkelendiğinde bunu yaşayabilir misin yoksa hemen bastırır mısın?", options: ["Yaşarım", "Konuşurum", "Bastırırım", "Yansıtmam"] },
            { id: 405, text: "Yalnız kalmak sana nasıl hissettirir?", options: ["Özgür", "Normal", "Sıkıcı", "Korkutucu"] },
            { id: 406, text: "İkizinin onayı olmadan bir kıyafet alabilir misin?", options: ["Rahatlıkla", "Tereddütle", "Fikir sorarım", "Alamam"] },
            { id: 407, text: "Kendini suçlu hissetmeden ikizine 'hayır' diyebilir misin?", options: ["Evet", "Bazen", "Zorlanırım", "Diyemem"] },
            { id: 408, text: "İkizinin başarısızlığı senin gününü mahveder mi?", options: ["Hayır", "Üzülürüm", "Etkiler", "Mahveder"] },
            { id: 409, text: "Kendi duygusal ihtiyaçlarını önceliklendirebiliyor musun?", options: ["Evet", "Çabalıyorum", "Nadiren", "Önce o gelir"] },
            { id: 410, text: "İkizin yokken kendini 'yarım' hissediyor musun?", options: ["Hayır, tamım", "Biraz eksik", "Boşlukta", "Evet"] }
        ]
    },
    {
        id: 5,
        title: "5. Hafta: Karar Verme ve Sorumluluk",
        description: "Bağımsız kararlar alabilme yetisi.",
        locked: true,
        questions: [
            { id: 501, text: "Restoranda yemeğini ikizin mi seçer?", options: ["Kendim seçerim", "Fikir alırım", "Bazen", "O seçer"] },
            { id: 502, text: "Gelecek mesleğini seçerken kimden etkilendin?", options: ["Tamamen kendim", "Ailem", "Çevrem", "İkizim"] },
            { id: 503, text: "Hatalarının sorumluluğunu üstlenir misin?", options: ["Evet", "Genelde", "Bazen suçu atarım", "Biz yaptık derim"] },
            { id: 504, text: "Zor bir durumda inisiyatif alabilir misin?", options: ["Hemen", "Biraz beklerim", "Başkasına bakarım", "İkizime bırakırım"] },
            { id: 505, text: "Kendi paranı yönetebiliyor musun?", options: ["Evet", "Öğreniyorum", "Ortak kasa", "O yönetir"] },
            { id: 506, text: "Tatile nereye gideceğinize kim karar verir?", options: ["Ben/Ortak", "Sırayla", "Tartışarak", "İkizim"] },
            { id: 507, text: "Siyasi veya sosyal görüşlerin ikizinle aynı mı?", options: ["Farklı olabilir", "Benzer", "Çok yakın", "Aynı"] },
            { id: 508, text: "Bir konuda ikna edilmek kolay mıdır?", options: ["Zordur", "Mantıklıysa", "Kişiye bağlı", "İkizimse evet"] },
            { id: 509, text: "Risk almaktan korkar mısın?", options: ["Hayır", "Hesaplarım", "Çekinirim", "Yalnızsam evet"] },
            { id: 510, text: "Kendi hayatının kaptanı kim?", options: ["Ben", "Kader", "Ailem", "İkizimle biz"] }
        ]
    },
    {
        id: 6,
        title: "6. Hafta: Kimlik Sentezi ve Gelecek",
        description: "Bütünleşmiş ve ayrışmış bir benlik algısı.",
        locked: true,
        questions: [
            { id: 601, text: "Kendini 3 kelimeyle anlat desek, ikizinle aynı kelimeleri mi seçersin?", options: ["Tamamen farklı", "Belki biri aynı", "Benzer", "Aynı"] },
            { id: 602, text: "10 yıl sonra ikizinden ayrı bir şehirde yaşamayı düşünebilir misin?", options: ["Evet, heyecan verici", "Olabilir", "Zorunluysa", "Asla"] },
            { id: 603, text: "İkiz olmak hayatının ne kadarını tanımlıyor?", options: ["Sadece bir parça", "Önemli bir kısım", "Büyük kısmı", "Her şeyi"] },
            { id: 604, text: "Kendini 'tekil' bir birey olarak görebiliyor musun?", options: ["Evet", "Çoğunlukla", "Bazen", "Zorlanıyorum"] },
            { id: 605, text: "Başkalarının seni ikizinle karıştırması artık seni üzüyor mu?", options: ["Gülüyorum", "Umursamıyorum", "Biraz", "Evet"] },
            { id: 606, text: "Kendi imajın (tarzın, saçın) oturdu mu?", options: ["Evet, özgünüm", "Gelişiyor", "Hala benziyoruz", "Aynıyız"] },
            { id: 607, text: "İkizine olan bağın sana güç mü veriyor yoksa seni kısıtlıyor mu?", options: ["Güç veriyor (Bağımsızım)", "Dengeli", "Biraz kısıtlıyor", "Kısıtlıyor"] },
            { id: 608, text: "Hayatındaki en önemli kişi kendin misin?", options: ["Evet", "Maneviyatla", "Ailem", "İkizim"] },
            { id: 609, text: "Bu 6 haftalık süreçte değiştiğini hissediyor musun?", options: ["Çok değiştim", "Farkındalığım arttı", "Biraz", "Aynıyım"] },
            { id: 610, text: "Geleceğe tek başına yürümeye hazır mısın?", options: ["Kesinlikle", "Hazırlanıyorum", "Endişeliyim", "Henüz değil"] }
        ]
    }
];
