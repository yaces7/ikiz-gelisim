export interface WeeklyModule {
  week: number;
  id: string;
  title: string;
  description: string;
  content: string;
  activities: string[];
  parentTip: string;
}

export const weeksContent: WeeklyModule[] = [
  {
    week: 1,
    id: 'kimlik-gelisimi',
    title: 'Hafta 1: Kimlik Gelişimi ve Farkındalık',
    description: 'İkizlerin bireysel kimliklerini keşfetme yolculuğu başlıyor.',
    content: `İkizlerin %78'inin 6-12 yaş arasında bireysel kimlik arayışına girdiği bilinmektedir. Bu hafta, "ben" ve "biz" kavramlarını ayırarak çocuğunuzun kendine has özelliklerini keşfetmesine odaklanacağız.`,
    activities: [
      'Bireysel ilgi alanlarını belirleme egzersizi',
      'Aynada kendine bakarak farklılıklarını listeleme',
      '"İkizim" etiketi olmadan kendini tanıtma çalışması'
    ],
    parentTip: 'Çocuklarınıza "ikizler" diye hitap etmek yerine isimlerini ayrı ayrı kullanmaya özen gösterin.'
  },
  {
    week: 2,
    id: 'sosyal-iliskiler',
    title: 'Hafta 2: Sosyal İlişkiler ve Sınırlar',
    description: 'Arkadaşlık ilişkileri ve sosyal çevre oluşturma.',
    content: `İkizlerin %85'i okul öncesinde birbirine bağımlıyken, 7-12 yaş arasında bağımsız arkadaşlıklar kurmaya başlar. Bu hafta, ortak arkadaşlar ile bireysel arkadaşlıklar arasındaki dengeyi kurmayı öğreneceğiz.`,
    activities: [
      'Bireysel oyun saatleri düzenleme',
      'Farklı bir arkadaşla tek başına buluşma',
      'Kendi özel alanını (oda, çekmece) belirleme'
    ],
    parentTip: 'Farklı hobileri ve arkadaş grupları edinmeleri için onları cesaretlendirin.'
  },
  {
    week: 3,
    id: 'duygusal-gelisim',
    title: 'Hafta 3: Duygusal Bağımsızlık',
    description: 'Duyguları tanıma ve bireysel ifade etme.',
    content: `İkizlerin %65'i birbirlerinin hislerini kendi hissi gibi yaşayabilir. Bu hafta, duygusal bulaşmayı yönetmeyi ve kendi duygularını sahiplenmeyi çalışacağız.`,
    activities: [
      'Duygu günlüğü tutma (platform üzerinden)',
      '"Bu his benim mi, kardeşimin mi?" sorgulaması',
      'Duygusal sınır koyma pratikleri'
    ],
    parentTip: 'Biri üzüldüğünde diğerinin de otomatik olarak üzülmesini beklemeyin, duyguların ayrışmasına izin verin.'
  },
  {
    week: 4,
    id: 'akademik-gelisim',
    title: 'Hafta 4: Akademik ve Bilişsel Gelişim',
    description: 'Öğrenme stilleri ve okul başarısı.',
    content: `İkizlerin %55'i farklı öğrenme stillerine sahiptir. Bu hafta, kıyaslamadan uzak, her çocuğun kendi potansiyelini gerçekleştirebileceği bir öğrenme ortamı yaratacağız.`,
    activities: [
      'Bireysel çalışma alanı ve saati oluşturma',
      'Kendi öğrenme stilini keşfetme (Görsel, İşitsel, Dokunsal)',
      'Notlar ve başarılar üzerinden rekabeti azaltma'
    ],
    parentTip: 'Başarılarını kıyaslamaktan kaçının; "Kardeşin yaptı sen niye yapmadın?" cümlesini lügatınızdan çıkarın.'
  },
  {
    week: 5,
    id: 'catisma-cozumu',
    title: 'Hafta 5: Çatışma Çözümü ve Uyum',
    description: 'Sağlıklı tartışma ve problem çözme becerileri.',
    content: `Her kardeş ilişkisinde çatışma doğaldır. İkizlerde bu rekabet daha yoğun olabilir. Bu hafta, sağlıklı rekabet ile yıkıcı kıskanclık arasındaki farkı ve çatışma çözme stratejilerini ele alacağız.`,
    activities: [
      '"Kazan-Kazan" stratejisiyle problem çözme',
      'Sıra alma ve mülkiyet sınırlarını belirleme',
      'Sinirlenince bireysel sakinleşme teknikleri'
    ],
    parentTip: 'Çatışmalarda her zaman hakem olmayın, kendi aralarında sınır koyarak çözmelerine fırsat verin.'
  },
  {
    week: 6,
    id: 'gelecek-planlamasi',
    title: 'Hafta 6: Gelecek Planlaması ve Bireyselleşme',
    description: 'Uzun vadeli hedefler ve özerk bireyler olma.',
    content: `Ergenlik ve yetişkinliğe doğru giden yolda, iki ayrı birey olarak geleceği planlamak. Bu son haftada, edindiğimiz tüm becerileri birleştirerek uzun vadeli bireyselleşme haritamızı çıkaracağız.`,
    activities: [
      'Bireysel Gelecek Vizyonu Tablosu (Vision Board)',
      'Gelecek hayalleri üzerine bağımsız araştırma',
      'Program sonu öz-değerlendirme testi'
    ],
    parentTip: 'Gelecek planlarında (üniversite, meslek) birbirlerinden bağımsız seçim yapabilecekleri güvenini verin.'
  }
];