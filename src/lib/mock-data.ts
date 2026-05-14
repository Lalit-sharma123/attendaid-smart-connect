// Mock data for AI Smart Attendance System
export const stats = {
  totalStudents: 1240,
  presentToday: 1078,
  absentToday: 162,
  lateToday: 48,
  activeCameras: 12,
  totalCameras: 14,
  spoofAttempts: 7,
  unknownFaces: 13,
  avgAttendance: 86.9,
  aiConfidence: 92.4,
  uptime: 99.8,
};

export const dailyAttendance = [
  { day: "Mon", pct: 88, late: 32 },
  { day: "Tue", pct: 91, late: 28 },
  { day: "Wed", pct: 84, late: 41 },
  { day: "Thu", pct: 87, late: 36 },
  { day: "Fri", pct: 89, late: 30 },
  { day: "Sat", pct: 78, late: 22 },
  { day: "Sun", pct: 0, late: 0 },
];

export const weeklyTrend = [
  { week: "W1", attendance: 82, predicted: 84 },
  { week: "W2", attendance: 85, predicted: 86 },
  { week: "W3", attendance: 88, predicted: 87 },
  { week: "W4", attendance: 86, predicted: 88 },
  { week: "W5", attendance: 90, predicted: 89 },
  { week: "W6", attendance: 87, predicted: 90 },
  { week: "W7", attendance: 89, predicted: 91 },
];

export const departmentAttendance = [
  { dept: "BCA", attendance: 89 },
  { dept: "BBA", attendance: 84 },
  { dept: "MCA", attendance: 92 },
  { dept: "MBA", attendance: 81 },
  { dept: "B.Tech", attendance: 87 },
  { dept: "M.Tech", attendance: 94 },
];

export const spoofAttempts = [
  { time: "08:00", count: 1 },
  { time: "09:00", count: 3 },
  { time: "10:00", count: 0 },
  { time: "11:00", count: 2 },
  { time: "12:00", count: 4 },
  { time: "13:00", count: 1 },
  { time: "14:00", count: 0 },
  { time: "15:00", count: 2 },
];

export const cameraHealth = [
  { name: "Healthy", value: 9, color: "var(--color-success)" },
  { name: "Degraded", value: 3, color: "var(--color-warning)" },
  { name: "Offline", value: 2, color: "var(--color-destructive)" },
];

export const confidenceDist = [
  { bucket: "50-60", count: 8 },
  { bucket: "60-70", count: 24 },
  { bucket: "70-80", count: 92 },
  { bucket: "80-90", count: 318 },
  { bucket: "90-100", count: 636 },
];

export const aiInsights = [
  { tone: "warning", text: "AI predicts attendance may drop by 8% tomorrow for BCA Section B." },
  { tone: "danger", text: "Camera 3 has unusual unknown-face activity (13 events / 1h)." },
  { tone: "info", text: "5 students flagged with low attendance risk this week." },
  { tone: "danger", text: "Spoof attempts increased near Main Gate Camera (+220%)." },
  { tone: "info", text: "Recommended: verify camera angle in Lab Block (skew 14°)." },
  { tone: "warning", text: "Anomaly: repeated failed liveness checks on Camera 7." },
];

export const students = [
  { roll: "BCA-1021", name: "Rahul Sharma", dept: "BCA", cls: "3rd Year", section: "A", enrolled: true, attendance: 92, status: "Active" },
  { roll: "BCA-1022", name: "Priya Verma", dept: "BCA", cls: "3rd Year", section: "A", enrolled: true, attendance: 88, status: "Active" },
  { roll: "BCA-1023", name: "Aman Gupta", dept: "BCA", cls: "3rd Year", section: "B", enrolled: true, attendance: 64, status: "Active" },
  { roll: "BBA-2014", name: "Sneha Patel", dept: "BBA", cls: "2nd Year", section: "A", enrolled: false, attendance: 0, status: "Pending" },
  { roll: "MCA-3041", name: "Karan Mehta", dept: "MCA", cls: "1st Year", section: "A", enrolled: true, attendance: 95, status: "Active" },
  { roll: "MBA-4012", name: "Anjali Singh", dept: "MBA", cls: "1st Year", section: "B", enrolled: true, attendance: 73, status: "Active" },
  { roll: "BTECH-5089", name: "Vikram Joshi", dept: "B.Tech", cls: "4th Year", section: "C", enrolled: true, attendance: 81, status: "Active" },
  { roll: "BTECH-5090", name: "Neha Kapoor", dept: "B.Tech", cls: "2nd Year", section: "A", enrolled: true, attendance: 90, status: "Active" },
  { roll: "MTECH-6011", name: "Arjun Reddy", dept: "M.Tech", cls: "1st Year", section: "A", enrolled: true, attendance: 96, status: "Active" },
  { roll: "BCA-1024", name: "Divya Nair", dept: "BCA", cls: "1st Year", section: "B", enrolled: true, attendance: 58, status: "Warning" },
];

