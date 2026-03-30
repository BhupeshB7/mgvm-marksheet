const { PDFDocument, rgb, StandardFonts } = require("pdf-lib");

const PW = 595.28;
const PH = 841.89;
const ML = 28;
const MR = 28;
const CW = PW - ML - MR;
const RX = PW - MR;
const CX = PW / 2;
const HALF_H = PH / 2;

const C = {
  ink: rgb(0.06, 0.09, 0.2),
  inkMid: rgb(0.11, 0.17, 0.35),
  inkLight: rgb(0.18, 0.28, 0.52),
  inkSoft: rgb(0.3, 0.42, 0.65),
  gold: rgb(0.8, 0.64, 0.18),
  goldLight: rgb(0.94, 0.84, 0.52),
  goldPale: rgb(0.99, 0.97, 0.9),
  cream: rgb(0.99, 0.98, 0.96),
  white: rgb(1, 1, 1),
  dark: rgb(0.1, 0.1, 0.12),
  charcoal: rgb(0.25, 0.27, 0.32),
  slate: rgb(0.44, 0.47, 0.54),
  mist: rgb(0.72, 0.75, 0.8),
  pale: rgb(0.95, 0.96, 0.98),
  paleCream: rgb(0.97, 0.97, 0.94),
  border: rgb(0.8, 0.82, 0.88),
  rowAlt: rgb(0.96, 0.97, 1.0),
  passGreen: rgb(0.05, 0.52, 0.22),
  failRed: rgb(0.75, 0.12, 0.12),
  gradA: rgb(0.05, 0.48, 0.28),
  gradB: rgb(0.1, 0.38, 0.68),
  gradC: rgb(0.7, 0.45, 0.05),
  gradF: rgb(0.72, 0.1, 0.1),
};

function hl(page, x1, x2, y, t, color) {
  page.drawLine({
    start: { x: x1, y },
    end: { x: x2, y },
    thickness: t,
    color,
  });
}
function vl(page, x, y1, y2, t, color) {
  page.drawLine({
    start: { x, y: y1 },
    end: { x, y: y2 },
    thickness: t,
    color,
  });
}
function box(page, x, y, w, h, opts) {
  page.drawRectangle({ x, y: y - h, width: w, height: h, ...(opts || {}) });
}

function gradeFromPct(pct) {
  if (pct >= 90) return { grade: "A+", label: "Outstanding" };
  if (pct >= 80) return { grade: "A", label: "Excellent" };
  if (pct >= 70) return { grade: "B+", label: "Very Good" };
  if (pct >= 60) return { grade: "B", label: "Good" };
  if (pct >= 50) return { grade: "C", label: "Average" };
  if (pct >= 33) return { grade: "D", label: "Pass" };
  return { grade: "F", label: "Fail" };
}

function divisionFromPct(pct) {
  if (pct >= 60) return "FIRST DIVISION";
  if (pct >= 45) return "SECOND DIVISION";
  if (pct >= 33) return "THIRD DIVISION";
  return "FAIL";
}

async function embedImage(pdfDoc, url) {
  if (!url) return null;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const buf = new Uint8Array(await res.arrayBuffer());
    try {
      return await pdfDoc.embedPng(buf);
    } catch (_) {}
    try {
      return await pdfDoc.embedJpg(buf);
    } catch (_) {}
    return null;
  } catch (_) {
    return null;
  }
}

