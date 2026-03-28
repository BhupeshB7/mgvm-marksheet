const { PDFDocument, rgb, StandardFonts } = require("pdf-lib");

const PW = 595.28;
const PH = 841.89;
const ML = 32;
const MR = 32;
const CW = PW - ML - MR;
const RX = PW - MR;
const CX = PW / 2;

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
  passBg: rgb(0.9, 0.98, 0.93),
  failRed: rgb(0.75, 0.12, 0.12),
  failBg: rgb(0.99, 0.92, 0.92),
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
function cText(page, text, font, size, color, y, x1, x2) {
  const tw = font.widthOfTextAtSize(text, size);
  const mx = x1 !== undefined ? (x1 + x2) / 2 : CX;
  page.drawText(text, { x: mx - tw / 2, y, size, font, color });
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

function drawPageBackground(page, pdfDoc, schoolLogo) {
  box(page, 0, PH, PW, PH, { color: C.white });

  box(page, 0, PH, PW, 7, { color: C.ink });
  box(page, 0, 7, PW, 3.5, { color: C.gold });
  box(page, 0, 10.5, PW, 1.5, { color: C.inkLight });

  box(page, 0, 12, PW, 1.5, { color: C.inkLight });
  box(page, 0, 10.5, PW, 1.5, { color: C.gold });

  box(page, 0, 0, PW, 7, { color: C.ink });
  box(page, 0, 7, PW, 3.5, { color: C.gold });
  box(page, 0, 10.5, PW, 1.5, { color: C.inkLight });

  const outerPad = 15;
  page.drawRectangle({
    x: outerPad,
    y: outerPad,
    width: PW - outerPad * 2,
    height: PH - outerPad * 2,
    borderColor: C.ink,
    borderWidth: 2,
  });
  page.drawRectangle({
    x: outerPad + 1.5,
    y: outerPad + 1.5,
    width: PW - (outerPad + 3.5) * 2,
    height: PH - (outerPad + 3.5) * 2,
    borderColor: C.gold,
    borderWidth: 0.9,
  });
  page.drawRectangle({
    x: outerPad + 6,
    y: outerPad + 6,
    width: PW - (outerPad + 6) * 2,
    height: PH - (outerPad + 6) * 2,
    borderColor: C.inkSoft,
    borderWidth: 0.35,
  });

  function drawCorner(cx, cy, sx, sy) {
    const arm = 22;
    hl(page, cx, cx + arm * sx, cy, 1.6, C.gold);
    vl(page, cx, cy, cy + arm * sy, 1.6, C.gold);
    hl(page, cx + 3 * sx, cx + (arm - 2) * sx, cy + 3 * sy, 0.5, C.goldLight);
    vl(page, cx + 3 * sx, cy + 3 * sy, cy + (arm - 2) * sy, 0.5, C.goldLight);
    page.drawEllipse({ x: cx, y: cy, xScale: 2.5, yScale: 2.5, color: C.gold });
    page.drawEllipse({
      x: cx,
      y: cy,
      xScale: 1.5,
      yScale: 1.5,
      color: C.goldLight,
    });
    page.drawEllipse({
      x: cx + arm * sx,
      y: cy,
      xScale: 2.5,
      yScale: 2.5,
      color: C.gold,
    });
    page.drawEllipse({
      x: cx,
      y: cy + arm * sy,
      xScale: 2.5,
      yScale: 2.5,
      color: C.gold,
    });
  }

  const cp = outerPad + 7;
  drawCorner(cp, PH - cp, 1, -1);
  drawCorner(PW - cp, PH - cp, -1, -1);
  drawCorner(cp, cp, 1, 1);
  drawCorner(PW - cp, cp, -1, 1);

  function sideDiamond(x, y) {
    const s = 5;
    [
      [-s, 0],
      [0, s],
      [s, 0],
      [0, -s],
      [-s, 0],
    ].reduce((prev, cur) => {
      if (prev) {
        page.drawLine({
          start: { x: x + prev[0], y: y + prev[1] },
          end: { x: x + cur[0], y: y + cur[1] },
          thickness: 0.9,
          color: C.goldLight,
        });
      }
      return cur;
    }, null);
    page.drawEllipse({ x, y, xScale: 2, yScale: 2, color: C.gold });
  }

  sideDiamond(outerPad + 5, PH / 2);
  sideDiamond(PW - outerPad - 5, PH / 2);

  function floral(cx, cy, r, petals, colR, colG, colB) {
    for (let i = 0; i < petals; i++) {
      const angle = (i / petals) * Math.PI * 2;
      const px = cx + Math.cos(angle) * r;
      const py = cy + Math.sin(angle) * r;
      page.drawEllipse({
        x: px,
        y: py,
        xScale: r * 0.35,
        yScale: r * 0.16,
        color: rgb(colR, colG, colB),
        opacity: 0.06,
      });
    }
    for (let i = 0; i < petals; i++) {
      const angle = (i / petals) * Math.PI * 2 + Math.PI / petals;
      const px = cx + Math.cos(angle) * r * 0.55;
      const py = cy + Math.sin(angle) * r * 0.55;
      page.drawEllipse({
        x: px,
        y: py,
        xScale: r * 0.22,
        yScale: r * 0.1,
        color: rgb(colR, colG, colB),
        opacity: 0.04,
      });
    }
    page.drawEllipse({
      x: cx,
      y: cy,
      xScale: r * 0.18,
      yScale: r * 0.18,
      color: rgb(colR, colG, colB),
      opacity: 0.08,
    });
  }

  floral(CX, PH / 2, 55, 12, 0.8, 0.64, 0.18);
  floral(CX, PH / 2, 32, 8, 0.18, 0.28, 0.52);

  if (schoolLogo) {
    const logoSize = 90;
    const logoX = CX - logoSize / 2;
    const logoY = PH / 2 - logoSize / 2;
    page.drawImage(schoolLogo, {
      x: logoX,
      y: logoY,
      width: logoSize,
      height: logoSize,
      opacity: 0.08,
    });
  }
}

async function embedImage(pdfDoc, url) {
  if (!url) return null;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const buf = new Uint8Array(await res.arrayBuffer());
    try {
      return await pdfDoc.embedPng(buf);
    } catch (e) {}
    try {
      return await pdfDoc.embedJpg(buf);
    } catch (e) {}
    return null;
  } catch (e) {
    return null;
  }
}

