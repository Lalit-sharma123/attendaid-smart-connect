// import { createFileRoute } from "@tanstack/react-router";
// import { useEffect, useMemo, useState } from "react";
// import { SectionCard, StatusBadge } from "@/components/ui-kit";
// import {
//   getReportsApi,
//   getReportSummaryApi,
//   getDailyAttendanceReportApi,
//   getMonthlyAttendanceReportApi,
//   getClassAttendanceReportApi,
//   getLowAttendanceRiskReportApi,
//   getSpoofAttemptReportApi,
//   getCameraActivityReportApi,
// } from "@/services/reportApi";
// import { downloadCSV } from "@/lib/csv";
// import {
//   BarChart3,
//   Camera,
//   CalendarDays,
//   FileDown,
//   FileText,
//   Printer,
//   RefreshCw,
//   Search,
//   ShieldAlert,
//   TrendingDown,
//   Users,
//   Mail,
// } from "lucide-react";
// import { toast } from "sonner";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogDescription,
//   DialogFooter,
// } from "@/components/ui/dialog";

// export const Route = createFileRoute("/admin/reports")({
//   component: Reports,
//   head: () => ({ meta: [{ title: "Reports & Export — SmartAttend" }] }),
// });

// type AnyObj = Record<string, any>;

// type ReportCard = {
//   key: string;
//   title: string;
//   desc: string;
//   icon: any;
// };

// function asArray(data: any): AnyObj[] {
//   if (Array.isArray(data)) return data;
//   if (Array.isArray(data?.items)) return data.items;
//   if (Array.isArray(data?.data)) return data.data;
//   if (Array.isArray(data?.records)) return data.records;
//   if (Array.isArray(data?.rows)) return data.rows;
//   return [];
// }

// function getNumber(value: any, fallback = 0) {
//   const n = Number(value);
//   return Number.isFinite(n) ? n : fallback;
// }

// function formatDate(value?: string) {
//   if (!value) return "-";
//   const d = new Date(value);
//   if (Number.isNaN(d.getTime())) return value;
//   return d.toLocaleDateString("en-IN", {
//     day: "2-digit",
//     month: "short",
//     year: "numeric",
//   });
// }

// function formatTime(value?: string) {
//   if (!value) return "-";
//   const d = new Date(value);
//   if (Number.isNaN(d.getTime())) return value;
//   return d.toLocaleTimeString("en-IN", {
//     hour: "2-digit",
//     minute: "2-digit",
//   });
// }

// function mapRecord(r: any) {
//   const student = r.student || {};
//   return {
//     id: r.id || `${student.rollNo || student.roll_no || Math.random()}`,
//     date: r.date || r.createdAt || r.checkInTime,
//     student:
//       student.name ||
//       [student.firstName, student.middleName, student.lastName]
//         .filter(Boolean)
//         .join(" ") ||
//       r.studentName ||
//       r.name ||
//       "-",
//     roll: student.rollNo || student.rollNumber || student.roll_no || r.rollNo || r.roll_no || "-",
//     department:
//       student.department?.name ||
//       r.department?.name ||
//       r.departmentName ||
//       r.department ||
//       "-",
//     cls:
//       student.courseClass?.name ||
//       student.class?.name ||
//       student.className ||
//       r.courseClass?.name ||
//       r.class?.name ||
//       r.className ||
//       r.cls ||
//       "-",
//     section:
//       student.section?.name ||
//       r.section?.name ||
//       r.sectionName ||
//       r.section ||
//       "-",
//     status: r.status || "-",
//     source: r.source || "SYSTEM",
//     time: r.checkInTime || r.markedAt || r.createdAt || r.date,
//     confidence: r.recognitionConfidence ?? r.confidence ?? null,
//     liveness: r.livenessScore ?? r.liveness ?? null,
//     camera: r.camera?.name || r.cameraName || r.camera || "-",
//   };
// }