export const attendanceRecords = [
  { date: "2026-05-14", roll: "BCA-1021", name: "Rahul Sharma", dept: "BCA", cls: "3rd", section: "A", time: "08:42 AM", status: "Present", confidence: 94, liveness: 91, camera: "Main Gate", verifiedBy: "AI" },
  { date: "2026-05-14", roll: "BCA-1022", name: "Priya Verma", dept: "BCA", cls: "3rd", section: "A", time: "08:51 AM", status: "Present", confidence: 96, liveness: 93, camera: "Main Gate", verifiedBy: "AI" },
  { date: "2026-05-14", roll: "BCA-1023", name: "Aman Gupta", dept: "BCA", cls: "3rd", section: "B", time: "09:14 AM", status: "Late", confidence: 89, liveness: 88, camera: "Lab Block", verifiedBy: "AI" },
  { date: "2026-05-14", roll: "MCA-3041", name: "Karan Mehta", dept: "MCA", cls: "1st", section: "A", time: "08:31 AM", status: "Present", confidence: 97, liveness: 95, camera: "Library", verifiedBy: "AI" },
  { date: "2026-05-14", roll: "BBA-2014", name: "Unknown", dept: "—", cls: "—", section: "—", time: "08:55 AM", status: "Spoof Blocked", confidence: 42, liveness: 18, camera: "Main Gate", verifiedBy: "AI" },
  { date: "2026-05-14", roll: "MBA-4012", name: "Anjali Singh", dept: "MBA", cls: "1st", section: "B", time: "09:02 AM", status: "Present", confidence: 92, liveness: 90, camera: "Classroom A", verifiedBy: "AI" },
  { date: "2026-05-14", roll: "BTECH-5089", name: "Vikram Joshi", dept: "B.Tech", cls: "4th", section: "C", time: "08:48 AM", status: "Present", confidence: 95, liveness: 92, camera: "Classroom B", verifiedBy: "AI" },
  { date: "2026-05-14", roll: "BCA-1024", name: "Divya Nair", dept: "BCA", cls: "1st", section: "B", time: "—", status: "Absent", confidence: 0, liveness: 0, camera: "—", verifiedBy: "—" },
];

export const cameras = [
  { id: "CAM-01", name: "Main Gate", location: "Entrance Block", rtsp: "rtsp://10.0.•.•/main", status: "online", fps: 28, latency: 84, health: 96, model: "ArcFace-R100" },
  { id: "CAM-02", name: "Lab Block", location: "Building B - Floor 2", rtsp: "rtsp://10.0.•.•/lab", status: "online", fps: 26, latency: 102, health: 88, model: "ArcFace-R100" },
  { id: "CAM-03", name: "Library", location: "Library Wing", rtsp: "rtsp://10.0.•.•/lib", status: "degraded", fps: 18, latency: 220, health: 62, model: "ArcFace-R50" },
  { id: "CAM-04", name: "Classroom A", location: "Building A - 201", rtsp: "rtsp://10.0.•.•/clsA", status: "online", fps: 30, latency: 76, health: 98, model: "ArcFace-R100" },
  { id: "CAM-05", name: "Classroom B", location: "Building A - 202", rtsp: "rtsp://10.0.•.•/clsB", status: "online", fps: 29, latency: 80, health: 97, model: "ArcFace-R100" },
  { id: "CAM-06", name: "Auditorium", location: "Main Hall", rtsp: "rtsp://10.0.•.•/aud", status: "offline", fps: 0, latency: 0, health: 0, model: "ArcFace-R50" },
];

