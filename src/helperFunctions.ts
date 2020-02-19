import natural from 'natural'
import { Response, Request } from 'express';

const tokenizer = new natural.WordTokenizer();

export const countWords = function (fileString: string) {
  const wordIndex = {};
  const bookData = tokenizer.tokenize(fileString.toLowerCase());
  bookData.forEach((word) => {
    if (!(wordIndex.hasOwnProperty(word))) {
      wordIndex[word] = 0;
    }
    wordIndex[word] += 1;
  });
  return wordIndex;
};

export const countFirstNames = (firstNameTokens: string[], bookData: object) => {
  const firstNameCountObj = {};
  firstNameTokens.map(name => firstNameCountObj[name] = bookData[name] || 0);
  return firstNameCountObj;
};

export const successResponse = (req:Request, res:Response, data:object, code:number = 200) => res.send({
  code,
  data,
  success: true,
});

export const errorResponse = (
  req:object,
  res:Response,
  errorMessage:string = 'Something went wrong',
  code:number = 500,
  error:object = {},
) => res.status(500).json({
  code,
  errorMessage,
  error,
  data: null,
  success: false,
});