async function drawHeader(page, pdfDoc, school, bold, regular) {
  const TOP_MARGIN = 9;
  const HH = 158;
  const hTop = PH - 20 - TOP_MARGIN;
  const hBot = hTop - HH;

  for (let i = 0; i <= HH; i++) {
    const t = i / HH;
    const r = 0.04 + t * 0.08;
    const g = 0.07 + t * 0.11;
    const b = 0.16 + t * 0.22;
    box(page, ML, hTop - i, CW, 1, { color: rgb(r, g, b) });
  }

  for (let i = 0; i < 18; i++) {
    const gx = ML + (i + 0.5) * (CW / 18);
    box(page, gx, hBot, 1, HH, { color: rgb(1, 1, 1), opacity: 0.015 });
  }

  box(page, ML, hTop, CW, 4.5, { color: C.gold });
  box(page, ML, hTop - 4.5, CW, 1.5, { color: C.goldLight });
  box(page, ML, hTop - 6, CW, 0.5, { color: rgb(1, 1, 1), opacity: 0.15 });

  box(page, ML, hBot + 5, CW, 3, { color: C.gold });
  box(page, ML, hBot + 2, CW, 1.2, { color: C.goldLight });
  box(page, ML, hBot + 0.8, CW, 0.5, { color: C.inkSoft });

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
  for (let i = 0; i <= 18; i++) {
    heraldDot(ML + i * (CW / 18), hTop - 2.2, 3);
    heraldDot(ML + i * (CW / 18), hBot + 3.5, 2.2);
  }

  const logoImg = await embedImage(pdfDoc, school.logoUrl);
  const logoSize = 55;
  const lPad = 15;
  const logoX = ML + lPad;
  const logoCY = hBot + HH / 2 + 4;

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
  } else {
    const initials = school.name
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0].toUpperCase())
      .join("");
    page.drawText(initials, {
      x: logoX + logoSize / 2 - bold.widthOfTextAtSize(initials, 26) / 2,
      y: logoCY - 10,
      size: 26,
      font: bold,
      color: C.gold,
    });
  }

  const txtL = ML + lPad + logoSize + lPad + 10;
  const txtCX = (txtL + RX - 6) / 2;

  const SCHOOL_NAME_TOP_MARGIN = 35;
  const decorY1 = hTop - SCHOOL_NAME_TOP_MARGIN;
  const dividerW = RX - 6 - txtL;
  const divCX = txtL + dividerW / 2;

  const schoolName = school.name.toUpperCase();
  const snSize = schoolName.length > 32 ? 22 : schoolName.length > 22 ? 26 : 30;
  const snW = bold.widthOfTextAtSize(schoolName, snSize);
  page.drawText(schoolName, {
    x: divCX - snW / 2,
    y: decorY1,
    size: snSize,
    font: bold,
    color: C.gold,
  });

  const underlineY = decorY1 - 5;
  const ulW = Math.min(snW + 40, dividerW - 10);
  hl(page, divCX - ulW / 2, divCX + ulW / 2, underlineY, 1.2, C.gold);
  hl(
    page,
    divCX - ulW / 2 + 8,
    divCX + ulW / 2 - 8,
    underlineY - 2.5,
    0.4,
    C.goldLight,
  );

  page.drawEllipse({
    x: divCX - ulW / 2 - 4,
    y: underlineY - 1,
    xScale: 2.5,
    yScale: 2.5,
    color: C.gold,
  });
  page.drawEllipse({
    x: divCX + ulW / 2 + 4,
    y: underlineY - 1,
    xScale: 2.5,
    yScale: 2.5,
    color: C.gold,
  });

  if (school.affiliation) {
    const afW = regular.widthOfTextAtSize(school.affiliation, 7.8);
    page.drawText(school.affiliation, {
      x: divCX - afW / 2,
      y: underlineY - 14,
      size: 7.8,
      font: regular,
      color: C.goldLight,
    });
  }

  const addrFontSize = 11.5;
  const addrLineY = underlineY - (school.affiliation ? 28 : 16);
  const addrW = regular.widthOfTextAtSize(school.address, addrFontSize);
  page.drawText(school.address, {
    x: divCX - addrW / 2,
    y: addrLineY - 4,
    size: addrFontSize,
    font: regular,
    color: C.mist,
  });

  const contacts = [];
  if (school.phone) contacts.push(school.phone);
  if (school.email) contacts.push(school.email);
  const cLine = contacts.join("        ");
  const contactFontSize = 9;
  const clW = regular.widthOfTextAtSize(cLine, contactFontSize);
  page.drawText(cLine, {
    x: divCX - clW / 2,
    y: addrLineY - 13 - 4,
    size: contactFontSize,
    font: regular,
    color: C.mist,
  });

  const sepY = addrLineY - 26;
  const sepW = dividerW * 0.7;
  hl(page, divCX - sepW / 2, divCX + sepW / 2, sepY, 0.4, C.inkSoft);
  page.drawEllipse({
    x: divCX,
    y: sepY,
    xScale: 2.8,
    yScale: 2.8,
    color: C.gold,
    opacity: 0.5,
  });
  page.drawEllipse({
    x: divCX - sepW / 2 - 5,
    y: sepY,
    xScale: 1.8,
    yScale: 1.8,
    color: C.goldLight,
    opacity: 0.6,
  });
  page.drawEllipse({
    x: divCX + sepW / 2 + 5,
    y: sepY,
    xScale: 1.8,
    yScale: 1.8,
    color: C.goldLight,
    opacity: 0.6,
  });

  const examLine =
    (school.examType || "ANNUAL").toUpperCase() +
    "  EXAMINATION     \u2022     SESSION  " +
    (school.session || "");
  const elSize = 8;
  const elW = bold.widthOfTextAtSize(examLine, elSize);
  page.drawText(examLine, {
    x: divCX - elW / 2,
    y: sepY - 13 - 4,
    size: elSize,
    font: bold,
    color: C.goldLight,
  });

  const msTitle = "MARK  SHEET";
  const msSize = 11.5;
  const msW = bold.widthOfTextAtSize(msTitle, msSize);
  const msX = divCX - msW / 2;
  const msY = hBot + 16;

  const pillW = msW + 36;
  const pillH = 20;
  const pillX = divCX - pillW / 2;

  box(page, pillX, msY + pillH - 2, pillW, pillH, {
    color: rgb(1, 1, 1),
    opacity: 0.1,
    borderColor: C.gold,
    borderWidth: 0.9,
  });
  box(page, pillX + 3, msY + pillH - 5, pillW - 6, pillH - 6, {
    color: rgb(1, 1, 1),
    opacity: 0.05,
    borderColor: C.goldLight,
    borderWidth: 0.4,
  });

  for (let i = 0; i < 4; i++) {
    const dotSpacing = pillW / 5;
    const dotY = msY + pillH - 2 - pillH / 2;
    page.drawEllipse({
      x: pillX + (i + 1) * dotSpacing,
      y: dotY,
      xScale: 0.8,
      yScale: 0.8,
      color: C.goldLight,
      opacity: 0.2,
    });
  }

  page.drawText(msTitle, {
    x: msX,
    y: msY + 4,
    size: msSize,
    font: bold,
    color: C.white,
  });

  return hBot;
}

