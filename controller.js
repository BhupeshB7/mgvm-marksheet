const { generateMarksheetPdf } = require("./template");

const samplePayload = {
  examType: "Annual",
  session: "2025-26",
  school: {
    name: "MAA GAYATRI VIDYA MANDIR",
    address: "Sahorbaghat, Kusheshwar asthan, Darbhanga, Bihar - 848213",
    phone: "+91 9931434644",
    email: "mgvmeducation@gmail.com",
    logoUrl:
      "https://ik.imagekit.io/bhupeshb7/H2djMRhTp8NWVG-K8HmAe__1_-removebg-preview-removebg-preview%20(2).png?updatedAt=1774636861114",
    signUrl: "https://ik.imagekit.io/bhupeshb7/mgvm-sign-removebg-preview.png",
  },
  students: [
    {
      name: "Test Student One",
      fatherName: "Father One",
      motherName: "Mother One",
      class: "UKG - Section A",
      rollNo: "001",
      marks: [
        { subject: "Hindi", obtained: 66, max: 100 },
        { subject: "English", obtained: 77, max: 100 },
        { subject: "Mathematics", obtained: 88, max: 100 },
        { subject: "Science", obtained: 89, max: 100 },
      ],
    },
    {
      name: "Test Student Two",
      fatherName: "Father Two",
      motherName: "Mother Two",
      class: "UKG - Section A",
      rollNo: "002",
      marks: [
        { subject: "Hindi", obtained: 88, max: 100 },
        { subject: "English", obtained: 87, max: 100 },
        { subject: "Mathematics", obtained: 80, max: 100 },
        { subject: "Science", obtained: 79, max: 100 },
      ],
    },
  ],
};

async function generateMarksheet(req, res) {
  try {
    const payload =
      req.body && Object.keys(req.body).length > 0 ? req.body : samplePayload;

    if (!payload.school) {
      return res.status(400).json({ error: "Missing required field: school" });
    }

    if (!Array.isArray(payload.students) || payload.students.length < 2) {
      return res
        .status(400)
        .json({ error: "Two students are required in the students array" });
    }

    for (let i = 0; i < 2; i++) {
      const student = payload.students[i];
      if (!student) {
        return res
          .status(400)
          .json({ error: `Student ${i + 1} data is missing` });
      }
      if (!Array.isArray(student.marks) || student.marks.length === 0) {
        return res.status(400).json({
          error: `Student ${i + 1}: marks must be a non-empty array`,
        });
      }
    }

    const pdfBuffer = await generateMarksheetPdf(payload);

    const s1Name = (payload.students[0].name || "student1")
      .replace(/\s+/g, "_")
      .toLowerCase();
    const s2Name = (payload.students[1].name || "student2")
      .replace(/\s+/g, "_")
      .toLowerCase();
    const filename = `marksheet_${s1Name}_${s2Name}_${Date.now()}.pdf`;

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
      'attachment; filename="sample_marksheet.pdf"'
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
