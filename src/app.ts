import express from 'express';
import natural from 'natural'
import fs from 'fs';
import multer from 'multer';
import cors from 'cors';
import { countWords, countFirstNames, successResponse, errorResponse } from './helperFunctions'

const tokenizer = new natural.WordTokenizer();
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads');
  },
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}-${Date.now()}`);
  },
});
const upload = multer({ storage });
const app = express();

const port = 3001;

app.use(cors())
app.post('/counts', upload.single('name'), (req, res) => {
  try {
    if (!req.file) {
      throw new Error('file not found!');
    }
    const book = req.file;
    const names = fs.readFileSync(`uploads/${book.filename}`, 'utf8');
    const firstNameTokens = tokenizer.tokenize(names.toLowerCase());
    const finalCount = {};
    const starttime = new Date();
    const readerStream = fs.createReadStream('book/OliverText', 'utf8');
    readerStream.setEncoding('UTF8');
    readerStream.on('data', (chunk) => {
      const cunkWordCount = countWords(chunk);
      const firstNameCountObj = countFirstNames(firstNameTokens, cunkWordCount);
      Object.keys(firstNameCountObj).map(key => {
        if (finalCount[key]) finalCount[key] = finalCount[key] + firstNameCountObj[key];
        else finalCount[key] = firstNameCountObj[key];
      })
    });

    readerStream.on('end', () => {
      const endtime = new Date();
      console.log("Time", (+endtime - +starttime) / (1000 * 60), ' minutes')
      return successResponse(req, res, finalCount);
    });

    readerStream.on('error', (err) => {
      return errorResponse(req, res, err.message);
    });
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
});

app.listen(port, err => {
  if (err) {
    return console.error(err);
  }
  return console.log(`server is listening on ${port}`);
});
