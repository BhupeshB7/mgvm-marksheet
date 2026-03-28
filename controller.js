const { generateMarksheetPdf } = require("./template");

const samplePayload = {
  systemName: "SchoolERP Pro",
  examType: "Annual",
  session: "2025-2026",
  school: {
    name: "MAA GAYATRI VIDYA MANDIR",
    address: "Sahorbaghat, Kusheshwar asthan,Darbhanga, Bihar - 848213",
    phone: "+91 9931434644",
    email: "mgvmeducation@gmail.com",
    logoUrl:
      "https://ik.imagekit.io/bhupeshb7/H2djMRhTp8NWVG-K8HmAe__1_-removebg-preview-removebg-preview%20(2).png?updatedAt=1774636861114",
    signUrl: "https://ik.imagekit.io/bhupeshb7/mgvm-sign-removebg-preview.png",
  },
  student: {
    name: "Rahul Kumar Sharma",
    fatherName: "Rajesh Kumar Sharma",
    motherName: "Sunita Sharma",
    class: "Class X - Section A",
    rollNo: "2025-X-042",
    session: "2025-2026",
  },
  marks: [
    { subject: "Hindi", obtained: 78, max: 100 },
    { subject: "English", obtained: 82, max: 100 },
    { subject: "Mathematics", obtained: 91, max: 100 },
    { subject: "Science", obtained: 87, max: 100 },
    { subject: "Social Science", obtained: 74, max: 100 },
    { subject: "Sanskrit", obtained: 69, max: 100 },
  ],
};

async function generateMarksheet(req, res) {
  try {
    const payload =
      req.body && Object.keys(req.body).length > 0 ? req.body : samplePayload;

    if (!payload.school || !payload.student || !payload.marks) {
      return res.status(400).json({
        error: "Missing required fields: school, student, marks",
      });
    }

    if (!Array.isArray(payload.marks) || payload.marks.length === 0) {
      return res.status(400).json({ error: "marks must be a non-empty array" });
    }

    const pdfBuffer = await generateMarksheetPdf(payload);

    const studentName = (payload.student.name || "student")
      .replace(/\s+/g, "_")
      .toLowerCase();
    const filename = `marksheet_${studentName}_${Date.now()}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Length", pdfBuffer.length);

    return res.end(pdfBuffer);
  } catch (err) {
    console.error("Marksheet generation error:", err);
    return res
      .status(500)
      .json({ error: "Failed to generate marksheet", details: err.message });
  }
}

async function generateSampleMarksheet(req, res) {
  try {
    const pdfBuffer = await generateMarksheetPdf(samplePayload);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="sample_marksheet.pdf"',
    );
    res.setHeader("Content-Length", pdfBuffer.length);

    return res.end(pdfBuffer);
  } catch (err) {
    console.error("Sample marksheet error:", err);
    return res
      .status(500)
      .json({ error: "Failed to generate sample", details: err.message });
  }
}

module.exports = { generateMarksheet, generateSampleMarksheet, samplePayload };
