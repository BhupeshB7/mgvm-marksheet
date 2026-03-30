import { useState, useEffect, useRef } from "react";

const STORAGE_KEY = "marksheet_dual_draft";

const CLASS_OPTIONS = [
  "Nursery - Section A",
  "LKG - Section A",
  "UKG - Section A",
  "One - Section A",
  "Two - Section A",
  "Three - Section A",
  "Four - Section A",
  "Five - Section A",
  "Six - Section A",
  "Seven - Section A",
  "Eight - Section A",
  "Nine - Section A",
];

const FIXED_SESSION = "2025-26";

const DEFAULT_MARKS = [
  { subject: "Hindi", obtained: "", max: 100 },
  { subject: "English", obtained: "", max: 100 },
  { subject: "Mathematics", obtained: "", max: 100 },
  { subject: "Science", obtained: "", max: 100 },
];

const DEFAULT_STUDENT = {
  name: "",
  fatherName: "",
  motherName: "",
  class: "",
  rollNo: "",
};

function loadDraft() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
function saveDraft(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}
function clearDraft() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
}

function calcSummary(marks) {
  const filled = marks.filter(
    (m) => m.obtained !== "" && !isNaN(Number(m.obtained)),
  );
  const totalObt = filled.reduce((s, m) => s + Number(m.obtained), 0);
  const totalMax = filled.reduce((s, m) => s + Number(m.max), 0);
  const pct = totalMax > 0 ? ((totalObt / totalMax) * 100).toFixed(1) : 0;
  const grade =
    pct >= 90
      ? "A+"
      : pct >= 80
        ? "A"
        : pct >= 70
          ? "B+"
          : pct >= 60
            ? "B"
            : pct >= 50
              ? "C"
              : "D";
  return { totalObt, totalMax, pct, grade };
}