function drawHalfBackground(page, topY, bottomY) {
  box(page, ML - 8, topY, CW + 16, topY - bottomY, { color: C.white });

  const outerPad = 10;
  page.drawRectangle({
    x: ML - 6,
    y: bottomY + outerPad,
    width: CW + 12,
    height: topY - bottomY - outerPad * 2,
    borderColor: C.ink,
    borderWidth: 1.2,
  });
  page.drawRectangle({
    x: ML - 4,
    y: bottomY + outerPad + 2,
    width: CW + 8,
    height: topY - bottomY - outerPad * 2 - 4,
    borderColor: C.gold,
    borderWidth: 0.5,
  });

  function drawCorner(cx, cy, sx, sy) {
    const arm = 14;
    hl(page, cx, cx + arm * sx, cy, 1.2, C.gold);
    vl(page, cx, cy, cy + arm * sy, 1.2, C.gold);
    page.drawEllipse({ x: cx, y: cy, xScale: 2, yScale: 2, color: C.gold });
    page.drawEllipse({
      x: cx + arm * sx,
      y: cy,
      xScale: 1.5,
      yScale: 1.5,
      color: C.goldLight,
    });
    page.drawEllipse({
      x: cx,
      y: cy + arm * sy,
      xScale: 1.5,
      yScale: 1.5,
      color: C.goldLight,
    });
  }

  const cp = ML - 6 + outerPad;
  const cpR = RX + 6 - outerPad;
  drawCorner(cp, topY - outerPad, 1, -1);
  drawCorner(cpR, topY - outerPad, -1, -1);
  drawCorner(cp, bottomY + outerPad, 1, 1);
  drawCorner(cpR, bottomY + outerPad, -1, 1);
}

async function drawHalfHeader(
  page,
  pdfDoc,
  school,
  bold,
  regular,
  topY,
  logoImg,
) {
  const HH = 70;
  const hTop = topY - 14;
  const hBot = hTop - HH;

  for (let i = 0; i <= HH; i++) {
    const t = i / HH;
    const r = 0.04 + t * 0.08;
    const g = 0.07 + t * 0.11;
    const b = 0.16 + t * 0.22;
    box(page, ML, hTop - i, CW, 1, { color: rgb(r, g, b) });
  }

  box(page, ML, hTop, CW, 3.5, { color: C.gold });
  box(page, ML, hTop - 3.5, CW, 1, { color: C.goldLight });
  box(page, ML, hBot + 4, CW, 2.5, { color: C.gold });
  box(page, ML, hBot + 1.5, CW, 1, { color: C.goldLight });

  function heraldDot(x, y, size) {
    page.drawEllipse({ x, y, xScale: size, yScale: size, color: C.gold });
    page.drawEllipse({
      x,
      y,
      xScale: size * 0.45,
      yScale: size * 0.45,
      color: C.goldLight,
    });
  }
  for (let i = 0; i <= 14; i++) {
    heraldDot(ML + i * (CW / 14), hTop - 1.8, 2.2);
    heraldDot(ML + i * (CW / 14), hBot + 3, 1.8);
  }

  const logoSize = 42;
  const lPad = 12;
  const logoX = ML + lPad;
  const logoCY = hBot + HH / 2 + 2;

  if (logoImg) {
    const asp = logoImg.width / logoImg.height;
    const iW = asp >= 1 ? logoSize : logoSize * asp;
    const iH = asp >= 1 ? logoSize / asp : logoSize;
    page.drawImage(logoImg, {
      x: logoX + (logoSize - iW) / 2,
      y: logoCY - iH / 2,
      width: iW,
      height: iH,
    });
  }

  const txtL = ML + lPad + logoSize + lPad + 6;
  const dividerW = RX - 6 - txtL;
  const divCX = txtL + dividerW / 2;

  const schoolName = school.name.toUpperCase();
  const snSize = schoolName.length > 32 ? 13 : schoolName.length > 22 ? 15 : 17;
  const snW = bold.widthOfTextAtSize(schoolName, snSize);
  page.drawText(schoolName, {
    x: divCX - snW / 2,
    y: hTop - 20,
    size: snSize,
    font: bold,
    color: C.gold,
  });

  const ulY = hTop - 26;
  const ulW = Math.min(snW + 30, dividerW - 10);
  hl(page, divCX - ulW / 2, divCX + ulW / 2, ulY, 0.9, C.gold);
  hl(page, divCX - ulW / 2 + 6, divCX + ulW / 2 - 6, ulY - 2, 0.3, C.goldLight);

  const addrFontSize = 7.5;
  const addrW = regular.widthOfTextAtSize(school.address, addrFontSize);
  page.drawText(school.address, {
    x: divCX - addrW / 2,
    y: ulY - 12,
    size: addrFontSize,
    font: regular,
    color: C.mist,
  });
 
 const sepY = ulY - 24;
  // hl line removed — no horizontal line near MARK SHEET

  const msTitle = "MARK  SHEET";
  const msSize = 9;
  const msW = bold.widthOfTextAtSize(msTitle, msSize);
  const pillW = msW + 28;
  const pillH = 15;
  const pillX = divCX - pillW / 2;
  const msY = hBot + 10;

  box(page, pillX, msY + pillH - 2, pillW, pillH, {
    color: C.ink,
    borderColor: C.gold,
    borderWidth: 1,
  });
  page.drawText(msTitle, {
    x: divCX - msW / 2,
    y: msY + 2,
    size: msSize,
    font: bold,
    color: C.gold,
  });

  return hBot;
}