// const reportCards: ReportCard[] = [
//   {
//     key: "daily",
//     title: "Daily Attendance Report",
//     desc: "All check-ins for today across departments.",
//     icon: CalendarDays,
//   },
//   {
//     key: "monthly",
//     title: "Monthly Attendance Report",
//     desc: "Aggregated monthly attendance per class.",
//     icon: CalendarDays,
//   },
//   {
//     key: "class",
//     title: "Class Attendance Report",
//     desc: "Per-class attendance breakdown with charts.",
//     icon: BarChart3,
//   },
//   {
//     key: "student",
//     title: "Student Attendance History",
//     desc: "Complete attendance history of one student.",
//     icon: Users,
//   },
//   {
//     key: "risk",
//     title: "Low Attendance Risk Report",
//     desc: "Students predicted to drop below 75%.",
//     icon: TrendingDown,
//   },
//   {
//     key: "spoof",
//     title: "Spoof Attempt Report",
//     desc: "All blocked spoof / liveness incidents.",
//     icon: ShieldAlert,
//   },
//   {
//     key: "camera",
//     title: "Camera Activity Report",
//     desc: "Per-camera FPS, latency, and detection counts.",
//     icon: Camera,
//   },
// ];

// function MiniEmpty({ label = "No real data found yet." }: { label?: string }) {
//   return (
//     <div className="mt-3 rounded-lg border border-dashed bg-secondary/20 py-7 text-center text-sm text-muted-foreground">
//       {label}
//     </div>
//   );
// }

// function Reports() {
//   const [records, setRecords] = useState<any[]>([]);
//   const [summary, setSummary] = useState<any>({});
//   const [daily, setDaily] = useState<any[]>([]);
//   const [monthly, setMonthly] = useState<any[]>([]);
//   const [classRows, setClassRows] = useState<any[]>([]);
//   const [riskRows, setRiskRows] = useState<any[]>([]);
//   const [spoofRows, setSpoofRows] = useState<any[]>([]);
//   const [cameraRows, setCameraRows] = useState<any[]>([]);
//   const [selectedReport, setSelectedReport] = useState("daily");
//   const [previewReport, setPreviewReport] = useState<ReportCard | null>(null);
//   const [q, setQ] = useState("");
//   const [loading, setLoading] = useState(false);

//   async function loadReports() {
//     setLoading(true);

//     try {
//       const [
//         recordsRes,
//         summaryRes,
//         dailyRes,
//         monthlyRes,
//         classRes,
//         riskRes,
//         spoofRes,
//         cameraRes,
//       ] = await Promise.allSettled([
//         getReportsApi(),
//         getReportSummaryApi(),
//         getDailyAttendanceReportApi(),
//         getMonthlyAttendanceReportApi(),
//         getClassAttendanceReportApi(),
//         getLowAttendanceRiskReportApi(),
//         getSpoofAttemptReportApi(),
//         getCameraActivityReportApi(),
//       ]);

//       if (recordsRes.status === "fulfilled") {
//         setRecords(asArray(recordsRes.value).map(mapRecord));
//       }

//       if (summaryRes.status === "fulfilled") {
//         setSummary(summaryRes.value || {});
//       }

//       if (dailyRes.status === "fulfilled") setDaily(asArray(dailyRes.value));
//       if (monthlyRes.status === "fulfilled") setMonthly(asArray(monthlyRes.value));
//       if (classRes.status === "fulfilled") setClassRows(asArray(classRes.value));
//       if (riskRes.status === "fulfilled") setRiskRows(asArray(riskRes.value));
//       if (spoofRes.status === "fulfilled") setSpoofRows(asArray(spoofRes.value));
//       if (cameraRes.status === "fulfilled") setCameraRows(asArray(cameraRes.value));
//     } catch (error: any) {
//       toast.error(error.message || "Failed to load reports");
//     } finally {
//       setLoading(false);
//     }
//   }

//   useEffect(() => {
//     loadReports();
//   }, []);

//   const filtered = useMemo(() => {
//     const term = q.trim().toLowerCase();
//     if (!term) return records;

//     return records.filter((r) =>
//       [
//         r.student,
//         r.roll,
//         r.status,
//         r.department,
//         r.cls,
//         r.section,
//         r.source,
//         r.camera,
//       ]
//         .join(" ")
//         .toLowerCase()
//         .includes(term)
//     );
//   }, [records, q]);

//   const total =
//     getNumber(summary.total) ||
//     getNumber(summary.totalStudents) ||
//     getNumber(summary.total_records) ||
//     records.length;

//   const present =
//     getNumber(summary.present) ||
//     getNumber(summary.presentToday) ||
//     records.filter((r) => String(r.status).toUpperCase() === "PRESENT").length;

//   const absent =
//     getNumber(summary.absent) ||
//     getNumber(summary.absentToday) ||
//     records.filter((r) => String(r.status).toUpperCase() === "ABSENT").length;

