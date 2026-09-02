"use client";

import { useCreateAttendanceBulk } from "@/app/(hooks)/hooks/Attendances/useBulkAttendance";
import { useBulkSendWhatsApp } from "@/app/(hooks)/hooks/BotWA/useBotWA";
import { useGetScheduleById } from "@/app/(hooks)/hooks/Schedules/useGetScheduleById";
import { useGetTahfidzGroupById } from "@/app/(hooks)/hooks/TahfidzGroup/useGetTahfidzGroupById";
import { useGetUserByIdBetterAuth } from "@/app/(hooks)/hooks/Users/useUsersByIdBetterAuth";
import Loading from "@/components/loading";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useSession } from "@/lib/authClients";
import { AlertTriangle, BookOpen, CheckCircle, Clock, MessageSquare, Send, Smartphone, User, Users } from "lucide-react";
import { StaticImport } from "next/dist/shared/lib/get-img-props";
import Image from "next/image";
import { unauthorized, useParams } from "next/navigation";
import React, { useState } from "react";
import { toast } from "sonner";

// import { useGetClassById } from "@/app/hooks/Classes/useGetClassById";
interface Student {
  id: string | number;
  name: string;
  nisn?: string | null;
  parentPhone?: string | null;
  avatarUrl?: StaticImport | undefined | string | null;
}

interface Subject {
  name: string;
}

// Status mapping to match dashboard
const STATUS_MAP = {
  present: { label: "Hadir", color: "bg-green-500" },
  absent: { label: "Tidak Hadir", color: "bg-red-500" },
  late: { label: "Terlambat", color: "bg-yellow-500" },
  excused: { label: "Izin", color: "bg-blue-500" },
  sick: { label: "Sakit", color: "bg-purple-500" },
};