function drawStudentInfo(page, fonts, student, startY) {
  const { bold, regular } = fonts;
  let y = startY - 5;

  const SH = 16;
  box(page, ML, y, CW, SH, { color: C.ink });
  page.drawText("STUDENT INFORMATION", {
    x: ML + 12,
    y: y - SH + 5,
    size: 7,
    font: bold,
    color: C.gold,
  });
  page.drawEllipse({
    x: RX - 10,
    y: y - SH / 2,
    xScale: 2.5,
    yScale: 2.5,
    color: C.gold,
  });
  page.drawEllipse({
    x: RX - 18,
    y: y - SH / 2,
    xScale: 1.5,
    yScale: 1.5,
    color: C.goldLight,
  });
  y -= SH;

  const c1W = CW * 0.38;
  const c2W = CW * 0.33;
  const c3W = CW - c1W - c2W;
  const cXArr = [ML, ML + c1W, ML + c1W + c2W];

  const rows = [
    [
      {
        label: "Student Name",
        value: (student.name || "").toUpperCase(),
        isBold: true,
      },
      {
        label: "Father's Name",
        value: (student.fatherName || "").toUpperCase(),
      },
      { label: "Roll Number", value: student.rollNo || "" },
    ],
    [
      {
        label: "Mother's Name",
        value: (student.motherName || "").toUpperCase(),
      },
      { label: "Class / Section", value: student.class || "" },
      {
        label: "Exam Type",
        value: (student.examType || "Annual").toUpperCase(),
      },
    ],
  ];

  rows.forEach((row, ri) => {
    const RH = 22;
    const rowY = y;
    const bg = ri % 2 === 0 ? C.white : C.paleCream;
    box(page, ML, rowY, CW, RH, { color: bg });
    box(page, ML, rowY, 3, RH, { color: ri % 2 === 0 ? C.inkLight : C.gold });
    hl(page, ML, RX, rowY - RH, 0.3, C.border);

    row.forEach((cell, ci) => {
      if (ci > 0) vl(page, cXArr[ci], rowY, rowY - RH, 0.3, C.border);
      const cellX = cXArr[ci] + (ci === 0 ? 8 : 6);
      page.drawText(cell.label.toUpperCase(), {
        x: cellX,
        y: rowY - 8,
        size: 4.8,
        font: bold,
        color: C.inkSoft,
      });
      const maxLen = ci === 0 ? 26 : 20;
      const raw = cell.value || "";
      const val = raw.length > maxLen ? raw.substring(0, maxLen) + "..." : raw;
      page.drawText(val, {
        x: cellX,
        y: rowY - 18,
        size: cell.isBold ? 7.5 : 7,
        font: cell.isBold ? bold : regular,
        color: C.dark,
      });
    });

    vl(page, RX, rowY, rowY - RH, 0.3, C.border);
    y -= RH;
  });

  hl(page, ML, RX, y, 0.8, C.gold);
  hl(page, ML, RX, y - 1.5, 0.3, C.goldLight);

  return y;
}