//   const late =
//     getNumber(summary.late) ||
//     getNumber(summary.lateToday) ||
//     records.filter((r) => String(r.status).toUpperCase() === "LATE").length;

//   const percentage =
//     total > 0 ? Math.round((present / total) * 100) : 0;

//   function rowsForReport(key: string) {
//     if (key === "daily") return daily.length ? daily : records;
//     if (key === "monthly") return monthly;
//     if (key === "class") return classRows;
//     if (key === "risk") return riskRows;
//     if (key === "spoof") return spoofRows;
//     if (key === "camera") return cameraRows;
//     if (key === "student") return filtered;
//     return [];
//   }

//   function handlePreview(report: ReportCard) {
//     setSelectedReport(report.key);
//     setPreviewReport(report);
//   }

//   function handleGenerate(report: ReportCard) {
//     const rows = rowsForReport(report.key);
//     const safeName = report.key.replaceAll(" ", "-");
//     downloadCSV(`${safeName}-report-${Date.now()}.csv`, rows.length ? rows : records);
//     toast.success(`${report.title} exported`);
//   }

//   const activeRows = rowsForReport(selectedReport);

//   return (
//     <div className="space-y-6">
//       <div className="flex flex-wrap items-end justify-between gap-3">
//         <div>
//           <h1 className="text-2xl font-semibold tracking-tight">
//             Reports &amp; Export
//           </h1>
//           <p className="text-sm text-muted-foreground">
//             Generate, schedule, and download attendance reports from backend.
//             {loading ? " Loading..." : ""}
//           </p>
//         </div>

//         <button
//           onClick={loadReports}
//           disabled={loading}
//           className="inline-flex items-center gap-2 h-9 px-3 rounded-md border text-sm hover:bg-secondary disabled:opacity-60"
//         >
//           <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
//           Refresh
//         </button>
//       </div>

//       <div className="flex flex-wrap gap-2">
//         <button
//           onClick={() => handleGenerate(reportCards[0])}
//           className="inline-flex items-center gap-2 h-9 px-3 rounded-md border text-sm hover:bg-secondary"
//         >
//           <FileDown className="size-4" />
//           Excel
//         </button>

//         <button
//           onClick={() => handleGenerate(reportCards[0])}
//           className="inline-flex items-center gap-2 h-9 px-3 rounded-md border text-sm hover:bg-secondary"
//         >
//           <FileText className="size-4" />
//           PDF
//         </button>

//         <button
//           onClick={() => handleGenerate(reportCards[0])}
//           className="inline-flex items-center gap-2 h-9 px-3 rounded-md border text-sm hover:bg-secondary"
//         >
//           <FileDown className="size-4" />
//           CSV
//         </button>

//         <button
//           onClick={() => window.print()}
//           className="inline-flex items-center gap-2 h-9 px-3 rounded-md border text-sm hover:bg-secondary"
//         >
//           <Printer className="size-4" />
//           Print
//         </button>

//         <button
//           onClick={() => toast.success("Schedule email option will be connected next")}
//           className="inline-flex items-center gap-2 h-9 px-3 rounded-md bg-primary text-primary-foreground text-sm"
//         >
//           <Mail className="size-4" />
//           Schedule Email
//         </button>
//       </div>

//       <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
//         <Stat label="Total" value={String(total)} />
//         <Stat label="Present" value={String(present)} />
//         <Stat label="Absent" value={String(absent)} />
//         <Stat label="Late" value={String(late)} />
//       </div>

//       <SectionCard>
//         <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
//           <div>
//             <h2 className="font-semibold">Attendance Summary</h2>
//             <p className="text-sm text-muted-foreground">
//               Current attendance rate: {percentage}%
//             </p>
//           </div>

//           <div className="relative w-full sm:w-80">
//             <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
//             <input
//               value={q}
//               onChange={(e) => setQ(e.target.value)}
//               placeholder="Search student, roll no, class..."
//               className="w-full h-9 pl-9 pr-3 rounded-md bg-secondary/60 outline-none text-sm focus:bg-card focus:ring-2 focus:ring-ring"
//             />
//           </div>
//         </div>