function AttendanceModule() {
  const params = useParams();
  const [attendanceData, setAttendanceData] = useState<Record<string, { status: string; notes?: string; evidenceUrl?: string }>>({});
  const [sendWhatsApp, setSendWhatsApp] = useState(false);
  const [isSendingWA, setIsSendingWA] = useState(false);

  // Fetch schedule by id
  const { data: scheduleDataById = [], isLoading: isLoadingSchedule, isError: isErrorSchedule } = useGetScheduleById(params.id as string);

  // Get class ID from the first schedule item
  const classId = scheduleDataById.length > 0 ? scheduleDataById[0]?.tahfidzGroupId : null;

  // Fetch class by id from schedule
  const { data: classData, isLoading: isLoadingClass, isError: isErrorClass } = useGetTahfidzGroupById(classId as string);

  // Initialize mutation hooks
  const createAttendanceMutation = useCreateAttendanceBulk();
  const bulkSendWA = useBulkSendWhatsApp();

  const currentSession =
    scheduleDataById[0] ?
      {
        subject: scheduleDataById[0]?.subject?.name,
        class: classData?.name || "Loading...",
        time: `${scheduleDataById[0]?.startTime} - ${scheduleDataById[0]?.endTime}`,
        teacher: "Teacher: " + (scheduleDataById[0]?.teacher?.name || "Loading..."),
      }
    : null;

  const updateAttendance = (studentId: string, status: string) => {
    setAttendanceData((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], status },
    }));
  };

  // Function to format date in Indonesian
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Function to send WhatsApp notification to parents
  const sendWhatsAppNotification = async (students: Student[], attendanceInfo: Record<string, { status: string; notes?: string }>) => {
    const schedule = scheduleDataById[0];
    if (!schedule || !classData) return;

    // Filter students with parentPhone and attendance data and send if status not absent
    const studentsWithPhone = students.filter((s) => s.parentPhone && s.parentPhone.trim() !== "" && attendanceInfo[s.id]?.status !== "present");

    if (studentsWithPhone.length === 0) {
      toast.warning("Tidak ada nomor HP orang tua yang valid untuk dikirim notifikasi.");
      return;
    }

    const today = formatDate(new Date());

    // Build recipients with personalized messages
    const recipients = studentsWithPhone.map((student) => {
      const status = attendanceInfo[student.id]?.status || "unknown";
      const statusLabel = STATUS_MAP[status as keyof typeof STATUS_MAP]?.label || status;
      const notes = attendanceInfo[student.id]?.notes;

      return {
        number: student.parentPhone!,
        name: student.name,
        // We'll use a generic message template and replace placeholders
      };
    });

    // Create a message template with personalization
    // {name} will be replaced by the API for each recipient
    // Array of message templates to avoid spam detection
    const templates = [
      // Template 1: Original/Standard
      `📚 *NOTIFIKASI KEHADIRAN SISWA*

🏫 *${classData.name || "Kelas"}*
📅 *${today}*

━━━━━━━━━━━━━━━━━━━━
📖 *Mata Pelajaran:* ${schedule.subject?.name || "Pelajaran"}
⏰ *Waktu:* ${schedule.startTime} - ${schedule.endTime}
👨‍🏫 *Guru:* ${schedule.teacher?.name || "Guru"}
━━━━━━━━━━━━━━━━━━━━

Yth. Bapak/Ibu Wali Murid,

Berikut adalah informasi kehadiran putra/putri Anda:

👤 *Nama:* {name}
📊 *Status:* {status}
{notes}

Anda tidak perlu membalas pesan ini.

Terima kasih atas perhatiannya.

~IT ${process.env.NEXT_PUBLIC_CLIENT_NAME}
_Pesan ini dikirim otomatis oleh sistem._`,

      // Template 2: Formal & Concise
      `🏛️ *LAPORAN PRESENSI SISWA*

Yth. Wali Murid,

Kami menginformasikan kehadiran putra/putri Anda pada:
📅 Tanggal: ${today}
🏫 Kelas: ${classData.name || "Kelas"}
📖 Mapel: ${schedule.subject?.name || "Pelajaran"} (${schedule.startTime} - ${schedule.endTime})

--------------------------------
👤 Siswa: *{name}*
📊 Kehadiran: *{status}*
{notes}
--------------------------------

Anda tidak perlu membalas pesan ini.

Hormat kami,
Tim IT ${process.env.NEXT_PUBLIC_CLIENT_NAME}
_(Pesan Otomatis)_`,

      // Template 3: Friendly & Polite
      `👋 Assalamu'alaikum / Selamat Pagi Bapak/Ibu,

Semoga sehat selalu. Izin menyampaikan update kehadiran ananda di sekolah hari ini:

🗓️ *${today}*
📍 Kelas: *${classData.name || "Kelas"}*
📚 Pelajaran: *${schedule.subject?.name || "Pelajaran"}*
👨‍🏫 Pengajar: ${schedule.teacher?.name || "Guru"}

📌 *Detail Siswa:*
Nama: *{name}*
Status: *{status}*
{notes}

Anda tidak perlu membalas pesan ini.

Terima kasih atas kerja samanya dalam memantau pendidikan ananda. 🙏

Salam,
IT ${process.env.NEXT_PUBLIC_CLIENT_NAME}`,

      // Template 4: Bullet Points Focus
      `🔔 *INFO SEKOLAH*
Tanggal: ${today}

Bapak/Ibu Wali Murid yang kami hormati, berikut data kehadiran siswa pada jam pelajaran ini:

🔹 *Kelas:* ${classData.name || "Kelas"}
🔹 *Mapel:* ${schedule.subject?.name || "Pelajaran"}
🔹 *Waktu:* ${schedule.startTime} - ${schedule.endTime}

🔎 *Data Siswa:*
• Nama: *{name}*
• Status: *{status}*
{notes}

Anda tidak perlu membalas pesan ini.

Mohon dapat diterima dengan baik. Terima kasih.

~ Admin IT ${process.env.NEXT_PUBLIC_CLIENT_NAME} ~`,

      // Template 5: Direct & Clear
      `📢 *STATUS KEHADIRAN*
${today}

Kepada Yth. Orang Tua / Wali,

Diberitahukan bahwa pada jadwal *${schedule.subject?.name || "Pelajaran"}* (${schedule.startTime} - ${schedule.endTime}) di kelas *${classData.name || "Kelas"}*, status kehadiran ananda adalah:

👉 *{name}*
✅ *{status}*
{notes}

Anda tidak perlu membalas pesan ini.

Guru Pengampu: ${schedule.teacher?.name || "Guru"}

Terima kasih.
*IT ${process.env.NEXT_PUBLIC_CLIENT_NAME}*`,
    ];

    // Send individual messages with personalized status
    setIsSendingWA(true);
    let successCount = 0;
    let failCount = 0;

    try {
      for (const student of studentsWithPhone) {
        const status = attendanceInfo[student.id]?.status || "unknown";
        const statusLabel = STATUS_MAP[status as keyof typeof STATUS_MAP]?.label || status;
        const notes = attendanceInfo[student.id]?.notes;

        // Select a random template for this student
        const randomTemplateIndex = Math.floor(Math.random() * templates.length);
        const selectedTemplate = templates[randomTemplateIndex];

        // Personalize message for each student
        const personalizedMessage = selectedTemplate
          .replace("{name}", student.name)
          .replace("{status}", statusLabel)
          .replace("{notes}", notes ? `📝 *Catatan:* ${notes}` : "");

        try {
          await bulkSendWA.mutateAsync({
            recipients: [{ number: student.parentPhone!, name: student.name }],
            message: personalizedMessage,
            delayMs: 500,
          });
          successCount++;
        } catch (error) {
          console.error(`Failed to send WA to ${student.name}:`, error);
          failCount++;
        }

        // Small delay between messages
        await new Promise((resolve) => setTimeout(resolve, 800));
      }

      if (successCount > 0) {
        toast.success(`Berhasil mengirim ${successCount} notifikasi WhatsApp ke orang tua.`);
      }
      if (failCount > 0) {
        toast.error(`Gagal mengirim ${failCount} notifikasi WhatsApp.`);
      }
    } catch (error) {
      console.error("Error sending WhatsApp notifications:", error);
      toast.error("Gagal mengirim notifikasi WhatsApp.");
    } finally {
      setIsSendingWA(false);
    }
  };

  const saveAttendance = async () => {
    try {
      // Validate that we have schedule data
      if (!scheduleDataById[0]?.id) {
        toast.error("Error: Schedule data not available");
        return;
      }

      // Filter only students with attendance status set
      const studentsWithAttendance = Object.entries(attendanceData).filter(([_, data]) => data.status);

      if (studentsWithAttendance.length === 0) {
        toast.warning("Silakan set status kehadiran untuk minimal satu siswa.");
        return;
      }
      // Get total students
      const totalStudents = classData?.students?.length || 0;

      if (totalStudents != studentsWithAttendance.length) {
        toast.error("Ada murid yang belum di absen");
      }

      if (totalStudents === studentsWithAttendance.length) {
        const attendanceArray = studentsWithAttendance.map(([studentId, data]) => ({
          studentId,
          scheduleId: scheduleDataById[0].id,
          status: data.status, // This will now be 'present', 'absent', 'late', 'excused', or 'sick'
          notes: data.notes || null,
          date: new Date(), // This should match your database date field
        }));

        // Use the mutation with proper payload structure
        await createAttendanceMutation.mutateAsync({ attendances: attendanceArray });

        toast.success("Absensi berhasil disimpan!");

        // Send WhatsApp notifications if enabled
        if (sendWhatsApp && classData?.students) {
          toast.info("Mengirim notifikasi WhatsApp ke orang tua...");
          await sendWhatsAppNotification(classData.students, attendanceData);
        }

        // Redirect to /dashboard after success
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 2000);
      }
    } catch (error) {
      console.error("Error saving attendance:", error);
      toast.error("Error saving attendance: " + (error instanceof Error ? error.message : String(error)));
    }
  };

  const getStatusColor = (status: string) => {
    return STATUS_MAP[status as keyof typeof STATUS_MAP]?.color || "bg-gray-300";
  };

  // Get attendance statistics
  const getAttendanceStats = () => {
    const students = classData?.students || [];
    const present = students.filter((s: { id: string | number }) => attendanceData[s.id]?.status === "present").length;
    const excused = students.filter((s: { id: string | number }) => attendanceData[s.id]?.status === "excused").length;
    const sick = students.filter((s: { id: string | number }) => attendanceData[s.id]?.status === "sick").length;
    const late = students.filter((s: { id: string | number }) => attendanceData[s.id]?.status === "late").length;
    const absent = students.filter((s: { id: string | number }) => attendanceData[s.id]?.status === "absent").length;

    return { present, excused, sick, late, absent };
  };

  const stats = getAttendanceStats();

  if (isErrorSchedule || isErrorClass) {
    return (
      <>
        <div className="max-w-7xl mx-auto p-6 min-h-screen">
          <Alert className="max-w-2xl">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>Error loading data. Please try refreshing the page or contact support.</AlertDescription>
          </Alert>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="">
        {/* Mobile Attendance Interface */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Smartphone className="h-5 w-5 text-blue-600" />
              <div>
                <CardTitle>Absensi Mobile - Sesi Aktif</CardTitle>
                <CardDescription>Akses otomatis berdasarkan jadwal guru yang login</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingSchedule || isLoadingClass ?
              <Loading />
            : currentSession ?
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      {currentSession.subject}
                    </h3>
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      {currentSession.class}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-1">
                      <span className="text-sm">
                        <Badge>
                          <Clock className="text-white h-4 w-4" />
                          {currentSession.time}
                        </Badge>
                      </span>
                    </div>
                    <p className="text-xs text-gray-500"> {currentSession.teacher}</p>
                  </div>
                </div>
              </div>
            : null}

            <div className="space-y-3">
              {isLoadingClass ?
                <Loading />
              : classData?.students.map((student) => (
                  <div key={student.id} className="flex flex-wrap items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors gap-3">
                    <div className={`w-3 h-3 rounded-xl ${getStatusColor(attendanceData[student.id]?.status)}`}></div>
                    <div>
                      <div className="flex flex-wrap items-center w-full gap-2 border rounded-xl p-4">
                        <Image
                          src={student?.avatarUrl ? student.avatarUrl : "https://icons.veryicon.com/png/o/miscellaneous/rookie-official-icon-gallery/225-default-avatar.png"}
                          alt="Picture of the author"
                          width={60}
                          height={60}
                          className="rounded-lg"
                        />
                        <div>
                          <p className="font-medium flex items-center gap-3">
                            <User className="h-4 w-4 text-gray-400" />
                            {student.name}
                          </p>
                          {student.nisn && (
                            <p className="text-xs text-gray-500">
                              <Badge variant="outline" className="px-1 py-0.5">
                                NISN: {student.nisn}
                              </Badge>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 justify-center items-center">
                      {Object.entries(STATUS_MAP).map(([status, config]) => (
                        <Button key={status} size="sm" variant={attendanceData[student.id]?.status === status ? "default" : "outline"} onClick={() => updateAttendance(student.id, status)} className="text-xs px-2 py-1">
                          {config.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                ))
              }
            </div>

            <div className="mt-6 space-y-4">
              {/* WhatsApp Notification Option */}
              <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg border border-green-200">
                <Checkbox id="sendWhatsApp" checked={sendWhatsApp} onCheckedChange={(checked) => setSendWhatsApp(checked as boolean)} />
                <label htmlFor="sendWhatsApp" className="flex items-center gap-2 text-sm font-medium text-green-800 cursor-pointer">
                  <MessageSquare className="h-4 w-4" />
                  Kirim notifikasi WhatsApp ke orang tua murid
                </label>
                {sendWhatsApp && (
                  <Badge variant="secondary" className="ml-auto">
                    <Send className="h-3 w-3 mr-1" />
                    Aktif
                  </Badge>
                )}
              </div>

              <div className="flex justify-between items-center">
                <Button onClick={saveAttendance} disabled={isLoadingClass || createAttendanceMutation.isPending || isSendingWA} className="min-w-45">
                  {createAttendanceMutation.isPending || isSendingWA ?
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      {isSendingWA ? "Mengirim WA..." : "Menyimpan..."}
                    </>
                  : <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Simpan Absensi
                      {sendWhatsApp && " & Kirim WA"}
                    </>
                  }
                </Button>

                {/* Show success/error states */}
                <div className="flex items-center gap-2">
                  {createAttendanceMutation.isSuccess && <span className="text-green-600 text-sm">✓ Berhasil disimpan</span>}
                  {createAttendanceMutation.isError && <span className="text-red-600 text-sm">✗ Gagal menyimpan</span>}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Today's Attendance Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Ringkasan Absensi Hari Ini</CardTitle>
            <CardDescription>
              {isLoadingClass ?
                <Loading />
              : `${classData?.students.length || 0} siswa dalam kelas ini`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingClass ?
              <Loading />
            : <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{stats.present}</div>
                  <div className="text-sm text-gray-600">Hadir</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{stats.excused}</div>
                  <div className="text-sm text-gray-600">Izin</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{stats.sick}</div>
                  <div className="text-sm text-gray-600">Sakit</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{stats.late}</div>
                  <div className="text-sm text-gray-600">Terlambat</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{stats.absent}</div>
                  <div className="text-sm text-gray-600">Tidak Hadir</div>
                </div>
              </div>
            }
          </CardContent>
        </Card>

        {/* Attendance Rules */}
        {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Aturan Absensi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium">1 Sesi = 2 Jam Pelajaran</p>
                  <p className="text-xs text-gray-500">Absen sekali per sesi</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium">Mata Pelajaran Gandeng</p>
                  <p className="text-xs text-gray-500">Status mengikuti sesi sebelumnya</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium">Koreksi Absensi</p>
                  <p className="text-xs text-gray-500">1x kesempatan di hari yang sama</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notifikasi Otomatis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium">Alfa {">"} 2 Sesi</p>
                  <p className="text-xs text-gray-500">Notifikasi ke wali murid</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-red-600 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium">Alfa {">"} 3 Hari</p>
                  <p className="text-xs text-gray-500">Notifikasi ke Waka Kesiswaan</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div> */}
      </div>
    </>
  );
}

export default function UserDataTable() {
  const { data: session, isPending } = useSession();
  const userId = session?.user?.id;

  const { data: userData, isLoading: isLoadingUserData } = useGetUserByIdBetterAuth(userId as string);
  const userRole = userData?.role?.name;

  // Show loading while checking authorization
  if (isPending || isLoadingUserData) {
    return <Loading />;
  }

  // Check if user is Admin and Teacher
  if (userRole !== "Teacher") {
    if (userRole !== "Admin") {
      return null;
      unauthorized();
    }
  }

  // Render dashboard only after authorization is confirmed
  return <AttendanceModule />;
}
