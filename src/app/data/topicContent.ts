export interface WeeklyModule {
  week: number;
  id: string;
  title: string;
  description: string;
  content: string;
}

export const weeksContent: WeeklyModule[] = [
  {
    week: 1,
    id: 'kimlik-gelisimi',
    title: 'Hafta 1: Kimlik Gelişimi ve Farkındalık',
    description: 'İkizlerin bireysel kimliklerini keşfetme yolculuğu başlıyor.',
    content: `
      İkizlerin %78'inin 6-12 yaş arasında bireysel kimlik arayışına girdiği bilinmektedir. 
      Bu hafta, "ben" ve "biz" kavramlarını ayırarak çocuğunuzun kendine has özelliklerini keşfetmesine odaklanacağız.
      
      Hedefler:
      • Bireysel ilgi alanlarını belirleme
      • Fiziksel ve karakteristik farkları kutlama
      • "İkizim" etiketi olmadan kendini tanıtma egzersizleri
    `
  },
  {
    week: 2,
    id: 'sosyal-iliskiler',
    title: 'Hafta 2: Sosyal İlişkiler ve Sınırlar',
    description: 'Arkadaşlık ilişkileri ve sosyal çevre oluşturma.',
    content: `
      İkizlerin %85'i okul öncesinde birbirine bağımlıyken, 7-12 yaş arasında bağımsız arkadaşlıklar kurmaya başlar.
      Bu hafta, ortak arkadaşlar ile bireysel arkadaşlıklar arasındaki dengeyi kurmayı öğreneceğiz.
      
      Hedefler:
      • Bireysel oyun saatleri düzenleme
      • Farklı arkadaş gruplarıyla vakit geçirme
      • "Birlikte" ve "Ayrı" zaman dengesi
    `
  },
  {
    week: 3,
    id: 'duygusal-gelisim',
    title: 'Hafta 3: Duygusal Bağımsızlık',
    description: 'Duyguları tanıma ve bireysel ifade etme.',
    content: `
      İkizlerin %65'i birbirlerinin hislerini kendi hissi gibi yaşayabilir. 
      Bu hafta, duygusal bulaşmayı (emotional contagion) yönetmeyi ve kendi duygularını sahiplenmeyi çalışacağız.
      
      Hedefler:
      • Duygu günlüğü tutma
      • "Benim hissettiğim" vs "Kardeşimin hissettiği" ayrımı
      • Empati kurarken kendi sınırlarını koruma
    `
  },
  {
    week: 4,
    id: 'akademik-gelisim',
    title: 'Hafta 4: Akademik ve Bilişsel Gelişim',
    description: 'Öğrenme stilleri ve okul başarısı.',
    content: `
      İkizlerin %55'i farklı öğrenme stillerine sahiptir. 
      Bu hafta, kıyaslamadan uzak, her çocuğun kendi potansiyelini gerçekleştirebileceği bir öğrenme ortamı yaratacağız.
      
      Hedefler:
      • Bireysel çalışma alanları oluşturma
      • Kıyaslama içeren cümlelerden kaçınma (Ebeveynler için)
      • Farklı yetenek alanlarını keşfetme (Sayısal vs Sözel)
    `
  },
  {
    week: 5,
    id: 'catisma-cozumu',
    title: 'Hafta 5: Çatışma Çözümü ve Uyum',
    description: 'Sağlıklı tartışma ve problem çözme becerileri.',
    content: `
      Her kardeş ilişkisinde çatışma doğaldır. İkizlerde bu rekabet daha yoğun olabilir.
      Bu hafta, sağlıklı rekabet ile yıkıcı kıskanclık arasındaki farkı ve çatışma çözme stratejilerini ele alacağız.
      
      Hedefler:
      • "Kazan-Kazan" stratejileri
      • Sıra alma ve paylaşma kuralları
      • Bireysel alana saygı duyma
    `
  },
  {
    week: 6,
    id: 'gelecek-planlamasi',
    title: 'Hafta 6: Gelecek Planlaması ve Bireyselleşme',
    description: 'Uzun vadeli hedefler ve özerk bireyler olma.',
    content: `
      Ergenlik ve yetişkinliğe doğru giden yolda, iki ayrı birey olarak geleceği planlamak.
      Bu son haftada, edindiğimiz tüm becerileri birleştirerek uzun vadeli bireyselleşme haritamızı çıkaracağız.
      
      Hedefler:
      • Gelecek hayalleri panosu (Vision Board)
      • Ayrışma kaygısı ile baş etme
      • Program sonu değerlendirmesi
    `
  }
];