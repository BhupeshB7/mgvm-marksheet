import { useState, useEffect, useRef } from "react";

const STORAGE_KEY = "marksheet_form_draft";

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

const DEFAULT_SUBJECTS = [
  { subject: "Hindi", obtained: "", max: 100 },
  { subject: "English", obtained: "", max: 100 },
  { subject: "Mathematics", obtained: "", max: 100 },
  { subject: "Science", obtained: "", max: 100 },
  { subject: "Social Science", obtained: "", max: 100 },
  { subject: "Sanskrit", obtained: "", max: 100 },
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
    if (!raw) return null;
    return JSON.parse(raw);
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

export default function ExamForm() {
  const draft = loadDraft();

  const [student, setStudent] = useState(draft?.student || DEFAULT_STUDENT);
  const [marks, setMarks] = useState(draft?.marks || DEFAULT_SUBJECTS);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  const inputRefs = useRef({});
  const subjectRefs = useRef({});

  useEffect(() => {
    saveDraft({ student, marks });
  }, [student, marks]);

  function showToast(msg, type = "success") {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ msg, type });
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  }

  function validateForm() {
    const errs = {};
    if (!student.name.trim()) errs.name = "Student name is required";
    if (!student.fatherName.trim())
      errs.fatherName = "Father's name is required";
    if (!student.motherName.trim())
      errs.motherName = "Mother's name is required";
    if (!student.class) errs.class = "Please select a class";
    if (!student.rollNo.trim()) errs.rollNo = "Roll No. is required";

    marks.forEach((m, i) => {
      const obt = Number(m.obtained);
      const mx = Number(m.max);
      if (m.obtained === "" || m.obtained === null) {
        errs[`mark_${i}`] = "Required";
      } else if (isNaN(obt) || obt < 0) {
        errs[`mark_${i}`] = "Invalid";
      } else if (obt > mx) {
        errs[`mark_${i}`] = `Max ${mx}`;
      }
      if (!m.max || isNaN(mx) || mx <= 0) {
        errs[`max_${i}`] = "Invalid";
      }
    });

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleStudentChange(field, value) {
    setStudent((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function handleMarkChange(index, field, value) {
    setMarks((prev) =>
      prev.map((m, i) => (i === index ? { ...m, [field]: value } : m)),
    );
    setErrors((prev) => ({
      ...prev,
      [`mark_${index}`]: undefined,
      [`max_${index}`]: undefined,
    }));
  }

  function addSubject() {
    setMarks((prev) => [...prev, { subject: "", obtained: "", max: 100 }]);
    setTimeout(() => {
      const newIndex = marks.length;
      const subjectInput = document.getElementById(`subject-${newIndex}`);
      if (subjectInput) subjectInput.focus();
    }, 100);
  }

  function removeSubject(index) {
    if (marks.length <= 1) return;
    setMarks((prev) => prev.filter((_, i) => i !== index));
  }

  function handleKeyDown(e, fieldType, index = null) {
    if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();

      const focusableElements = [];

      const studentFields = [
        "name",
        "fatherName",
        "motherName",
        "class",
        "rollNo",
      ];

      for (const field of studentFields) {
        const element = inputRefs.current[field];
        if (element && !element.disabled) {
          focusableElements.push(element);
        }
      }

      for (let i = 0; i < marks.length; i++) {
        const subjectInput = document.getElementById(`subject-${i}`);
        const obtainedInput = document.getElementById(`obtained-${i}`);
        const maxInput = document.getElementById(`max-${i}`);

        if (subjectInput && !subjectInput.disabled)
          focusableElements.push(subjectInput);
        if (obtainedInput && !obtainedInput.disabled)
          focusableElements.push(obtainedInput);
        if (maxInput && !maxInput.disabled) focusableElements.push(maxInput);
      }

      const submitButton = document.querySelector(
        'button[type="button"]:last-of-type',
      );
      if (submitButton && !submitButton.disabled)
        focusableElements.push(submitButton);

      const currentIndex = focusableElements.findIndex((el) => el === e.target);

      if (currentIndex !== -1) {
        let nextIndex = e.key === "Enter" ? currentIndex + 1 : currentIndex + 1;

        if (nextIndex >= focusableElements.length) {
          nextIndex = 0;
        }

        focusableElements[nextIndex]?.focus();
      }
    }
  }

  async function handleSubmit() {
    if (!validateForm()) {
      showToast("Please fix the errors before downloading.", "error");
      return;
    }
    if (loading) return;
    setLoading(true);

    const payload = {
      student: {
        name: student.name.trim(),
        fatherName: student.fatherName.trim(),
        motherName: student.motherName.trim(),
        class: student.class,
        rollNo: student.rollNo.trim(),
        session: FIXED_SESSION,
      },
      marks: marks.map((m) => ({
        subject: m.subject.trim(),
        obtained: Number(m.obtained),
        max: Number(m.max),
      })),
      school: {
        name: "MAA GAYATRI VIDYA MANDIR",
        address: "Sahorbaghat, Kusheshwar asthan,Darbhanga, Bihar - 848213",
        phone: "+91 9931434644",
        email: "mgvmeducation@gmail.com",
        logoUrl:
          "https://ik.imagekit.io/bhupeshb7/H2djMRhTp8NWVG-K8HmAe__1_-removebg-preview-removebg-preview%20(2).png?updatedAt=1774636861114",
        signUrl:
          "https://ik.imagekit.io/bhupeshb7/mgvm-sign-removebg-preview.png",
      },
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

      const safeName = student.name.trim().replace(/\s+/g, "-").toLowerCase();
      const safeClass = student.class.replace(/\s+/g, "-").toLowerCase();
      const safeRoll = student.rollNo.trim().replace(/\s+/g, "-").toLowerCase();
      link.download = `${safeName}-${safeClass}-${safeRoll}.pdf`;
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
    setStudent(DEFAULT_STUDENT);
    setMarks(DEFAULT_SUBJECTS);
    setErrors({});
    clearDraft();
    showToast("Form cleared.", "info");
  }

  const inputBase =
    "w-full border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all duration-150";

  const labelBase =
    "block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1";

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-orange-50 font-sans">
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
                Download Exam Report
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
          className={`fixed top-20 right-4 z-50 px-5 py-3 shadow-xl text-sm font-semibold transition-all duration-300 flex items-center gap-2 border-l-4 ${
            toast.type === "success"
              ? "bg-white border-green-500 text-green-800"
              : toast.type === "error"
                ? "bg-white border-red-500 text-red-800"
                : "bg-white border-blue-400 text-blue-800"
          }`}
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
        <div className="bg-white border border-gray-200 shadow-sm mb-6">
          <div className="bg-green-600 px-5 py-3 flex items-center gap-2">
            <svg
              className="w-4 h-4 text-green-100"
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
              Student Information
            </h2>
          </div>

          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelBase}>Student Full Name</label>
              <input
                ref={(el) => (inputRefs.current.name = el)}
                type="text"
                value={student.name}
                onChange={(e) => handleStudentChange("name", e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, "student")}
                placeholder="e.g. Rahul Kumar Sharma"
                className={`${inputBase} ${errors.name ? "border-red-400 bg-red-50 focus:border-red-400 focus:ring-red-100" : ""}`}
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-600 font-medium">
                  {errors.name}
                </p>
              )}
            </div>

            <div>
              <label className={labelBase}>Father's Name</label>
              <input
                ref={(el) => (inputRefs.current.fatherName = el)}
                type="text"
                value={student.fatherName}
                onChange={(e) =>
                  handleStudentChange("fatherName", e.target.value)
                }
                onKeyDown={(e) => handleKeyDown(e, "student")}
                placeholder="e.g. Rajesh Kumar Sharma"
                className={`${inputBase} ${errors.fatherName ? "border-red-400 bg-red-50 focus:border-red-400 focus:ring-red-100" : ""}`}
              />
              {errors.fatherName && (
                <p className="mt-1 text-xs text-red-600 font-medium">
                  {errors.fatherName}
                </p>
              )}
            </div>

            <div>
              <label className={labelBase}>Mother's Name</label>
              <input
                ref={(el) => (inputRefs.current.motherName = el)}
                type="text"
                value={student.motherName}
                onChange={(e) =>
                  handleStudentChange("motherName", e.target.value)
                }
                onKeyDown={(e) => handleKeyDown(e, "student")}
                placeholder="e.g. Sunita Sharma"
                className={`${inputBase} ${errors.motherName ? "border-red-400 bg-red-50 focus:border-red-400 focus:ring-red-100" : ""}`}
              />
              {errors.motherName && (
                <p className="mt-1 text-xs text-red-600 font-medium">
                  {errors.motherName}
                </p>
              )}
            </div>

            <div>
              <label className={labelBase}>Class & Section</label>
              <select
                ref={(el) => (inputRefs.current.class = el)}
                value={student.class}
                onChange={(e) => handleStudentChange("class", e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, "student")}
                className={`${inputBase} appearance-none cursor-pointer ${errors.class ? "border-red-400 bg-red-50 focus:border-red-400 focus:ring-red-100" : "bg-white"}`}
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
              {errors.class && (
                <p className="mt-1 text-xs text-red-600 font-medium">
                  {errors.class}
                </p>
              )}
            </div>

            <div>
              <label className={labelBase}>Roll Number</label>
              <input
                ref={(el) => (inputRefs.current.rollNo = el)}
                type="text"
                value={student.rollNo}
                onChange={(e) => handleStudentChange("rollNo", e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, "student")}
                placeholder="e.g. 2025-X-042"
                className={`${inputBase} ${errors.rollNo ? "border-red-400 bg-red-50 focus:border-red-400 focus:ring-red-100" : ""}`}
              />
              {errors.rollNo && (
                <p className="mt-1 text-xs text-red-600 font-medium">
                  {errors.rollNo}
                </p>
              )}
            </div>

            <div>
              <label className={labelBase}>Academic Session</label>
              <div className="w-full border border-gray-100 bg-gray-50 px-3 py-2.5 text-sm text-gray-500 font-semibold select-none cursor-default flex items-center justify-between">
                <span>{FIXED_SESSION}</span>
                <span className="text-xs text-gray-400 font-normal bg-gray-100 px-2 py-0.5">
                  Auto-set
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 shadow-sm mb-6">
          <div className="bg-orange-500 px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg
                className="w-4 h-4 text-orange-100"
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
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Subject Marks
              </h2>
            </div>
            <span className="text-xs text-orange-100 font-medium">
              {marks.length} subject{marks.length !== 1 ? "s" : ""}
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
                Max Marks
              </div>
              <div className="col-span-1"></div>
            </div>

            <div className="space-y-2.5">
              {marks.map((mark, i) => (
                <div key={i} className="grid grid-cols-12 gap-3 items-start">
                  <div className="col-span-12 sm:col-span-5">
                    <label className="sm:hidden block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                      Subject
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-300 w-5 text-right shrink-0">
                        {i + 1}
                      </span>
                      <input
                        id={`subject-${i}`}
                        type="text"
                        value={mark.subject}
                        onChange={(e) =>
                          handleMarkChange(i, "subject", e.target.value)
                        }
                        onKeyDown={(e) => handleKeyDown(e, "marks", i)}
                        placeholder="Subject name"
                        className={inputBase}
                      />
                    </div>
                  </div>

                  <div className="col-span-5 sm:col-span-3">
                    <label className="sm:hidden block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                      Obtained
                    </label>
                    <input
                      id={`obtained-${i}`}
                      type="number"
                      value={mark.obtained}
                      onChange={(e) =>
                        handleMarkChange(i, "obtained", e.target.value)
                      }
                      onKeyDown={(e) => handleKeyDown(e, "marks", i)}
                      placeholder="0"
                      min={0}
                      max={mark.max}
                      className={`${inputBase} text-center ${errors[`mark_${i}`] ? "border-red-400 bg-red-50 focus:border-red-400 focus:ring-red-100" : ""}`}
                    />
                    {errors[`mark_${i}`] && (
                      <p className="mt-0.5 text-xs text-red-600 font-medium text-center">
                        {errors[`mark_${i}`]}
                      </p>
                    )}
                  </div>

                  <div className="col-span-5 sm:col-span-3">
                    <label className="sm:hidden block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                      Max Marks
                    </label>
                    <input
                      id={`max-${i}`}
                      type="number"
                      value={mark.max}
                      onChange={(e) =>
                        handleMarkChange(i, "max", e.target.value)
                      }
                      onKeyDown={(e) => handleKeyDown(e, "marks", i)}
                      placeholder="100"
                      min={1}
                      className={`${inputBase} text-center ${errors[`max_${i}`] ? "border-red-400 bg-red-50 focus:border-red-400 focus:ring-red-100" : ""}`}
                    />
                    {errors[`max_${i}`] && (
                      <p className="mt-0.5 text-xs text-red-600 font-medium text-center">
                        {errors[`max_${i}`]}
                      </p>
                    )}
                  </div>

                  <div className="col-span-2 sm:col-span-1 flex items-start pt-1 sm:pt-0">
                    <label className="sm:hidden block text-xs text-transparent mb-1">
                      X
                    </label>
                    <button
                      type="button"
                      onClick={() => removeSubject(i)}
                      disabled={marks.length <= 1}
                      className="w-full flex items-center justify-center h-[38px] border border-red-100 bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 hover:border-red-300 disabled:opacity-20 disabled:cursor-not-allowed transition-all duration-150"
                      title="Remove subject"
                    >
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path strokeLinecap="square" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addSubject}
              className="mt-4 flex items-center gap-2 text-xs font-semibold text-green-700 border border-green-200 bg-green-50 hover:bg-green-100 hover:border-green-400 px-4 py-2 transition-all duration-150 uppercase tracking-wider"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="square" d="M12 4v16m8-8H4" />
              </svg>
              Add Subject
            </button>
          </div>
        </div>

        {marks.some((m) => m.obtained !== "") && (
          <div className="bg-white border border-gray-200 shadow-sm mb-6 px-5 py-4 flex flex-wrap gap-6 items-center">
            {(() => {
              const filled = marks.filter(
                (m) => m.obtained !== "" && !isNaN(Number(m.obtained)),
              );
              const totalObt = filled.reduce(
                (s, m) => s + Number(m.obtained),
                0,
              );
              const totalMax = filled.reduce((s, m) => s + Number(m.max), 0);
              const pct =
                totalMax > 0 ? ((totalObt / totalMax) * 100).toFixed(1) : 0;
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
              const gradeColor =
                pct >= 80
                  ? "text-green-700 bg-green-50 border-green-200"
                  : pct >= 60
                    ? "text-orange-700 bg-orange-50 border-orange-200"
                    : "text-red-700 bg-red-50 border-red-200";
              return (
                <>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
                      Total Marks
                    </p>
                    <p className="text-lg font-bold text-gray-900">
                      {totalObt}{" "}
                      <span className="text-gray-400 text-sm font-normal">
                        / {totalMax}
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
                      Percentage
                    </p>
                    <p className="text-lg font-bold text-gray-900">{pct}%</p>
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
                  <div className="flex-1 min-w-[120px]">
                    <div className="h-2 bg-gray-100 w-full overflow-hidden">
                      <div
                        className={`h-2 transition-all duration-500 ${pct >= 80 ? "bg-green-500" : pct >= 60 ? "bg-orange-500" : "bg-red-400"}`}
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
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
                Download Marksheet
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
