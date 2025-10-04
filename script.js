const dropZone = document.getElementById("dropZone");
const imageInput = document.getElementById("imageInput");
const preview = document.getElementById("preview");
const dropText = document.getElementById("dropText");
const extractBtn = document.getElementById("extractBtn");
const downloadPDF = document.getElementById("downloadPDF");
const outputText = document.getElementById("outputText");
const status = document.getElementById("status");

// ✅ Your Google Cloud Vision API key
const API_KEY = "AIzaSyC452k0tvnzcIdhpavLReQcF8kfrmzBDqA";

let selectedImage = null;

// Preview image
function showPreview(file) {
  if (!file || !file.type.startsWith("image/")) {
    alert("Please select an image file.");
    return;
  }
  preview.src = URL.createObjectURL(file);
  preview.style.display = "block";
  dropText.textContent = "✅ Image loaded!";
  selectedImage = file;
  extractBtn.disabled = false;
  downloadPDF.disabled = true;
}

// Drag & drop events
dropZone.addEventListener("click", () => imageInput.click());
imageInput.addEventListener("change", e => showPreview(e.target.files[0]));

dropZone.addEventListener("dragover", e => {
  e.preventDefault();
  dropZone.classList.add("dragover");
  dropText.textContent = "Drop the image here...";
});

dropZone.addEventListener("dragleave", () => {
  dropZone.classList.remove("dragover");
  dropText.textContent = "📸 Drag & Drop your note image here or click to upload";
});

dropZone.addEventListener("drop", e => {
  e.preventDefault();
  dropZone.classList.remove("dragover");
  showPreview(e.dataTransfer.files[0]);
});

// Convert file to Base64 for API
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Extract text using Google Cloud Vision
extractBtn.addEventListener("click", async () => {
  if (!selectedImage) return alert("Upload an image first!");
  status.textContent = "🔍 Processing...";
  extractBtn.disabled = true;

  try {
    const base64 = await fileToBase64(selectedImage);
    const requestBody = {
      requests: [{
        image: { content: base64 },
        features: [{ type: "DOCUMENT_TEXT_DETECTION" }]
      }]
    };

    const response = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();
    const text = data.responses[0].fullTextAnnotation?.text || "[No text detected]";
    outputText.value = text;
    status.textContent = "✅ Text extracted successfully!";
    downloadPDF.disabled = false;
  } catch (err) {
    console.error(err);
    status.textContent = "❌ Error extracting text.";
  } finally {
    extractBtn.disabled = false;
  }
});

// Download PDF
downloadPDF.addEventListener("click", () => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const text = outputText.value || "No text to export!";
  const lines = doc.splitTextToSize(text, 180);
  doc.text(lines, 15, 20);
  doc.save("notes.pdf");
});
