const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  // 1. Clear existing events
  console.log("Clearing database...");
  await prisma.event.deleteMany({});

  const events = [
    {
      title: "Bandung Cosplay Party 2026",
      description: "Gathering komunitas cosplayer terbesar di Jawa Barat. Menampilkan lomba cosplay, anisong, dan booth merchandise.",
      location_name: "Bandung Electronic Center (BEC)",
      start_date: "2026-06-15",
      end_date: "2026-06-15",
      time: "10:00 - 19:00",
      htm: "Rp 25.000",
      source_url: "https://instagram.com/eventslayer_example",
      posterUrl: "/placeholder.svg",
      approved: true,
      cropX: 50.0,
      cropY: 20.0,
    },
    {
      title: "J-Festival UNPAD Jatinangor",
      description: "Festival kebudayaan Jepang yang diselenggarakan oleh mahasiswa UNPAD. Ada lomba makan ramen dan parade yukata.",
      location_name: "Kampus UNPAD Jatinangor",
      start_date: "2026-05-30",
      end_date: "2026-05-31",
      time: "09:00 - Selesai",
      htm: "Gratis",
      source_url: "https://instagram.com/unpad_example",
      posterUrl: "/placeholder.svg",
      approved: true,
      cropX: 0.0,
      cropY: 0.0,
    },
    {
      title: "Animetoku Convention",
      description: "Pameran figurin, gunpla, dan tokusatsu. Temui kolektor dari seluruh Indonesia di Bandung.",
      location_name: "Sudirman Grand Ballroom",
      start_date: "2026-07-10",
      end_date: "2026-07-12",
      time: "10:00 - 21:00",
      htm: "Rp 50.000",
      source_url: "https://instagram.com/animetoku_bdg",
      posterUrl: "/placeholder.svg",
      approved: false,
      cropX: 50.0,
      cropY: 50.0,
    },
    {
      title: "Manga & Art Workshop Bandung",
      description: "Belajar menggambar manga bersama ilustrator profesional. Sesi terbatas untuk 50 peserta.",
      location_name: "Creative Hub Bandung",
      start_date: "2026-08-05",
      end_date: "2026-08-05",
      time: "13:00 - 17:00",
      htm: "Rp 150.000 (Include Tool)",
      source_url: "https://instagram.com/bch_bdg",
      posterUrl: "/placeholder.svg",
      approved: true,
      cropX: 10.0,
      cropY: 80.0,
    },
    {
      title: "Community Gathering Cosplayer Bandung",
      description: "Sesi foto bareng dan diskusi santai mengenai pembuatan kostum prop di Bandung.",
      location_name: "Taman Film Bandung",
      start_date: "2026-06-20",
      end_date: "2026-06-20",
      time: "15:00 - 18:00",
      htm: "Gratis",
      source_url: "https://instagram.com/cosbdg_community",
      posterUrl: "/placeholder.svg",
      approved: false,
      cropX: 0.0,
      cropY: 0.0,
    },
  ];

  console.log("Seeding events...");
  for (const event of events) {
    await prisma.event.create({
      data: event,
    });
  }

  console.log("Seeding completed successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