function drawStudentDetails(page, fonts, student, startY) {
  const { bold, regular } = fonts;
  let y = startY - 10;

  const SH = 22;
  box(page, ML, y, CW, SH, { color: C.ink });
  page.drawText("STUDENT INFORMATION", {
    x: ML + 16,
    y: y - SH + 8,
    size: 8.5,
    font: bold,
    color: C.gold,
  });
  const dotX = RX - 12;
  page.drawEllipse({
    x: dotX,
    y: y - SH / 2,
    xScale: 3,
    yScale: 3,
    color: C.gold,
  });
  page.drawEllipse({
    x: dotX - 10,
    y: y - SH / 2,
    xScale: 2,
    yScale: 2,
    color: C.goldLight,
  });
  page.drawEllipse({
    x: dotX - 18,
    y: y - SH / 2,
    xScale: 2,
    yScale: 2,
    color: C.goldLight,
  });
  y -= SH;

  const colW = CW / 2;
  const rows = [
    [
      { label: "Student Name", value: (student.name || "").toUpperCase() },
      { label: "Roll Number", value: student.rollNo || "" },
    ],
    [
      {
        label: "Father's Name",
        value: (student.fatherName || "").toUpperCase(),
      },
      { label: "Class / Section", value: student.class || "" },
    ],
    [
      {
        label: "Mother's Name",
        value: (student.motherName || "").toUpperCase(),
      },
      { label: "Academic Session", value: student.session || "" },
    ],
  ];

  rows.forEach((row, ri) => {
    const RH = 28;
    const rowY = y;
    const bg = ri % 2 === 0 ? C.white : C.paleCream;
    box(page, ML, rowY, CW, RH, { color: bg });

    const accentCol = ri % 2 === 0 ? C.inkLight : C.gold;
    box(page, ML, rowY, 3, RH, { color: accentCol });

    hl(page, ML, RX, rowY - RH, 0.4, C.border);

    row.forEach((cell, ci) => {
      const cx = ci === 0 ? ML : ML + colW;
      if (ci === 1) vl(page, ML + colW, rowY, rowY - RH, 0.4, C.border);

      page.drawText(cell.label.toUpperCase(), {
        x: cx + (ci === 0 ? 10 : 8),
        y: rowY - 10,
        size: 5.8,
        font: bold,
        color: C.inkSoft,
      });

      const val =
        (cell.value || "").length > 30
          ? cell.value.substring(0, 30) + "..."
          : cell.value || "";
      page.drawText(val, {
        x: cx + (ci === 0 ? 10 : 8),
        y: rowY - 22,
        size: ci === 0 ? 9 : 8.5,
        font: ci === 0 ? bold : regular,
        color: C.dark,
      });
    });

    vl(page, RX, rowY, rowY - RH, 0.4, C.border);
    y -= RH;
  });

  hl(page, ML, RX, y, 1.2, C.inkLight);
  hl(page, ML, RX, y - 1.5, 0.5, C.gold);
  hl(page, ML, RX, y - 3, 0.3, C.goldLight);

  return y;
}