//         {filtered.length === 0 ? (
//           <MiniEmpty label={loading ? "Loading reports..." : "No attendance records found."} />
//         ) : (
//           <div className="overflow-x-auto -mx-5">
//             <table className="w-full text-sm">
//               <thead className="text-xs text-muted-foreground bg-secondary/30">
//                 <tr className="text-left">
//                   <th className="px-5 py-2.5 font-medium">Date</th>
//                   <th className="px-5 py-2.5 font-medium">Student</th>
//                   <th className="px-5 py-2.5 font-medium">Roll No</th>
//                   <th className="px-5 py-2.5 font-medium">Class</th>
//                   <th className="px-5 py-2.5 font-medium">Section</th>
//                   <th className="px-5 py-2.5 font-medium">Status</th>
//                   <th className="px-5 py-2.5 font-medium">Camera</th>
//                   <th className="px-5 py-2.5 font-medium">Time</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {filtered.slice(0, 30).map((r) => (
//                   <tr key={r.id} className="border-t hover:bg-secondary/30">
//                     <td className="px-5 py-3 whitespace-nowrap">{formatDate(r.date)}</td>
//                     <td className="px-5 py-3 font-medium">{r.student}</td>
//                     <td className="px-5 py-3 font-mono text-xs">{r.roll}</td>
//                     <td className="px-5 py-3">{r.cls}</td>
//                     <td className="px-5 py-3">{r.section}</td>
//                     <td className="px-5 py-3">
//                       <StatusBadge status={r.status} />
//                     </td>
//                     <td className="px-5 py-3">{r.camera}</td>
//                     <td className="px-5 py-3 whitespace-nowrap">{formatTime(r.time)}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </SectionCard>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
//         {reportCards.map((card) => {
//           const Icon = card.icon;
//           const isActive = selectedReport === card.key;

//           return (
//             <SectionCard key={card.key}>
//               <div className="space-y-5">
//                 <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
//                   <Icon className="size-5" />
//                 </div>

//                 <div>
//                   <h2 className="font-semibold">{card.title}</h2>
//                   <p className="text-sm text-muted-foreground mt-1">{card.desc}</p>
//                 </div>

//                 <div className="grid grid-cols-2 gap-2">
//                   <button
//                     onClick={() => handlePreview(card)}
//                     className={`h-9 rounded-md text-sm ${
//                       isActive
//                         ? "bg-secondary text-foreground"
//                         : "bg-secondary/70 hover:bg-secondary"
//                     }`}
//                   >
//                     Preview
//                   </button>

//                   <button
//                     onClick={() => handleGenerate(card)}
//                     className="h-9 rounded-md bg-primary text-primary-foreground text-sm hover:bg-primary/90"
//                   >
//                     Generate
//                   </button>
//                 </div>
//               </div>
//             </SectionCard>
//           );
//         })}
//       </div>

//       <Dialog open={!!previewReport} onOpenChange={(open) => !open && setPreviewReport(null)}>
//         <DialogContent className="max-w-4xl">
//           {previewReport && (
//             <>
//               <DialogHeader>
//                 <DialogTitle>{previewReport.title}</DialogTitle>
//                 <DialogDescription>{previewReport.desc}</DialogDescription>
//               </DialogHeader>

//               <div className="rounded-lg border bg-secondary/20 p-4">
//                 <div className="flex items-center justify-between gap-3 mb-3">
//                   <div>
//                     <div className="text-sm font-semibold">Preview</div>
//                     <div className="text-xs text-muted-foreground">
//                       Showing real backend rows when available.
//                     </div>
//                   </div>

//                   <button
//                     onClick={() => handleGenerate(previewReport)}
//                     className="h-8 px-3 rounded-md bg-primary text-primary-foreground text-xs"
//                   >
//                     Export This Report
//                   </button>
//                 </div>

//                 {activeRows.length === 0 ? (
//                   <MiniEmpty />
//                 ) : (
//                   <div className="overflow-x-auto max-h-[420px]">
//                     <table className="w-full text-sm">
//                       <thead className="text-xs text-muted-foreground bg-secondary/40 sticky top-0">
//                         <tr className="text-left">
//                           <th className="px-3 py-2 font-medium">#</th>
//                           <th className="px-3 py-2 font-medium">Main</th>
//                           <th className="px-3 py-2 font-medium">Status/Severity</th>
//                           <th className="px-3 py-2 font-medium">Detail</th>
//                         </tr>
//                       </thead>
//                       <tbody>
//                         {activeRows.slice(0, 50).map((row: any, idx: number) => {
//                           const mapped = mapRecord(row);
//                           const main =
//                             row.title ||
//                             row.studentName ||
//                             row.name ||
//                             mapped.student ||
//                             row.cameraName ||
//                             row.type ||
//                             "-";

