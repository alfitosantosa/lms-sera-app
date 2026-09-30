export function Features() {
  const domains = [
    {
      name: "Akademik",
      records:
        "Kelas, mata pelajaran, jadwal pelajaran, tahun ajaran, tugas, dan pengumpulan tugas siswa.",
      tables: [
        "Class",
        "Subject",
        "Schedule",
        "AcademicYear",
        "Assignment",
        "AssignmentSubmission",
      ],
    },
    {
      name: "Presensi",
      records:
        "Kehadiran siswa per jadwal — hadir, sakit, izin, alfa — serta check-in dan check-out guru.",
      tables: ["Attendance", "TeacherAttendance"],
    },
    {
      name: "Tahfidz",
      records:
        "Setoran ayat per surah dengan nilai A–E, katalog surah dan jumlah ayatnya, serta kelompok halaqah.",
      tables: ["TahfidzRecord", "SurahQuran", "TahfidzGroup"],
    },
    {
      name: "Keuangan",
      records:
        "Tagihan bulanan, jenis pembayaran dan nominalnya, transaksi pembayaran online, serta rekening kas tiap unit.",
      tables: [
        "Payment",
        "PaymentType",
        "PaymentItems",
        "PaymentTransaction",
        "AccountBank",
      ],
    },
    {
      name: "Penilaian & Rapor",
      records:
        "Bank soal dan pilihan jawaban, pelaksanaan ujian, jawaban siswa, nilai, serta rapor per mata pelajaran.",
      tables: [
        "Exam",
        "ExamQuestion",
        "Question",
        "QuestionOption",
        "ExamAttempt",
        "ExamAnswer",
        "Grade",
        "ReportCard",
        "GradeScale",
      ],
    },
    {
      name: "Kedisiplinan",
      records:
        "Pelanggaran siswa beserta jenis dan bobot poinnya, terekap per siswa dalam satu tahun ajaran.",
      tables: ["Violation", "ViolationType"],
    },
    {
      name: "Komunikasi",
      records:
        "Pengumuman sekolah, notifikasi ke pengguna, dan agenda kalender kegiatan yayasan maupun unit.",
      tables: ["Announcement", "Notification", "CalendarEvent"],
    },
  ];

  return (
    <section id="fitur" className="bg-background py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="border-margin max-w-[68ch] border-l-2 pl-6">
          <h2 className="font-display text-foreground text-3xl tracking-tight">
            Register modul: apa yang dicatat, dan tabel yang menyimpannya.
          </h2>
          <p className="text-muted-foreground mt-3 text-base leading-relaxed">
            Tujuh domain berjalan di atas satu basis data yang sama untuk SMP,
            SMA, dan SMK IT dalam satu yayasan. Setiap baris di bawah ini adalah
            modul yang dipakai harian oleh guru, bendahara, siswa, dan orang
            tua.
          </p>
        </div>

        <div className="mt-12 overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-border border-t-2">
                <th
                  scope="col"
                  className="font-display text-secondary-foreground py-3 pr-6 text-[11px] tracking-wide uppercase"
                >
                  Domain
                </th>
                <th
                  scope="col"
                  className="font-display text-secondary-foreground py-3 pr-8 text-[11px] tracking-wide uppercase"
                >
                  Yang dicatat
                </th>
                <th
                  scope="col"
                  className="font-display text-secondary-foreground py-3 text-[11px] tracking-wide uppercase"
                >
                  Tabel
                </th>
              </tr>
            </thead>
            <tbody>
              {domains.map((domain) => (
                <tr
                  key={domain.name}
                  className="border-border odd:bg-accent/60 border-b"
                >
                  <th
                    scope="row"
                    className="font-display text-foreground py-5 pr-6 align-top text-base font-normal tracking-tight whitespace-nowrap"
                  >
                    {domain.name}
                  </th>
                  <td className="text-secondary-foreground py-5 pr-8 align-top text-sm leading-relaxed">
                    {domain.records}
                  </td>
                  <td className="py-5 align-top">
                    <ul className="flex flex-wrap gap-x-4 gap-y-1">
                      {domain.tables.map((table) => (
                        <li
                          key={table}
                          className="font-mono text-foreground text-xs"
                        >
                          {table}
                        </li>
                      ))}
                    </ul>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-muted-foreground mt-4 text-xs">
          Nama tabel mengikuti skema basis data aplikasi.
        </p>
      </div>
    </section>
  );
}
