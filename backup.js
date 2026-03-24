async function backupVirus(result) {
    return new Promise((resolve, reject) => {
        const PDFDocument = require('pdfkit');
        const fs = require('fs');
        const path = require('path');

        // Läs in databasinformationen om viruset
        const str_virusID = result[0]['ID'];
        const str_objectNumber = result[0]['objectNumber'];
        const str_objectName = result[0]['objectName'];
        const str_objectCreator = result[0]['objectCreator'];
        const str_objectCreatedDate = result[0]['objectCreatedDate'];
        const str_objectText = result[0]['objectText'];
        const str_objectStatus = result[0]['objectStatus'];
        var str_presentationVideoLink = "";
        var str_securityVideoLink = "";
        if (result[0]['presentationVideoLink']) {
            str_presentationVideoLink = result[0]['presentationVideoLink'];
        }
        if (result[0]['securityVideoLink']) {
            str_securityVideoLink = result[0]['securityVideoLink'];
        }

        // Fixar variabler för datum och tid för att namnge backupen
        const today = new Date();
        const day = String(today.getDate()).padStart(2, '0');
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const year = today.getFullYear();
        const date = `${day}.${month}.${year}`;

        const time = new Date().toLocaleTimeString('sv-SE', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        }).replace(":", "."); // replace : with . for usable file naming

        try {
            // Skapar pdf dokumentet för att sedan skriva i det senare
            const doc = new PDFDocument();

            // Create folder if needed
            const folderPath = `C:/secretbackup/${str_virusID}/backup_${date}_${time}`;
            if (!fs.existsSync(folderPath)) {
                fs.mkdirSync(folderPath, { recursive: true });
            }

            // Copy the safety sheet if it exists
            const oldPath = path.resolve(__dirname, `data/safetydatasheets/${str_objectNumber}.pdf`);
            const newPath = `C:/secretbackup/${str_virusID}/backup_${date}_${time}/SafetyDataSheet_${date}_${time}.pdf`;
            if (fs.existsSync(oldPath)) fs.copyFileSync(oldPath, newPath);

            // Kopierar över alla filer från virusets mapp (attachments)
            const source = path.join(__dirname, `data/${str_virusID}`);
            const destination = path.join(`C:/secretbackup/${str_virusID}/backup_${date}_${time}`);
            if (fs.existsSync(source)) {
                try {
                    fs.cpSync(source, destination, { recursive: true });
                } catch(err) {
                    console.error('Copy failed', err);
                }
            }

            // Kopierar virusfoton (images)
            const photoSource = path.join(__dirname, `public/virusphoto/${str_virusID}`);
            const photoDestination = path.join(`C:/secretbackup/${str_virusID}/backup_${date}_${time}/images`);
            if (fs.existsSync(photoSource)) {
                try {
                    fs.cpSync(photoSource, photoDestination, { recursive: true });
                } catch(err) {
                    console.error('Photo copy failed', err);
                }
            }

            // Skapar vägen där den ska skriva pdf filen och börjar skrivningen
            const objectNameNoSpaces = str_objectName.replace(/\s/g, '_');
            const filepath = path.join(
                `C:/secretbackup/${str_virusID}/backup_${date}_${time}`,
                `${objectNameNoSpaces}_${date}_${time}.pdf`
            );
            const stream = fs.createWriteStream(filepath);
            doc.pipe(stream);

            // Skriver ut all data från resultat i pdf filen
            doc.fontSize(20).text(`Virus Backup: ${str_objectName}`, { underline: true });
            doc.moveDown();
            doc.fontSize(12).text(`ID: ${str_virusID}`);
            doc.text(`Object Number: ${str_objectNumber}`);
            doc.text(`Name: ${str_objectName}`);
            doc.text(`Creator: ${str_objectCreator}`);
            doc.text(`Created Date: ${str_objectCreatedDate}`);
            doc.text(`Status: ${str_objectStatus}`);
            doc.moveDown();
            doc.fontSize(14).text('Description:', { underline: true });
            doc.fontSize(12).text(str_objectText || '', { width: 400 });
            doc.moveDown();

            if (str_presentationVideoLink) doc.text(`Presentation Video: ${str_presentationVideoLink}`);
            if (str_securityVideoLink) doc.text(`Security Video: ${str_securityVideoLink}`);
            doc.moveDown();
            doc.text(`Backup created on ${date} at ${time}`);

            doc.end();

            // returnerar true ifall det funkade
            stream.on('finish', () => resolve(true));
            stream.on('error', () => resolve(false));
        } catch(err) {
            console.error(err);
            resolve(false);
        }
    });
}

module.exports = backupVirus;
