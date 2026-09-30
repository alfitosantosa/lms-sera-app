export function Architecture() {
  const branches = ["SMP IT", "SMA IT", "SMK IT"];

  const roles = [
    {
      name: "admin",
      scope: "Cabang",
      reach: "Data induk cabang: UserData, Role, kelas, jadwal, dan pengaturan cabang.",
    },
    {
      name: "bendahara",
      scope: "Cabang",
      reach: "Payment, PaymentType, PaymentItems, dan AccountBank cabang; verifikasi transfer dan penerbitan kuitansi.",
    },
    {
      name: "guru",
      scope: "Kelas yang diampu",
      reach: "Schedule, Attendance, Assignment, AssignmentSubmission, TahfidzRecord, Violation.",
    },
    {
      name: "siswa",
      scope: "Datanya sendiri",
      reach: "Jadwal, Attendance, tugas, ExamAttempt, dan nilai miliknya.",
    },
    {
      name: "orang tua",
      scope: "Anaknya",
      reach: "Ringkasan kehadiran, nilai rapor, tagihan Payment, dan notifikasi WhatsApp.",
    },
  ];

  return (
    <section id="arsitektur" className="bg-navy py-24 text-navy-foreground">
      <div className="mx-auto max-w-6xl px-6">
        <div className="border-t-2 border-navy-muted/60 pt-3">
          <span className="font-display text-navy-muted text-[11px] tracking-wide">
            Arsitektur data
          </span>
        </div>

        <div className="mt-8 max-w-2xl">
          <h2 className="font-display text-navy-foreground text-3xl tracking-tight">
            Satu yayasan, tiga cabang, data yang tidak pernah tertukar.
          </h2>
          <p className="text-navy-muted mt-3 max-w-[68ch] text-base leading-relaxed">
            Yayasan terdaftar sebagai satu <span className="font-mono">Foundation</span>{" "}
            yang menaungi cabang SMP, SMA, dan SMK IT. Setiap baris data
            membawa <span className="font-mono">branchId</span>, jadi isi satu
            cabang tidak pernah muncul di cabang lain — termasuk rekening kas
            dan akun adminnya yang berdiri sendiri.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div className="border-t-2 border-navy-muted/60 pt-3">
              <span className="font-display text-navy-muted text-[11px] tracking-wide">
                Struktur kepemilikan data
              </span>
            </div>

            <div className="mt-5 border border-navy-border">
              <div className="border-b border-navy-border px-5 py-3">
                <span className="text-navy-accent font-mono text-xs">
                  &lt;Foundation&gt;
                </span>
                <p className="text-navy-muted mt-1 text-xs">
                  Kode yayasan dipakai saat pendaftaran, sehingga pengguna baru
                  masuk ke yayasan yang benar.
                </p>
              </div>

              <div className="space-y-5 px-5 py-5">
                {branches.map((branch) => (
                  <div key={branch} className="border-margin border-l-2 pl-5">
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="text-navy-foreground font-display text-sm">
                        &lt;Branch&gt; {branch}
                      </span>
                      <span className="text-navy-muted font-mono text-[11px]">
                        branchId
                      </span>
                    </div>
                    <div className="mt-2 space-y-1.5 text-xs">
                      <div className="flex items-baseline gap-2">
                        <span className="text-navy-info font-mono text-[11px]">
                          &lt;AccountBank&gt;
                        </span>
                        <span className="text-navy-muted">
                          rekening kas cabang ini saja
                        </span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-navy-info font-mono text-[11px]">
                          admin
                        </span>
                        <span className="text-navy-muted">
                          akun pengelola cabang ini saja
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-navy-muted mt-4 font-mono text-[11px]">
              51 tabel data, isolasi per Foundation dan Branch
            </p>
          </div>

          <div className="lg:col-span-7">
            <div className="border-t-2 border-navy-muted/60 pt-3">
              <span className="font-display text-navy-muted text-[11px] tracking-wide">
                Peran dan jangkauan data
              </span>
            </div>

            <table className="mt-5 w-full text-left text-sm">
              <thead>
                <tr className="text-navy-muted border-b border-navy-border text-[11px]">
                  <th className="font-display py-2.5 pr-4 font-normal tracking-wide">
                    Peran
                  </th>
                  <th className="font-display py-2.5 pr-4 font-normal tracking-wide">
                    Jangkauan
                  </th>
                  <th className="font-display py-2.5 font-normal tracking-wide">
                    Yang dapat diraih
                  </th>
                </tr>
              </thead>
              <tbody>
                {roles.map((role) => (
                  <tr
                    key={role.name}
                    className="odd:bg-white/[0.04] border-b border-navy-border align-top"
                  >
                    <td className="py-3 pr-4">
                      <span className="text-navy-accent font-mono text-xs">
                        {role.name}
                      </span>
                    </td>
                    <td className="text-navy-muted py-3 pr-4 text-xs">
                      {role.scope}
                    </td>
                    <td className="text-navy-foreground py-3 text-xs leading-relaxed">
                      {role.reach}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