function drawMarksTable(page, fonts, marks, startY) {
  const { bold, regular } = fonts;
  let y = startY - 5;

  const SH = 16;
  box(page, ML, y, CW, SH, { color: C.inkMid });
  page.drawText("ACADEMIC PERFORMANCE", {
    x: ML + 12,
    y: y - SH + 5,
    size: 7,
    font: bold,
    color: C.gold,
  });
  page.drawEllipse({
    x: RX - 10,
    y: y - SH / 2,
    xScale: 2.5,
    yScale: 2.5,
    color: C.gold,
  });
  page.drawEllipse({
    x: RX - 18,
    y: y - SH / 2,
    xScale: 1.5,
    yScale: 1.5,
    color: C.goldLight,
  });
  y -= SH;

  const cW = [CW * 0.45, CW * 0.18, CW * 0.18, CW * 0.19];
  const cX = [ML];
  for (let i = 0; i < cW.length - 1; i++) cX.push(cX[i] + cW[i]);

  const TRH = 18;
  box(page, ML, y, CW, TRH, { color: C.inkLight });
  const hLabels = ["SUBJECT", "MAX MARKS", "MARKS OBTAINED", "GRADE"];
  hLabels.forEach((h, i) => {
    const tw = bold.widthOfTextAtSize(h, 6);
    const x = i === 0 ? cX[i] + 8 : cX[i] + cW[i] / 2 - tw / 2;
    page.drawText(h, {
      x,
      y: y - TRH + 6,
      size: 6,
      font: bold,
      color: C.white,
    });
  });
  for (let i = 1; i < cX.length; i++)
    vl(page, cX[i], y, y - TRH, 0.4, rgb(0.3, 0.42, 0.65));
  vl(page, RX, y, y - TRH, 0.4, rgb(0.3, 0.42, 0.65));
  y -= TRH;

  let totalObt = 0;
  let totalMax = 0;

  marks.forEach((row, idx) => {
    const RH = 20;
    const bg = idx % 2 === 0 ? C.white : C.rowAlt;
    box(page, ML, y, CW, RH, { color: bg });

    const pct = row.max > 0 ? (row.obtained / row.max) * 100 : 0;
    const { grade } = gradeFromPct(pct);
    const gradeColor =
      grade === "A+" || grade === "A"
        ? C.gradA
        : grade === "B+" || grade === "B"
          ? C.gradB
          : grade === "C"
            ? C.gradC
            : C.gradF;

    box(page, ML, y, 3, RH, { color: idx % 2 === 0 ? C.inkSoft : C.gold });
    hl(page, ML, RX, y, 0.25, C.border);
    hl(page, ML, RX, y - RH, 0.25, C.border);
    for (let i = 1; i < cX.length; i++)
      vl(page, cX[i], y, y - RH, 0.25, C.border);
    vl(page, RX, y, y - RH, 0.25, C.border);

    page.drawText(row.subject || "", {
      x: cX[0] + 8,
      y: y - 13,
      size: 7.5,
      font: regular,
      color: C.dark,
    });

    const cols = [String(row.max), String(row.obtained)];
    cols.forEach((v, i) => {
      const tw = regular.widthOfTextAtSize(v, 7.5);
      page.drawText(v, {
        x: cX[i + 1] + cW[i + 1] / 2 - tw / 2,
        y: y - 13,
        size: 7.5,
        font: regular,
        color: C.charcoal,
      });
    });

    const gradeW = bold.widthOfTextAtSize(grade, 8);
    page.drawText(grade, {
      x: cX[3] + cW[3] / 2 - gradeW / 2,
      y: y - 13,
      size: 8,
      font: bold,
      color: gradeColor,
    });

    totalObt += Number(row.obtained) || 0;
    totalMax += Number(row.max) || 0;
    y -= RH;
  });

  const TotH = 20;
  box(page, ML, y, CW, TotH, { color: C.ink });
  for (let i = 1; i < cX.length; i++)
    vl(page, cX[i], y, y - TotH, 0.35, C.inkSoft);
  vl(page, RX, y, y - TotH, 0.35, C.inkSoft);

  page.drawText("GRAND TOTAL", {
    x: cX[0] + 8,
    y: y - 13,
    size: 7,
    font: bold,
    color: C.goldLight,
  });

  const totalPct = totalMax > 0 ? (totalObt / totalMax) * 100 : 0;
  const tCols = [String(totalMax), String(totalObt)];
  tCols.forEach((v, i) => {
    const tw = bold.widthOfTextAtSize(v, 7.5);
    page.drawText(v, {
      x: cX[i + 1] + cW[i + 1] / 2 - tw / 2,
      y: y - 13,
      size: 7.5,
      font: bold,
      color: C.white,
    });
  });

  const { grade: tg } = gradeFromPct(totalPct);
  const tgW = bold.widthOfTextAtSize(tg, 8);
  page.drawText(tg, {
    x: cX[3] + cW[3] / 2 - tgW / 2,
    y: y - 13,
    size: 8,
    font: bold,
    color: C.goldLight,
  });

  y -= TotH;
  hl(page, ML, RX, y, 0.8, C.gold);
  hl(page, ML, RX, y - 1.5, 0.3, C.goldLight);

  return { y, totalObt, totalMax };
}