function drawMarksTable(page, fonts, marks, startY) {
  const { bold, regular } = fonts;
  let y = startY - 10;

  const SH = 22;
  box(page, ML, y, CW, SH, { color: C.inkMid });
  page.drawText("ACADEMIC PERFORMANCE", {
    x: ML + 16,
    y: y - SH + 8,
    size: 8.5,
    font: bold,
    color: C.gold,
  });
  page.drawEllipse({
    x: RX - 12,
    y: y - SH / 2,
    xScale: 3,
    yScale: 3,
    color: C.gold,
  });
  page.drawEllipse({
    x: RX - 22,
    y: y - SH / 2,
    xScale: 2,
    yScale: 2,
    color: C.goldLight,
  });
  page.drawEllipse({
    x: RX - 30,
    y: y - SH / 2,
    xScale: 2,
    yScale: 2,
    color: C.goldLight,
  });
  y -= SH;

  const cW = [CW * 0.45, CW * 0.18, CW * 0.18, CW * 0.19];
  const cX = [ML];
  for (let i = 0; i < cW.length - 1; i++) cX.push(cX[i] + cW[i]);

  const TRH = 23;
  box(page, ML, y, CW, TRH, { color: C.inkLight });

  const hLabels = ["SUBJECT", "MAX MARKS", "MARKS OBTAINED", "GRADE"];
  hLabels.forEach((h, i) => {
    const tw = bold.widthOfTextAtSize(h, 7.5);
    const x = i === 0 ? cX[i] + 10 : cX[i] + cW[i] / 2 - tw / 2;
    page.drawText(h, {
      x,
      y: y - TRH + 8,
      size: 7.5,
      font: bold,
      color: C.white,
    });
  });

  for (let i = 1; i < cX.length; i++) {
    vl(page, cX[i], y, y - TRH, 0.5, rgb(0.3, 0.42, 0.65));
  }
  vl(page, RX, y, y - TRH, 0.5, rgb(0.3, 0.42, 0.65));
  y -= TRH;

  let totalObt = 0;
  let totalMax = 0;

  marks.forEach((row, idx) => {
    const RH = 24;
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

    hl(page, ML, RX, y, 0.3, C.border);
    hl(page, ML, RX, y - RH, 0.3, C.border);
    for (let i = 1; i < cX.length; i++)
      vl(page, cX[i], y, y - RH, 0.3, C.border);
    vl(page, RX, y, y - RH, 0.3, C.border);

    page.drawText(row.subject || "", {
      x: cX[0] + 10,
      y: y - 15,
      size: 8.5,
      font: regular,
      color: C.dark,
    });

    const cols = [String(row.max), String(row.obtained)];
    cols.forEach((v, i) => {
      const tw = regular.widthOfTextAtSize(v, 8.5);
      page.drawText(v, {
        x: cX[i + 1] + cW[i + 1] / 2 - tw / 2,
        y: y - 15,
        size: 8.5,
        font: regular,
        color: C.charcoal,
      });
    });

    const gradeW = bold.widthOfTextAtSize(grade, 9);
    page.drawText(grade, {
      x: cX[3] + cW[3] / 2 - gradeW / 2,
      y: y - 15,
      size: 9,
      font: bold,
      color: gradeColor,
    });

    totalObt += Number(row.obtained) || 0;
    totalMax += Number(row.max) || 0;
    y -= RH;
  });

  const TotH = 25;
  box(page, ML, y, CW, TotH, { color: C.ink });

  for (let i = 1; i < cX.length; i++)
    vl(page, cX[i], y, y - TotH, 0.4, C.inkSoft);
  vl(page, RX, y, y - TotH, 0.4, C.inkSoft);

  page.drawText("GRAND TOTAL", {
    x: cX[0] + 10,
    y: y - 17,
    size: 8.5,
    font: bold,
    color: C.goldLight,
  });

  const totalPct = totalMax > 0 ? (totalObt / totalMax) * 100 : 0;
  const tCols = [String(totalMax), String(totalObt)];
  tCols.forEach((v, i) => {
    const tw = bold.widthOfTextAtSize(v, 9);
    page.drawText(v, {
      x: cX[i + 1] + cW[i + 1] / 2 - tw / 2,
      y: y - 17,
      size: 9,
      font: bold,
      color: C.white,
    });
  });

  const { grade: tg } = gradeFromPct(totalPct);
  const tgW = bold.widthOfTextAtSize(tg, 9.5);
  page.drawText(tg, {
    x: cX[3] + cW[3] / 2 - tgW / 2,
    y: y - 17,
    size: 9.5,
    font: bold,
    color: C.goldLight,
  });

  y -= TotH;
  hl(page, ML, RX, y, 1.2, C.inkLight);
  hl(page, ML, RX, y - 1.5, 0.5, C.gold);
  hl(page, ML, RX, y - 3, 0.3, C.goldLight);

  return { y, totalObt, totalMax };
}