//                           const status =
//                             row.status ||
//                             row.severity ||
//                             mapped.status ||
//                             row.riskLevel ||
//                             "-";

//                           const detail =
//                             row.description ||
//                             row.detail ||
//                             row.message ||
//                             row.reason ||
//                             row.departmentName ||
//                             mapped.camera ||
//                             mapped.roll ||
//                             "-";

//                           return (
//                             <tr key={row.id || idx} className="border-t">
//                               <td className="px-3 py-2 text-xs text-muted-foreground">
//                                 {idx + 1}
//                               </td>
//                               <td className="px-3 py-2 font-medium">{main}</td>
//                               <td className="px-3 py-2">
//                                 <StatusBadge status={status} />
//                               </td>
//                               <td className="px-3 py-2 text-muted-foreground">
//                                 {String(detail)}
//                               </td>
//                             </tr>
//                           );
//                         })}
//                       </tbody>
//                     </table>
//                   </div>
//                 )}
//               </div>

//               <DialogFooter>
//                 <button
//                   onClick={() => setPreviewReport(null)}
//                   className="h-9 px-3 rounded-md border text-sm"
//                 >
//                   Close
//                 </button>
//               </DialogFooter>
//             </>
//           )}
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }

// function Stat({ label, value }: { label: string; value: string }) {
//   return (
//     <div className="rounded-xl border bg-card p-5">
//       <div className="text-xs text-muted-foreground">{label}</div>
//       <div className="mt-2 text-3xl font-semibold tabular-nums">{value}</div>
//     </div>
//   );
// }



import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { SectionCard, StatusBadge } from "@/components/ui-kit";
import {
  getReportsApi,
  getReportSummaryApi,
  getDailyAttendanceReportApi,
  getMonthlyAttendanceReportApi,
  getClassAttendanceReportApi,
  getLowAttendanceRiskReportApi,
  getSpoofAttemptReportApi,
  getCameraActivityReportApi,
} from "@/services/reportApi";
import { downloadCSV } from "@/lib/csv";
import {
  Download,
  FileSpreadsheet,
  FileText,
  Printer,
  Mail,
  Calendar,
  BookOpen,
  User,
  AlertOctagon,
  ShieldAlert,
  Camera,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/admin/reports")({
  component: Reports,
  head: () => ({ meta: [{ title: "Reports & Export — SmartAttend" }] }),
});

type AnyObj = Record<string, any>;

type ReportCard = {
  key: string;
  title: string;
  desc: string;
  icon: any;
};

function asArray(data: any): AnyObj[] {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.records)) return data.records;
  if (Array.isArray(data?.rows)) return data.rows;
  return [];
}

