import * as express from "express" ;
import {getCaptcha, verifyCaptcha} from "./chillicaptcha" ;





const app = express.default();
const port = 3000;


const formMiddleware = (req: any, res: any, next: any) => {
    if (req.method === 'POST') {
        const formData: {[index: string]: any} = {};
        req.on('data', (data: any) => {
 
            // Decode and parse data
            const parsedData = 
                decodeURIComponent(data).split('&');
 
            for (let data of parsedData) {
 
                const decodedData = decodeURIComponent(
                        data.replace(/\+/g, '%20')) ;
 
                const [key, value] = 
                        decodedData.split('=') ;
 
                // Accumulate submitted 
                // data in an object
                formData[key] = value ;
            }
 
            // Attach form data in request object
            req.body = formData ;
            next() ;
        })
    } else {
        next() ;
    }
} ;



app.post('/', formMiddleware, async (req: any, res: any) => {
    const data = req.body
    const {answer, encrypted} = data ;
    const result : boolean = verifyCaptcha(answer, encrypted) ; 
    res.send(`<p>${result}</p>`) ;
}) ;


app.get('/', async (req: any, res: any) => {


    const {base64ImageDataURI, encrypted} = await getCaptcha() ; 


const html: string = `
<!DOCTYPE html>
<html>
  <head>
  </head>
  <body>
    <form style="border:1px solid black; " action="/" method="post" >
      <img src=${base64ImageDataURI}><br>
      <input type="hidden" id="encrypted" name="encrypted" value=${encrypted} >
      <input type="text" name="answer"><br>
      <input type="submit" value="submit"><br>
    </form>
  </body>
</html>
`;

    res.send(`${html}`);
});

app.listen(port, () => {
    return console.log(`listening on port ${port}`);
});
