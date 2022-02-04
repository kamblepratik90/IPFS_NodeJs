const { create } = require('ipfs-http-client');
const express = require('express');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const fs = require('fs');

// connect using a URL
const ipfs = create();
// const ipfs = new ipfsClient({ host: 'localhost', port: '5001', protocol: 'http' });
const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload());

app.get('/', (req, res) => {
    res.render('home');
});

app.post('/upload', (req, res) => {
    const file = req.files.file;
    const fileName = req.body.fileName;
    const filePath = 'files/' + fileName;

    file.mv(filePath, async (err) => {
        if (err) {
            console.log('Error: failed to download the file');
            return res.status(500).send(err);
        }

        const fileHash = await addFile(fileName, filePath);
        fs.unlink(filePath, (err1) => {
            if (err1) {
                console.log(err1);
            }

            res.render('upload', { fileName, fileHash });
        });
    });
});

const addFile = async (fileName, filePath) => {
    const file = fs.readFileSync(filePath);
    // const fileAdded = await ipfs.add({ path: fileName, content: file });
    // return fileAdded[0].hash;

    // let results = [];
    // for await (const result of ipfs.add({path: fileName, content: file})) {
    //     results.push(result);
    // }
    // return results[0].cid;

    const fileAdded = await ipfs.add({ path: fileName, content: file });
    const fileHash = fileAdded.cid;
    //    ( <- fix here, in the old version, it had hash property, now it is cid ) 
    return fileHash;
}

app.listen(3000, () => {
    console.log('Server is listening on port 3000');
});