export const incidents = [
  { id: "INC-2041", time: "09:14", severity: "Critical", type: "Spoof Attempt", camera: "Main Gate", detail: "Mobile screen detected, liveness 18%", status: "Open" },
  { id: "INC-2040", time: "08:58", severity: "High", type: "Unknown Face", camera: "Lab Block", detail: "Unregistered face seen 4 times", status: "Investigating" },
  { id: "INC-2039", time: "08:31", severity: "Medium", type: "Camera Degraded", camera: "Library", detail: "FPS dropped to 18, latency 220ms", status: "Open" },
  { id: "INC-2038", time: "07:42", severity: "Low", type: "Failed Recognition", camera: "Classroom A", detail: "Repeated failed match for BCA-1023", status: "Resolved" },
  { id: "INC-2037", time: "Yesterday", severity: "High", type: "Spoof Attempt", camera: "Main Gate", detail: "Printed photo detected", status: "Resolved" },
];

export const auditLogs = [
  { time: "09:21", admin: "admin@uni.edu", action: "Edited attendance", target: "BCA-1023", reason: "Late entry corrected", severity: "Low" },
  { time: "09:05", admin: "admin@uni.edu", action: "Exported CSV", target: "Daily Report", reason: "—", severity: "Low" },
  { time: "08:48", admin: "supervisor@uni.edu", action: "Login", target: "Admin Portal", reason: "—", severity: "Info" },
  { time: "08:30", admin: "admin@uni.edu", action: "Disabled camera", target: "CAM-06", reason: "Maintenance", severity: "Medium" },
  { time: "Yesterday", admin: "admin@uni.edu", action: "Enrolled face", target: "BCA-1024", reason: "—", severity: "Low" },
  { time: "Yesterday", admin: "supervisor@uni.edu", action: "Reset password", target: "MBA-4012", reason: "User request", severity: "Medium" },
];

export const heatmap = Array.from({ length: 6 }, (_, r) =>
  Array.from({ length: 8 }, (_, c) => ({ r, c, v: Math.round(50 + Math.random() * 50) }))
);

export const liveDetections = [
  { id: "T-901", name: "Rahul Sharma", roll: "BCA-1021", confidence: 94, liveness: 91, status: "Marked", camera: "Main Gate" },
  { id: "T-902", name: "Priya Verma", roll: "BCA-1022", confidence: 96, liveness: 93, status: "Marked", camera: "Main Gate" },
  { id: "T-903", name: "Unknown", roll: "—", confidence: 42, liveness: 38, status: "Unknown", camera: "Lab Block" },
  { id: "T-904", name: "Spoof Detected", roll: "—", confidence: 71, liveness: 18, status: "Spoof", camera: "Main Gate" },
  { id: "T-905", name: "Karan Mehta", roll: "MCA-3041", confidence: 97, liveness: 95, status: "Already Marked", camera: "Library" },
];

export const monthlyCalendar = (() => {
  const days = [];
  for (let d = 1; d <= 31; d++) {
    const r = Math.random();
    let s: "present" | "absent" | "late" | "holiday" | "future" = "present";
    if (d > 14) s = "future";
    else if (r < 0.08) s = "absent";
    else if (r < 0.18) s = "late";
    else if (d % 7 === 0) s = "holiday";
    days.push({ day: d, status: s });
  }
  return days;
})();

export const studentSubjects = [
  { subject: "Data Structures", attended: 38, total: 42, pct: 90 },
  { subject: "Operating Systems", attended: 31, total: 40, pct: 78 },
  { subject: "DBMS", attended: 36, total: 38, pct: 95 },
  { subject: "Computer Networks", attended: 28, total: 39, pct: 72 },
  { subject: "Software Engineering", attended: 33, total: 36, pct: 92 },
];