function StudentSection({
  index,
  student,
  marks,
  errors,
  onChange,
  onMarkChange,
  inputRefs,
}) {
  const label = index === 0 ? "Student 1" : "Student 2";
  const accentBg = index === 0 ? "bg-green-600" : "bg-indigo-700";
  const accentFocus =
    index === 0
      ? "focus:border-green-500 focus:ring-green-100"
      : "focus:border-indigo-400 focus:ring-indigo-100";

  const inputBase = `w-full border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-150 ${accentFocus}`;
  const labelBase =
    "block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1";
  const prefix = `s${index}`;

  const { totalObt, totalMax, pct, grade } = calcSummary(marks);
  const hasAny = marks.some((m) => m.obtained !== "");
  const gradeColor =
    pct >= 80
      ? "text-green-700 bg-green-50 border-green-200"
      : pct >= 60
        ? "text-orange-700 bg-orange-50 border-orange-200"
        : "text-red-700 bg-red-50 border-red-200";
  const barColor =
    pct >= 80 ? "bg-green-500" : pct >= 60 ? "bg-orange-500" : "bg-red-400";

  return (
    <div className="bg-white border border-gray-200 shadow-sm mb-4">
      <div className={`${accentBg} px-5 py-3 flex items-center gap-2`}>
        <svg
          className="w-4 h-4 text-white opacity-80"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="square"
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
        <h2 className="text-sm font-bold text-white uppercase tracking-wider">
          {label} — Student Information
        </h2>
      </div>

      <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          {
            field: "name",
            label: "Student Full Name",
            placeholder: "e.g. Rahul Kumar Sharma",
          },
          {
            field: "fatherName",
            label: "Father's Name",
            placeholder: "e.g. Rajesh Kumar Sharma",
          },
          {
            field: "motherName",
            label: "Mother's Name",
            placeholder: "e.g. Sunita Sharma",
          },
          {
            field: "rollNo",
            label: "Roll Number",
            placeholder: "e.g. 2025-X-042",
          },
        ].map(({ field, label: fLabel, placeholder }) => (
          <div key={field}>
            <label className={labelBase}>{fLabel}</label>
            <input
              ref={(el) => {
                if (inputRefs.current)
                  inputRefs.current[`${prefix}_${field}`] = el;
              }}
              type="text"
              value={student[field]}
              onChange={(e) => onChange(index, field, e.target.value)}
              placeholder={placeholder}
              className={`${inputBase} ${errors[`${prefix}_${field}`] ? "border-red-400 bg-red-50 focus:border-red-400 focus:ring-red-100" : ""}`}
            />
            {errors[`${prefix}_${field}`] && (
              <p className="mt-1 text-xs text-red-600 font-medium">
                {errors[`${prefix}_${field}`]}
              </p>
            )}
          </div>
        ))}

        <div>
          <label className={labelBase}>Class & Section</label>
          <select
            ref={(el) => {
              if (inputRefs.current) inputRefs.current[`${prefix}_class`] = el;
            }}
            value={student.class}
            onChange={(e) => onChange(index, "class", e.target.value)}
            className={`${inputBase} appearance-none cursor-pointer ${errors[`${prefix}_class`] ? "border-red-400 bg-red-50 focus:border-red-400 focus:ring-red-100" : "bg-white"}`}
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2.5'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 12px center",
              paddingRight: "36px",
            }}
          >
            <option value="">— Select Class —</option>
            {CLASS_OPTIONS.map((cls) => (
              <option key={cls} value={cls}>
                {cls}
              </option>
            ))}
          </select>
          {errors[`${prefix}_class`] && (
            <p className="mt-1 text-xs text-red-600 font-medium">
              {errors[`${prefix}_class`]}
            </p>
          )}
        </div>

        <div>
          <label className={labelBase}>Academic Session</label>
          <div className="w-full border border-gray-100 bg-gray-50 px-3 py-2 text-sm text-gray-500 font-semibold select-none cursor-default flex items-center justify-between">
            <span>{FIXED_SESSION}</span>
            <span className="text-xs text-gray-400 font-normal bg-gray-100 px-2 py-0.5">
              Auto-set
            </span>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100">
        <div
          className={`${index === 0 ? "bg-orange-500" : "bg-purple-700"} px-5 py-2.5 flex items-center justify-between`}
        >
          <div className="flex items-center gap-2">
            <svg
              className="w-4 h-4 text-white opacity-80"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="square"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Subject Marks
            </h3>
          </div>
          <span className="text-xs text-white opacity-75">
            {marks.length} subjects
          </span>
        </div>

        <div className="p-5">
          <div className="hidden sm:grid grid-cols-12 gap-3 mb-2 px-1">
            <div className="col-span-5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              # Subject
            </div>
            <div className="col-span-3 text-xs font-semibold text-gray-400 uppercase tracking-wider text-center">
              Obtained
            </div>
            <div className="col-span-3 text-xs font-semibold text-gray-400 uppercase tracking-wider text-center">
              Max
            </div>
            <div className="col-span-1"></div>
          </div>

          <div className="space-y-2">
            {marks.map((mark, i) => (
              <div key={i} className="grid grid-cols-12 gap-3 items-start">
                <div className="col-span-12 sm:col-span-5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-300 w-5 text-right shrink-0">
                      {i + 1}
                    </span>
                    <input
                      type="text"
                      value={mark.subject}
                      readOnly
                      className="w-full border border-gray-100 bg-gray-50 px-3 py-2 text-sm text-gray-600 cursor-default"
                    />
                  </div>
                </div>
                <div className="col-span-5 sm:col-span-3">
                  <input
                    type="number"
                    value={mark.obtained}
                    onChange={(e) =>
                      onMarkChange(index, i, "obtained", e.target.value)
                    }
                    placeholder="0"
                    min={0}
                    max={mark.max}
                    className={`${inputBase} text-center ${errors[`${prefix}_mark_${i}`] ? "border-red-400 bg-red-50 focus:border-red-400 focus:ring-red-100" : ""}`}
                  />
                  {errors[`${prefix}_mark_${i}`] && (
                    <p className="mt-0.5 text-xs text-red-600 font-medium text-center">
                      {errors[`${prefix}_mark_${i}`]}
                    </p>
                  )}
                </div>
                <div className="col-span-5 sm:col-span-3">
                  <input
                    type="number"
                    value={mark.max}
                    readOnly
                    className="w-full border border-gray-100 bg-gray-50 px-3 py-2 text-sm text-gray-500 text-center cursor-default"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {hasAny && (
        <div className="border-t border-gray-100 px-5 py-3 flex flex-wrap gap-5 items-center bg-gray-50">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
              Total
            </p>
            <p className="text-base font-bold text-gray-900">
              {totalObt}{" "}
              <span className="text-gray-400 text-xs font-normal">
                / {totalMax}
              </span>
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
              Percentage
            </p>
            <p className="text-base font-bold text-gray-900">{pct}%</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
              Grade
            </p>
            <span
              className={`text-sm font-bold px-3 py-0.5 border ${gradeColor}`}
            >
              {grade}
            </span>
          </div>
          <div className="flex-1 min-w-[100px]">
            <div className="h-1.5 bg-gray-200 w-full overflow-hidden rounded-full">
              <div
                className={`h-1.5 transition-all duration-500 rounded-full ${barColor}`}
                style={{ width: `${Math.min(pct, 100)}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ExamForm() {
  const draft = loadDraft();

  const [students, setStudents] = useState(
    draft?.students || [{ ...DEFAULT_STUDENT }, { ...DEFAULT_STUDENT }],
  );
  const [marks, setMarks] = useState(
    draft?.marks || [
      [...DEFAULT_MARKS.map((m) => ({ ...m }))],
      [...DEFAULT_MARKS.map((m) => ({ ...m }))],
    ],
  );
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);
  const inputRefs = useRef({});

  useEffect(() => {
    saveDraft({ students, marks });
  }, [students, marks]);

  function showToast(msg, type = "success") {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ msg, type });
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  }

  function validateForm() {
    const errs = {};
    students.forEach((student, si) => {
      const p = `s${si}`;
      if (!student.name.trim()) errs[`${p}_name`] = "Required";
      if (!student.fatherName.trim()) errs[`${p}_fatherName`] = "Required";
      if (!student.motherName.trim()) errs[`${p}_motherName`] = "Required";
      if (!student.class) errs[`${p}_class`] = "Select class";
      if (!student.rollNo.trim()) errs[`${p}_rollNo`] = "Required";
      marks[si].forEach((m, i) => {
        const obt = Number(m.obtained);
        if (m.obtained === "") errs[`${p}_mark_${i}`] = "Required";
        else if (isNaN(obt) || obt < 0) errs[`${p}_mark_${i}`] = "Invalid";
        else if (obt > Number(m.max)) errs[`${p}_mark_${i}`] = `Max ${m.max}`;
      });
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleStudentChange(index, field, value) {
    setStudents((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)),
    );
    setErrors((prev) => ({ ...prev, [`s${index}_${field}`]: undefined }));
  }

  function handleMarkChange(studentIndex, markIndex, field, value) {
    setMarks((prev) =>
      prev.map((sm, si) =>
        si === studentIndex
          ? sm.map((m, mi) => (mi === markIndex ? { ...m, [field]: value } : m))
          : sm,
      ),
    );
    setErrors((prev) => ({
      ...prev,
      [`s${studentIndex}_mark_${markIndex}`]: undefined,
    }));
  }

  async function handleSubmit() {
    if (!validateForm()) {
      showToast("Please fix the errors before downloading.", "error");
      return;
    }
    if (loading) return;
    setLoading(true);

    const payload = {
      examType: "Annual",
      session: FIXED_SESSION,
      school: {
        name: "MAA GAYATRI VIDYA MANDIR",
        address: "Sahorbaghat, Kusheshwar asthan, Darbhanga, Bihar - 848213",
        logoUrl:
          "https://ik.imagekit.io/bhupeshb7/H2djMRhTp8NWVG-K8HmAe__1_-removebg-preview-removebg-preview%20(2).png?updatedAt=1774636861114",
        signUrl:
          "https://ik.imagekit.io/bhupeshb7/mgvm-sign-removebg-preview.png",
      },
      students: students.map((student, si) => ({
        name: student.name.trim(),
        fatherName: student.fatherName.trim(),
        motherName: student.motherName.trim(),
        class: student.class,
        rollNo: student.rollNo.trim(),
        marks: marks[si].map((m) => ({
          subject: m.subject,
          obtained: Number(m.obtained),
          max: Number(m.max),
        })),
      })),
    };

    try {
      const res = await fetch("http://localhost:3000/marksheet/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Server error");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const s1Name = students[0].name.trim().replace(/\s+/g, "-").toLowerCase();
      const s2Name = students[1].name.trim().replace(/\s+/g, "-").toLowerCase();
      link.download = `marksheet-${s1Name}-${s2Name}.pdf`;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast("Marksheet downloaded successfully!", "success");
      clearDraft();
    } catch (err) {
      showToast(err.message || "Download failed. Try again.", "error");
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setStudents([{ ...DEFAULT_STUDENT }, { ...DEFAULT_STUDENT }]);
    setMarks([
      [...DEFAULT_MARKS.map((m) => ({ ...m }))],
      [...DEFAULT_MARKS.map((m) => ({ ...m }))],
    ]);
    setErrors({});
    clearDraft();
    showToast("Form cleared.", "info");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-indigo-50 font-sans">
      <header className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-green-600 flex items-center justify-center shadow-md">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="square"
                  strokeLinejoin="miter"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-widest leading-none">
                MAA GAYATRI VIDYA MANDIR
              </p>
              <h1 className="text-base font-bold text-gray-900 leading-tight">
                Download Exam Report — Dual
              </h1>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 bg-orange-50 border border-orange-200 px-3 py-1.5">
            <div className="w-1.5 h-1.5 bg-orange-500 animate-pulse"></div>
            <span className="text-xs font-semibold text-orange-700">
              Draft Saved
            </span>
          </div>
        </div>
      </header>

      {toast && (
        <div
          className={`fixed top-20 right-4 z-50 px-5 py-3 shadow-xl text-sm font-semibold transition-all duration-300 flex items-center gap-2 border-l-4 ${toast.type === "success" ? "bg-white border-green-500 text-green-800" : toast.type === "error" ? "bg-white border-red-500 text-red-800" : "bg-white border-blue-400 text-blue-800"}`}
        >
          {toast.type === "success" && (
            <svg
              className="w-4 h-4 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="square" d="M5 13l4 4L19 7" />
            </svg>
          )}
          {toast.type === "error" && (
            <svg
              className="w-4 h-4 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="square" d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
          {toast.msg}
        </div>
      )}

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-4 flex items-center gap-2 text-xs text-gray-500 bg-blue-50 border border-blue-100 px-4 py-2.5">
          <svg
            className="w-4 h-4 text-blue-400 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>
            Fill in details for <strong>both students</strong>. Both marksheets
            will be printed on a single page, one above the other.
          </span>
        </div>

        {students.map((student, i) => (
          <StudentSection
            key={i}
            index={i}
            student={student}
            marks={marks[i]}
            errors={errors}
            onChange={handleStudentChange}
            onMarkChange={handleMarkChange}
            inputRefs={inputRefs}
          />
        ))}

        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <button
            type="button"
            onClick={handleReset}
            className="flex-1 sm:flex-none sm:w-32 flex items-center justify-center gap-2 px-5 py-3 border border-gray-200 bg-white text-gray-500 text-sm font-semibold hover:bg-gray-50 hover:text-gray-700 hover:border-gray-300 transition-all duration-150 uppercase tracking-wider"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="square"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Clear
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-3 px-6 py-3 bg-green-600 hover:bg-green-700 active:bg-green-800 disabled:bg-green-400 disabled:cursor-not-allowed text-white text-sm font-bold uppercase tracking-wider transition-all duration-150 shadow-md shadow-green-200"
          >
            {loading ? (
              <>
                <svg
                  className="w-4 h-4 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Generating PDF...
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="square"
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                Download Both Marksheets
              </>
            )}
          </button>
        </div>

        <p className="mt-4 text-center text-xs text-gray-400">
          Your form is auto-saved locally. Closing the tab will not lose your
          progress.
        </p>
      </main>
    </div>
  );
}