async function drawResultSummary(
  page,
  fonts,
  totalObt,
  totalMax,
  startY,
  signUrl,
  pdfDoc,
) {
  const { bold, regular } = fonts;
  let y = startY - 5;

  const pct = totalMax > 0 ? (totalObt / totalMax) * 100 : 0;
  const { grade, label } = gradeFromPct(pct);
  const division = divisionFromPct(pct);
  const isPassed = pct >= 33;

  const cardH = 52;
  for (let i = 0; i <= cardH; i++) {
    const t = i / cardH;
    const gv = 0.99 - t * 0.04;
    const gb = 0.96 - t * 0.03;
    box(page, ML, y - i, CW, 1, { color: rgb(gv, gv, gb) });
  }
  hl(page, ML, RX, y, 0.4, C.border);
  hl(page, ML, RX, y - cardH, 0.4, C.border);
  vl(page, ML, y, y - cardH, 0.4, C.border);
  vl(page, RX, y, y - cardH, 0.4, C.border);

  const bW = CW / 4;
  const blocks = [
    {
      label: "MARKS OBTAINED",
      value: String(totalObt),
      sub: "out of " + totalMax,
      topColor: C.inkMid,
    },
    {
      label: "PERCENTAGE",
      value: pct.toFixed(1) + "%",
      sub: label,
      topColor: C.inkLight,
    },
    {
      label: "DIVISION",
      value: division.replace(" DIVISION", ""),
      sub: "DIVISION",
      topColor: C.inkMid,
    },
    {
      label: "FINAL RESULT",
      value: isPassed ? "PASS" : "FAIL",
      sub: "Grade: " + grade,
      topColor: isPassed ? C.passGreen : C.failRed,
    },
  ];

  blocks.forEach((bd, i) => {
    const bx = ML + i * bW;
    if (i > 0) vl(page, bx, y, y - cardH, 0.4, C.border);
    box(page, bx + (i > 0 ? 1 : 0), y, bW - (i > 0 ? 1 : 0), 3, {
      color: bd.topColor,
    });

    const lW = bold.widthOfTextAtSize(bd.label, 5.2);
    page.drawText(bd.label, {
      x: bx + bW / 2 - lW / 2,
      y: y - 12,
      size: 5.2,
      font: bold,
      color: C.slate,
    });

    const valFontSize = i === 3 ? 16 : 15;
    const valColor =
      i === 3 ? (isPassed ? C.passGreen : C.failRed) : C.inkLight;
    const vW = bold.widthOfTextAtSize(bd.value, valFontSize);
    page.drawText(bd.value, {
      x: bx + bW / 2 - vW / 2,
      y: y - 32,
      size: valFontSize,
      font: bold,
      color: valColor,
    });

    const sW = regular.widthOfTextAtSize(bd.sub, 5.5);
    page.drawText(bd.sub, {
      x: bx + bW / 2 - sW / 2,
      y: y - 44,
      size: 5.5,
      font: regular,
      color: C.slate,
    });
  });

  y -= cardH;

  const sigH = 34;
  box(page, ML, y, CW, sigH, { color: C.white });
  hl(page, ML, RX, y, 0.35, C.border);
  hl(page, ML, RX, y - sigH, 0.5, C.border);
  vl(page, ML, y, y - sigH, 0.35, C.border);
  vl(page, RX, y, y - sigH, 0.35, C.border);

  let signImage = null;
  if (signUrl) signImage = await embedImage(pdfDoc, signUrl);

  const classTeacherX = ML + CW * 0.08;
  hl(page, classTeacherX, classTeacherX + 80, y - 20, 0.5, C.inkSoft);
  const ctLW = regular.widthOfTextAtSize("Class Teacher", 5.5);
  page.drawText("Class Teacher", {
    x: classTeacherX + 40 - ctLW / 2,
    y: y - 28,
    size: 5.5,
    font: regular,
    color: C.slate,
  });

  const principalX = ML + CW * 0.76;

  if (signImage) {
    const signWidth = 65;
    const signHeight = 22;
    page.drawImage(signImage, {
      x: principalX + 40 - signWidth / 2,
      y: y - 23,
      width: signWidth,
      height: signHeight,
    });
  }

  hl(page, principalX, principalX + 80, y - 20, 0.5, C.inkSoft);
  const prLW = regular.widthOfTextAtSize("Principal", 5.5);
  page.drawText("Principal", {
    x: principalX + 40 - prLW / 2,
    y: y - 28,
    size: 5.5,
    font: regular,
    color: C.slate,
  });

  const dateStr =
    "Date: " +
    new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  page.drawText(dateStr, {
    x: RX - regular.widthOfTextAtSize(dateStr, 5.5) - 6,
    y: y - 8,
    size: 5.5,
    font: regular,
    color: C.slate,
  });

  y -= sigH;
  hl(page, ML, RX, y, 0.8, C.gold);
  hl(page, ML, RX, y - 1.5, 0.3, C.goldLight);

  return y;
}