async function drawSummary(page, fonts, totalObt, totalMax, startY, signUrl, pdfDoc) {
  const { bold, regular } = fonts;
  let y = startY - 10;

  const SH = 22;
  box(page, ML, y, CW, SH, { color: C.ink });
  page.drawText("RESULT SUMMARY", {
    x: ML + 16,
    y: y - SH + 8,
    size: 8.5,
    font: bold,
    color: C.gold,
  });
  page.drawEllipse({
    x: RX - 12,
    y: y - SH / 2,
    xScale: 3,
    yScale: 3,
    color: C.gold,
  });
  page.drawEllipse({
    x: RX - 22,
    y: y - SH / 2,
    xScale: 2,
    yScale: 2,
    color: C.goldLight,
  });
  page.drawEllipse({
    x: RX - 30,
    y: y - SH / 2,
    xScale: 2,
    yScale: 2,
    color: C.goldLight,
  });
  y -= SH;

  const pct = totalMax > 0 ? (totalObt / totalMax) * 100 : 0;
  const { grade, label } = gradeFromPct(pct);
  const division = divisionFromPct(pct);
  const isPassed = pct >= 33;

  const cardH = 90;
  for (let i = 0; i <= cardH; i++) {
    const t = i / cardH;
    const gv = 0.99 - t * 0.04;
    const gb = 0.96 - t * 0.03;
    box(page, ML, y - i, CW, 1, { color: rgb(gv, gv, gb) });
  }
  hl(page, ML, RX, y, 0.5, C.border);
  hl(page, ML, RX, y - cardH, 0.5, C.border);
  vl(page, ML, y, y - cardH, 0.5, C.border);
  vl(page, RX, y, y - cardH, 0.5, C.border);

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
      sub: "",
      topColor: isPassed ? C.passGreen : C.failRed,
    },
  ];

  blocks.forEach((bd, i) => {
    const bx = ML + i * bW;
    if (i > 0) vl(page, bx, y, y - cardH, 0.5, C.border);

    box(page, bx + (i > 0 ? 1 : 0), y, bW - (i > 0 ? 1 : 0), 4, {
      color: bd.topColor,
    });

    const lW = bold.widthOfTextAtSize(bd.label, 6.2);
    page.drawText(bd.label, {
      x: bx + bW / 2 - lW / 2,
      y: y - 17,
      size: 6.2,
      font: bold,
      color: C.slate,
    });

    const valFontSize = i === 3 ? 24 : i === 1 ? 22 : 20;
    const valColor =
      i === 3 ? (isPassed ? C.passGreen : C.failRed) : C.inkLight;
    const vW = bold.widthOfTextAtSize(bd.value, valFontSize);
    page.drawText(bd.value, {
      x: bx + bW / 2 - vW / 2,
      y: y - 50,
      size: valFontSize,
      font: bold,
      color: valColor,
    });

    const sW = regular.widthOfTextAtSize(bd.sub, 7);
    page.drawText(bd.sub, {
      x: bx + bW / 2 - sW / 2,
      y: y - 64,
      size: 7,
      font: regular,
      color: C.slate,
    });

    if (i === 3) {
      const pillBg = isPassed ? C.passBg : C.failBg;
      const pillBorder = isPassed ? C.passGreen : C.failRed;
      const pillW = 60;
      const pillX = bx + bW / 2 - pillW / 2;
      box(page, pillX, y - 70, pillW, 14, {
        color: pillBg,
        borderColor: pillBorder,
        borderWidth: 0.8,
      });
      const gradeLabel = "Grade: " + grade;
      const glW = bold.widthOfTextAtSize(gradeLabel, 8);
      page.drawText(gradeLabel, {
        x: bx + bW / 2 - glW / 2,
        y: y - 80,
        size: 8,
        font: bold,
        color: pillBorder,
      });
    }
  });

  y -= cardH;

  const sigH = 46 + 50;
  box(page, ML, y, CW, sigH, { color: C.white });
  hl(page, ML, RX, y, 0.4, C.border);
  hl(page, ML, RX, y - sigH, 0.5, C.border);
  vl(page, ML, y, y - sigH, 0.4, C.border);
  vl(page, RX, y, y - sigH, 0.4, C.border);

  const sigLineOffset = 50;
  const sigLabelOffset = 53;
  const sigSealOffset = 62;

  let signImage = null;
  if (signUrl) {
    signImage = await embedImage(pdfDoc, signUrl);
  }

  const classTeacherX = ML + CW * 0.1;
  hl(page, classTeacherX, classTeacherX + 90, y - sigLineOffset, 0.6, C.inkSoft);

  const classTeacherLabelW = regular.widthOfTextAtSize("Class Teacher", 6.5);
  page.drawText("Class Teacher", {
    x: classTeacherX + 45 - classTeacherLabelW / 2,
    y: y - sigLabelOffset - 20,
    size: 6.5,
    font: regular,
    color: C.slate,
  });
  const sw = regular.widthOfTextAtSize("Signature & Seal", 5.5);
  page.drawText("Signature & Seal", {
    x: classTeacherX + 45 - sw / 2,
    y: y - sigSealOffset,
    size: 5.5,
    font: regular,
    color: C.mist,
  });

  const principalX = ML + CW * 0.76;

  if (signImage) {
    const signWidth = 80;
    const signHeight = 35;
    const signX = principalX + 45 - signWidth / 2;
    const signY = y - sigLineOffset - signHeight + 8;

    page.drawImage(signImage, {
      x: signX,
      y: signY,
      width: signWidth,
      height: signHeight,
    });
  }

  const principalLabelW = regular.widthOfTextAtSize("Principal", 6.5);
  page.drawText("Principal", {
    x: principalX + 45 - principalLabelW / 2,
    y: y - sigLabelOffset - 20,
    size: 6.5,
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
    x: RX - regular.widthOfTextAtSize(dateStr, 6.5) - 6,
    y: y - 10,
    size: 6.5,
    font: regular,
    color: C.slate,
  });

  y -= sigH;

  hl(page, ML, RX, y, 1.2, C.inkLight);
  hl(page, ML, RX, y - 1.5, 0.5, C.gold);
  hl(page, ML, RX, y - 3, 0.3, C.goldLight);

  return y;
}

async function generateMarksheetPdf(data) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([PW, PH]);

  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const regular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fonts = { bold, regular };

  const schoolLogo = await embedImage(pdfDoc, data.school.logoUrl);

  drawPageBackground(page, pdfDoc, schoolLogo);

  const school = {
    ...data.school,
    examType: data.examType || "Annual",
    session: data.session || new Date().getFullYear().toString(),
    affiliation: data.school.affiliation || "",
  };

  const student = {
    ...data.student,
    session: data.session || new Date().getFullYear().toString(),
  };

  const hBot = await drawHeader(page, pdfDoc, school, bold, regular);
  let y = hBot;

  y = drawStudentDetails(page, fonts, student, y);
  const {
    y: afterTable,
    totalObt,
    totalMax,
  } = drawMarksTable(page, fonts, data.marks, y);

  await drawSummary(page, fonts, totalObt, totalMax, afterTable, data.school.signUrl, pdfDoc);

  const bytes = await pdfDoc.save();
  return Buffer.from(bytes);
}

module.exports = { generateMarksheetPdf };
