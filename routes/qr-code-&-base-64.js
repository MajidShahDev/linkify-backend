// BASE 64
// Base64 doesn’t care what the data is — it just converts any binary data into plain text.
// Binary data can be:
// Images (PNG, JPEG…)
// Files (PDF, DOC, ZIP…)
// Even plain text itself (though encoding text in Base64 is usually unnecessary).
// The key idea: Base64 is a text representation of binary data, so it can safely travel in JSON, HTML, URLs,
// or anywhere text is allowed.

// Binary data (0s and 1s) → Base64 → Safe plain text version

// Browser or program can decode Base64 back into the original binary data whenever needed.

///////////////////////////////////////////////////////////////////////////////////////////////
// BASE64 FLOW DIAGRAM
// Binary → Base64 → Text → Decode → Original Binary

// [Original Binary Data]
//   (image, file, audio, etc.)
//          │
//          ▼
//  ┌─────────────────────┐
//  │ Base64 Encoding     │
//  │                     │
//  │ Converts binary     │
//  │ bytes → text string │
//  └─────────────────────┘
//          │
//          ▼
// [Base64 Text String]
//   "iVBORw0KGgoAAAANSUhEUgAAAB..."
//          │
//          ▼
//  ┌─────────────────────┐
//  │ Base64 Decoding     │
//  │                     │
//  │ Converts text string │
//  │ back → original     │
//  │ binary data         │
//  └─────────────────────┘
//          │
//          ▼
// [Original Binary Data]
//   (ready to display, save, or use)

////////////////////////////////////////////////////////////

// QR Code + Base64 Flow Diagram

// [Your Text / URL]   <-- user input
//        │
//        ▼
// ┌───────────────────────┐
// │ QR Code Generator     │
// │ (qrcode library)      │
// │                       │
// │ Converts text into    │
// │ QR code image (binary)│
// └───────────────────────┘
//        │
//        ▼
// ┌───────────────────────────────┐
// │ Base64 Encoder                │
// │ (toDataURL method)            │
// │                               │
// │ Converts QR image binary      │
// │ into a long text string       │
// │ "data:image/png;base64,..."  │
// └───────────────────────────────┘
//        │
//        ▼
// [Frontend <img src="Base64 String">]   <-- browser decodes & renders image

///////////////////////////////////////////////////////////////////////////////////////////////

// Explanation of Layers
// Your Text/URL     → "https://example.com/abc123"
// QR Code Generator → turns it into black & white squares (QR image).
// Base64 Encoder    → converts QR image binary → text so it can be sent easily in JSON or HTML.
// Browser           → <img> decodes Base64 → shows QR code visually.
// QR Scanner        → reads the QR squares → decodes back to your original text/URL.

// Your Text/URL     → "https://example.com/abc123"
// QR Code Generator → Encode text into Binary Image(Black & White).
// Base64 Encoder    → Converts QR Binary Image → Base 64 text so it can be sent easily in JSON or HTML.
// Browser Decoder   → decodes Base64 text back to image → then browser shows QR code visually.
// QR Scanner        → reads the QR squares → decodes back to your original text/URL.

// 💡 Key Insight
// There are two “encodings” happening:
// QR encoding     → your URL → QR image (black/white squares).
// Base64 encoding → QR image → text for browser delivery.

// QR Image Decoding Flow
// QR Image Input       → The QR code image captured by scanner or camera
// Image Preprocessing  → Scanner detects QR position, orientation & alignment squares
// Module Detection     → Scanner detects black & white squares (modules) in the grid
// Binary Conversion    → Black squares = 1, White squares = 0 → builds binary data
// Error Correction     → QR uses Reed-Solomon codes to fix any damaged/missing parts
// QR Decoding          → Binary data decoded using QR standard (ISO/IEC 18004)
// Original Text Output → Returns the original text/URL encoded in the QR
// Action Execution     → Phone/browser interprets the text (e.g., opens URL)

///////////////////////////////////////////////////////////////////////////////////////////////
