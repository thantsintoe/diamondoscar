var express = require('express');
var fileUpload = require('express-fileupload');
var router = express.Router();
 
// default options 
router.use(fileUpload());

router.get('/upload',function(req,res) {
    res.render('upload');
});
 
router.post('/upload', function(req, res) {
    var newFile;
 
    if (!req.files) {
        res.send('No files were uploaded.');
        return;
    }
 
    newFile = req.files.sampleFile;
    console.log(req.files);
    newFile.mv('public/images/filename.jpg', function(err) {
        if (err) {
            res.status(500).send(err);
        }
        else {
            res.send('File uploaded!');
        }
    });
});

module.exports = router;