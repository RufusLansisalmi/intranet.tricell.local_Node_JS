const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const readHTML = require('../readHTML.js');
const checkAuth = require('../authMiddleweare.js');

// Multer storage — saves to data/<virusId>/attachments/
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const safeVirusId = String(req.params.id).replace(/[^a-zA-Z0-9_-]/g, '');
        const uploadPath = path.join(__dirname, '..', 'data', safeVirusId, 'attachments');
        fs.mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        const baseName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '');
        cb(null, `${Date.now()}-${baseName}${ext}`);
    }
});
const upload = multer({ storage: storage });

// -------------------- Helper: build attachments HTML (used by editvirus) --------------------
function getAttachmentsHTML(virusId) {
    const safeId  = String(virusId).replace(/[^a-zA-Z0-9_-]/g, '');
    const dirPath = path.join(__dirname, '..', 'data', safeId, 'attachments');

    let html = '<div style="margin-top:20px;">';
    html += '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">';
    html += '<h3 style="margin:0;">Attachments:</h3>';
    html += `<a href="/api/fileuploadvirus/${safeId}" style="color:#336699;font-size:13px;text-decoration:none;">&#128196; Upload new file</a>`;
    html += '</div>';

    if (fs.existsSync(dirPath)) {
        const files = fs.readdirSync(dirPath);
        if (files.length === 0) {
            html += '<div class="source_row">No files</div>';
        } else {
            files.forEach(file => {
                const fullPath = path.join(dirPath, file);
                const stats    = fs.statSync(fullPath);
                html += `
                <div class="source_row" style="display:flex;align-items:center;gap:12px;padding:4px 0;border-bottom:1px solid #eee;">
                    <span class="source_value" style="flex:1;">
                        <a href="/api/fileuploadvirus/${safeId}/download/${encodeURIComponent(file)}" style="color:#336699;">${file}</a>
                    </span>
                    <span class="source_size" style="color:#666;font-size:12px;">${(stats.size / 1024).toFixed(1)} KB</span>
                    <form method="POST" action="/api/fileuploadvirus/${safeId}/delete-file" style="display:inline;margin:0;">
                        <input type="hidden" name="fileName" value="${file}">
                        <button type="submit" style="background:none;border:none;cursor:pointer;color:#cc0000;font-size:16px;" title="Delete">&#128465;</button>
                    </form>
                </div>`;
            });
        }
    } else {
        html += '<div class="source_row">No files</div>';
    }

    html += '</div>';
    return html;
}

// -------------------- GET: upload form page --------------------
router.get('/:id', checkAuth, (req, res) => {
    const safeId = String(req.params.id).replace(/[^a-zA-Z0-9_-]/g, '');

    const htmlhead     = readHTML('./html/head.html');
    const htmlheader   = readHTML('./html/header.html');
    const htmlmenu     = readHTML('./html/menu.html');
    const htmlinfostart = readHTML('./html/infostart.html');
    const htmlinfostop = readHTML('./html/infostop.html');
    const htmlbottom   = readHTML('./html/bottom.html');

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.write(htmlhead);
    res.write(htmlheader);
    res.write(htmlmenu);
    res.write(htmlinfostart);

    let html = `
        <h2>Upload File — Virus ID: ${safeId}</h2>
        <form name="addData" action="/api/fileuploadvirus/${safeId}" method="POST" enctype="multipart/form-data" style="margin-bottom:20px;">
            <input type="file" name="fileadd" id="fileadd" />
            <input type="submit" value="Upload file" style="background:#003366;color:#fff;border:none;padding:5px 14px;cursor:pointer;margin-left:8px;" />
        </form>
        <a href="/api/editvirus/${safeId}" style="color:#336699;">&#8592; Back to Edit Virus</a>
        <hr style="margin:20px 0;">
    `;
    html += getAttachmentsHTML(safeId);

    res.write(html);
    res.write(htmlinfostop);
    res.write(htmlbottom);
    res.end();
});

// -------------------- POST: upload file --------------------
router.post('/:id', upload.single('fileadd'), (req, res) => {
    const safeId = String(req.params.id).replace(/[^a-zA-Z0-9_-]/g, '');
    res.redirect(`/api/fileuploadvirus/${safeId}`);
});

// -------------------- GET: download a file --------------------
router.get('/:id/download/:filename', checkAuth, (req, res) => {
    const safeId   = String(req.params.id).replace(/[^a-zA-Z0-9_-]/g, '');
    const filename = path.basename(req.params.filename); // prevent path traversal
    const filePath = path.join(__dirname, '..', 'data', safeId, 'attachments', filename);

    if (fs.existsSync(filePath)) {
        res.download(filePath);
    } else {
        res.status(404).send('File not found.');
    }
});

// -------------------- POST: delete a file --------------------
router.post('/:id/delete-file', checkAuth, (req, res) => {
    const safeId   = String(req.params.id).replace(/[^a-zA-Z0-9_-]/g, '');
    const filename = path.basename(req.body.fileName || '');
    const filePath = path.join(__dirname, '..', 'data', safeId, 'attachments', filename);

    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }

    res.redirect(`/api/fileuploadvirus/${safeId}`);
});

module.exports = router;
module.exports.getAttachmentsHTML = getAttachmentsHTML;