function getNumber(value: any, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function formatDate(value?: string) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatTime(value?: string) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function mapRecord(r: any) {
  const student = r.student || {};

  return {
    id: r.id || `${student.rollNo || student.roll_no || Math.random()}`,
    date: r.date || r.createdAt || r.checkInTime,
    student:
      student.name ||
      [student.firstName, student.middleName, student.lastName]
        .filter(Boolean)
        .join(" ") ||
      r.studentName ||
      r.name ||
      "-",
    roll:
      student.rollNo ||
      student.rollNumber ||
      student.roll_no ||
      r.rollNo ||
      r.roll_no ||
      r.roll ||
      "-",
    department:
      student.department?.name ||
      r.department?.name ||
      r.departmentName ||
      r.department ||
      "-",
    cls:
      student.courseClass?.name ||
      student.class?.name ||
      student.className ||
      r.courseClass?.name ||
      r.class?.name ||
      r.className ||
      r.cls ||
      "-",
    section:
      student.section?.name ||
      r.section?.name ||
      r.sectionName ||
      r.section ||
      "-",
    status: r.status || "-",
    source: r.source || "SYSTEM",
    time: r.checkInTime || r.markedAt || r.createdAt || r.date,
    confidence: r.recognitionConfidence ?? r.confidence ?? null,
    liveness: r.livenessScore ?? r.liveness ?? null,
    camera: r.camera?.name || r.cameraName || r.camera || "-",
  };
}

const reportCards: ReportCard[] = [
  {
    key: "daily",
    title: "Daily Attendance Report",
    desc: "All check-ins for today across departments.",
    icon: Calendar,
  },
  {
    key: "monthly",
    title: "Monthly Attendance Report",
    desc: "Aggregated monthly attendance per class.",
    icon: Calendar,
  },
  {
    key: "class",
    title: "Class Attendance Report",
    desc: "Per-class attendance breakdown with charts.",
    icon: BookOpen,
  },
  {
    key: "student",
    title: "Student Attendance History",
    desc: "Complete attendance history of one student.",
    icon: User,
  },
  {
    key: "risk",
    title: "Low Attendance Risk Report",
    desc: "Students predicted to drop below 75%.",
    icon: AlertOctagon,
  },
  {
    key: "spoof",
    title: "Spoof Attempt Report",
    desc: "All blocked spoof / liveness incidents.",
    icon: ShieldAlert,
  },
  {
    key: "camera",
    title: "Camera Activity Report",
    desc: "Per-camera FPS, latency, and detection counts.",
    icon: Camera,
  },
];

function getReportByKey(key: string) {
  return reportCards.find((r) => r.key === key) || reportCards[0];
}

function MiniEmpty({ label = "No real data found yet." }: { label?: string }) {
  return (
    <div className="mt-3 rounded-lg border border-dashed bg-secondary/20 py-7 text-center text-sm text-muted-foreground">
      {label}
    </div>
  );
}

function Reports() {
  const [records, setRecords] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({});
  const [daily, setDaily] = useState<any[]>([]);
  const [monthly, setMonthly] = useState<any[]>([]);
  const [classRows, setClassRows] = useState<any[]>([]);
  const [riskRows, setRiskRows] = useState<any[]>([]);
  const [spoofRows, setSpoofRows] = useState<any[]>([]);
  const [cameraRows, setCameraRows] = useState<any[]>([]);
  const [selectedReport, setSelectedReport] = useState("daily");
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [freq, setFreq] = useState("weekly");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadReports() {
    setLoading(true);

    try {
      const [
        recordsRes,
        summaryRes,
        dailyRes,
        monthlyRes,
        classRes,
        riskRes,
        spoofRes,
        cameraRes,
      ] = await Promise.allSettled([
        getReportsApi(),
        getReportSummaryApi(),
        getDailyAttendanceReportApi(),
        getMonthlyAttendanceReportApi(),
        getClassAttendanceReportApi(),
        getLowAttendanceRiskReportApi(),
        getSpoofAttemptReportApi(),
        getCameraActivityReportApi(),
      ]);

      if (recordsRes.status === "fulfilled") {
        setRecords(asArray(recordsRes.value).map(mapRecord));
      }

      if (summaryRes.status === "fulfilled") {
        setSummary(summaryRes.value || {});
      }

      if (dailyRes.status === "fulfilled") {
        setDaily(asArray(dailyRes.value));
      }

      if (monthlyRes.status === "fulfilled") {
        setMonthly(asArray(monthlyRes.value));
      }

      if (classRes.status === "fulfilled") {
        setClassRows(asArray(classRes.value));
      }

      if (riskRes.status === "fulfilled") {
        setRiskRows(asArray(riskRes.value));
      }

      if (spoofRes.status === "fulfilled") {
        setSpoofRows(asArray(spoofRes.value));
      }

      if (cameraRes.status === "fulfilled") {
        setCameraRows(asArray(cameraRes.value));
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to load reports");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReports();
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return records;

    return records.filter((r) =>
      [
        r.student,
        r.roll,
        r.status,
        r.department,
        r.cls,
        r.section,
        r.source,
        r.camera,
      ]
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [records, q]);

  const total =
    getNumber(summary.total) ||
    getNumber(summary.totalStudents) ||
    getNumber(summary.total_records) ||
    records.length;

  const present =
    getNumber(summary.present) ||
    getNumber(summary.presentToday) ||
    records.filter((r) => String(r.status).toUpperCase() === "PRESENT").length;

  const absent =
    getNumber(summary.absent) ||
    getNumber(summary.absentToday) ||
    records.filter((r) => String(r.status).toUpperCase() === "ABSENT").length;

  function rowsForReport(key: string) {
    if (key === "daily") return daily.length ? daily : records;
    if (key === "monthly") return monthly;
    if (key === "class") return classRows;
    if (key === "risk") return riskRows;
    if (key === "spoof") return spoofRows;
    if (key === "camera") return cameraRows;
    if (key === "student") return filtered;
    return [];
  }

  function handlePreview(report: ReportCard) {
    setSelectedReport(report.key);

    setTimeout(() => {
      document.getElementById("report-preview")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 50);
  }

  function handleGenerate(report: ReportCard) {
    const rows = rowsForReport(report.key);
    const safeName = report.title.replace(/\s+/g, "-").toLowerCase();

    downloadCSV(`${safeName}-${Date.now()}.csv`, rows.length ? rows : records);
    toast.success(`${report.title} generated`);
  }

  const activeReport = getReportByKey(selectedReport);
  const activeRows = rowsForReport(selectedReport);

  const previewTotal = total || activeRows.length || 0;
  const previewPresent =
    present ||
    activeRows.filter((r: any) => {
      const mapped = mapRecord(r);
      return String(mapped.status).toUpperCase() === "PRESENT";
    }).length;

  const previewAbsent =
    absent ||
    activeRows.filter((r: any) => {
      const mapped = mapRecord(r);
      return String(mapped.status).toUpperCase() === "ABSENT";
    }).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Reports &amp; Export
          </h1>
          <p className="text-sm text-muted-foreground">
            Generate, schedule, and download attendance reports in any format.
            {loading ? " Loading..." : ""}
          </p>
        </div>

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => handleGenerate(activeReport)}
            className="inline-flex items-center gap-2 h-9 px-3 rounded-md border text-sm"
          >
            <FileSpreadsheet className="size-4" />
            Excel
          </button>

          <button
            onClick={() => handleGenerate(activeReport)}
            className="inline-flex items-center gap-2 h-9 px-3 rounded-md border text-sm"
          >
            <FileText className="size-4" />
            PDF
          </button>

          <button
            onClick={() => handleGenerate(activeReport)}
            className="inline-flex items-center gap-2 h-9 px-3 rounded-md border text-sm"
          >
            <Download className="size-4" />
            CSV
          </button>

          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 h-9 px-3 rounded-md border text-sm"
          >
            <Printer className="size-4" />
            Print
          </button>

          <button
            onClick={() => setScheduleOpen(true)}
            className="inline-flex items-center gap-2 h-9 px-3 rounded-md bg-primary text-primary-foreground text-sm"
          >
            <Mail className="size-4" />
            Schedule Email
          </button>

          <button
            onClick={loadReports}
            disabled={loading}
            className="inline-flex items-center gap-2 h-9 px-3 rounded-md border text-sm disabled:opacity-60"
          >
            <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {reportCards.map((r) => {
          const Icon = r.icon;

          return (
            <div
              key={r.key}
              className="rounded-xl border bg-card p-5 hover:shadow-md transition-shadow"
            >
              <div className="size-10 rounded-lg bg-primary/10 text-primary grid place-items-center mb-3">
                <Icon className="size-5" />
              </div>

              <div className="font-semibold">{r.title}</div>

              <div className="text-xs text-muted-foreground mt-1 mb-4">
                {r.desc}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handlePreview(r)}
                  className="flex-1 h-8 rounded-md bg-secondary text-xs hover:bg-accent"
                >
                  Preview
                </button>

                <button
                  onClick={() => handleGenerate(r)}
                  className="flex-1 h-8 rounded-md bg-primary text-primary-foreground text-xs"
                >
                  Generate
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div
        id="report-preview"
        className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6"
      >
        <SectionCard
          title={`Report Preview · ${activeReport.title.replace(" Report", "")} · 14 May 2026`}
        >
          <div className="rounded-lg border bg-secondary/20 p-6 min-h-[400px]">
            <div className="border-b pb-3 mb-4">
              <div className="text-xs text-muted-foreground">
                SmartAttend University · Confidential
              </div>

              <div className="text-lg font-semibold">{activeReport.title}</div>

              <div className="text-xs text-muted-foreground">
                14 May 2026 · Generated 09:24 AM IST
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded bg-card border">
                <div className="text-muted-foreground">Total</div>
                <div className="text-xl font-semibold">
                  {previewTotal.toLocaleString("en-IN")}
                </div>
              </div>

              <div className="p-3 rounded bg-card border">
                <div className="text-muted-foreground">Present</div>
                <div className="text-xl font-semibold text-success">
                  {previewPresent.toLocaleString("en-IN")}
                </div>
              </div>

              <div className="p-3 rounded bg-card border">
                <div className="text-muted-foreground">Absent</div>
                <div className="text-xl font-semibold text-destructive">
                  {previewAbsent.toLocaleString("en-IN")}
                </div>
              </div>
            </div>

            <div className="mt-4 text-xs text-muted-foreground">
              Detailed roster, charts, and incident summary follow…
            </div>

            {activeRows.length > 0 ? (
              <div className="mt-5 overflow-x-auto max-h-[230px] rounded-lg border bg-card/40">
                <table className="w-full text-xs">
                  <thead className="text-muted-foreground bg-secondary/40 sticky top-0">
                    <tr className="text-left">
                      <th className="px-3 py-2 font-medium">Date</th>
                      <th className="px-3 py-2 font-medium">Student</th>
                      <th className="px-3 py-2 font-medium">Roll</th>
                      <th className="px-3 py-2 font-medium">Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {activeRows.slice(0, 8).map((row: any, idx: number) => {
                      const mapped = mapRecord(row);

                      const student =
                        row.studentName ||
                        row.name ||
                        mapped.student ||
                        row.title ||
                        row.cameraName ||
                        row.type ||
                        "-";

                      const roll =
                        mapped.roll ||
                        row.rollNo ||
                        row.roll ||
                        row.entityId ||
                        "-";

                      const status =
                        row.status ||
                        row.severity ||
                        mapped.status ||
                        row.riskLevel ||
                        "-";

                      return (
                        <tr key={row.id || idx} className="border-t">
                          <td className="px-3 py-2 whitespace-nowrap">
                            {formatDate(mapped.date)}
                          </td>
                          <td className="px-3 py-2 font-medium">{student}</td>
                          <td className="px-3 py-2 font-mono">{roll}</td>
                          <td className="px-3 py-2">
                            <StatusBadge status={status} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <MiniEmpty label={loading ? "Loading report preview..." : "No real data found yet."} />
            )}
          </div>
        </SectionCard>

        <SectionCard title="Export Options">
          <div className="space-y-3 text-sm">
            <Field label="Date Range" value="14 May 2026 → 14 May 2026" />
            <Field label="Department" value="All" />
            <Field label="Class" value="All" />
            <Field label="Section" value="All" />

            <div>
              <div className="text-xs text-muted-foreground mb-1.5">
                Include Columns
              </div>

              <div className="flex flex-wrap gap-1.5">
                {[
                  "Roll",
                  "Name",
                  "Time",
                  "Status",
                  "Confidence",
                  "Liveness",
                  "Camera",
                  "Edit Reason",
                ].map((c) => (
                  <span
                    key={c}
                    className="text-[11px] px-2 py-1 rounded bg-primary/10 text-primary"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-lg border p-3 bg-secondary/30 text-xs">
              <div className="flex justify-between mb-1">
                <span>Export progress</span>
                <span className="tabular-nums">68%</span>
              </div>

              <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                <div className="h-full bg-primary" style={{ width: "68%" }} />
              </div>
            </div>

            <button
              onClick={() => handleGenerate(activeReport)}
              className="w-full h-10 rounded-md bg-primary text-primary-foreground text-sm font-medium"
            >
              Export Report
            </button>
          </div>
        </SectionCard>
      </div>

      <Dialog open={scheduleOpen} onOpenChange={setScheduleOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Schedule Email Report</DialogTitle>
            <DialogDescription>
              Receive reports automatically.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 text-sm">
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="recipient@example.com"
              className="w-full h-9 px-3 rounded-md border bg-card"
            />

            <select
              value={freq}
              onChange={(e) => setFreq(e.target.value)}
              className="w-full h-9 px-3 rounded-md border bg-card"
            >
              <option value="daily">Daily 09:00 AM</option>
              <option value="weekly">Weekly Mondays 09:00</option>
              <option value="monthly">Monthly 1st 09:00</option>
            </select>
          </div>

          <DialogFooter>
            <button
              onClick={() => {
                if (!email) {
                  toast.error("Email required");
                  return;
                }

                toast.success(`Scheduled · ${freq}`);
                setScheduleOpen(false);
              }}
              className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm"
            >
              Schedule
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center text-xs py-2 border-b last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}