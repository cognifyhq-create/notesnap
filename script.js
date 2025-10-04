const dropZone = document.getElementById("dropZone");
const imageInput = document.getElementById("imageInput");
const preview = document.getElementById("preview");
const dropText = document.getElementById("dropText");
const extractBtn = document.getElementById("extractBtn");
const downloadPDF = document.getElementById("downloadPDF");
const outputText = document.getElementById("outputText");
const status = document.getElementById("status");

let selectedImage = null;

// ✅ Helper: Display selected image
function showPreview(file) {
  if (!file || !file.type.startsWith("image/")) {
    alert("Please select an image file.");
    return;
  }

  preview.src = URL.createObjectURL(file);
  preview.style.display = "block";
  dropText.textContent = "✅ Image loaded successfully!";
  selectedImage = file;
  extractBtn.disabled = false;
  downloadPDF.disabled = true;
}

// 🖱️ Click to upload
dropZone.addEventListener("click", () => imageInput.click());

// 📂 File input
imageInput.addEventListener("change", (e) => showPreview(e.target.files[0]));

// 🧲 Drag and drop events
dropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropZone.classList.add("dragover");
  dropText.textContent = "Drop the image here...";
});

dropZone.addEventListener("dragleave", () => {
  dropZone.classList.remove("dragover");
  dropText.textContent = "📸 Drag & Drop your note image here or click to upload";
});

dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropZone.classList.remove("dragover");
  showPreview(e.dataTransfer.files[0]);
});

// 🧠 Extract Text using Tesseract.js
extractBtn.addEventListener("click", () => {
  if (!selectedImage) return alert("Please upload or drag an image first!");
  
  status.textContent = "🔍 Processing... please wait ⏳";
  extractBtn.disabled = true;

  Tesseract.recognize(selectedImage, "eng", {
    logger: info => console.log(info)
  })
  .then(({ data: { text } }) => {
    outputText.value = text.trim() || "[No text detected]";
    status.textContent = "✅ Text extracted successfully!";
    downloadPDF.disabled = false;
    extractBtn.disabled = false;
  })
  .catch(err => {
    console.error(err);
    status.textContent = "❌ Error: Could not extract text.";
    extractBtn.disabled = false;
  });
});

// 📄 Download as PDF
downloadPDF.addEventListener("click", () => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const text = outputText.value || "No text to export!";
  const lines = doc.splitTextToSize(text, 180);
  doc.text(lines, 15, 20);
  doc.save("notes.pdf");
});