async function generateMarksheetPdf(data) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([PW, PH]);

  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const regular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fonts = { bold, regular };

  const logoImg = await embedImage(pdfDoc, data.school.logoUrl);

  box(page, 0, PH, PW, PH, { color: C.white });

  const school = {
    ...data.school,
    examType: data.examType || "Annual",
    session: data.session || new Date().getFullYear().toString(),
  };

  const students = data.students || [];
  const s1 = students[0] || {};
  const s2 = students[1] || {};

  drawHalfBackground(page, PH, HALF_H + 8);
  const h1Bot = await drawHalfHeader(
    page,
    pdfDoc,
    school,
    bold,
    regular,
    PH,
    logoImg,
  );
  let y1 = h1Bot;
  y1 = drawStudentInfo(page, fonts, { ...s1, examType: school.examType }, y1);
  const {
    y: y1a,
    totalObt: to1,
    totalMax: tm1,
  } = drawMarksTable(page, fonts, s1.marks || [], y1);
  await drawResultSummary(
    page,
    fonts,
    to1,
    tm1,
    y1a,
    data.school.signUrl,
    pdfDoc,
  );

  drawHalfBackground(page, HALF_H - 8, 0);
  const h2Bot = await drawHalfHeader(
    page,
    pdfDoc,
    school,
    bold,
    regular,
    HALF_H - 10,
    logoImg,
  );
  let y2 = h2Bot;
  y2 = drawStudentInfo(page, fonts, { ...s2, examType: school.examType }, y2);
  const {
    y: y2a,
    totalObt: to2,
    totalMax: tm2,
  } = drawMarksTable(page, fonts, s2.marks || [], y2);
  await drawResultSummary(
    page,
    fonts,
    to2,
    tm2,
    y2a,
    data.school.signUrl,
    pdfDoc,
  );

  const bytes = await pdfDoc.save();
  return Buffer.from(bytes);
}

module.exports = { generateMarksheetPdf };
