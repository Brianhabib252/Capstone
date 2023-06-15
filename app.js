const express = require('express')
const app = express()
require('dotenv').config()
app.use(express.json())
app.use(express.urlencoded ({extended: true}))
const multer = require('multer');
const { Storage } = require('@google-cloud/storage');
const fs = require('fs');
const moment = require('moment');
const path = require('path');
const { verifyAccessToken } = require('./helper/jwt_helper')
const createConnection = require('./helper/init_mysql')
const AuthRoute = require('./routes/Auth.route');
const ProfilRoute = require('./routes/profil.route')
const RecomRoute = require('./routes/Recom.route')

const connection = createConnection();
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err.message);
    return;
  }
  console.log('Connected to MySQL');
});

app.get('/', verifyAccessToken, async (req, res, next) => {
    res.send('Hello from express.')
  })

// API endpoint to retrieve nutrition values by IDs
app.get('/nutrition', (req, res) => {
    const ids = req.query.ids; // Assuming the input IDs are provided as a comma-separated list in the query parameter "ids"
    const idArray = ids.split(','); // Split the IDs into an array
    
    const query = `SELECT ID, Nama, Energi, Protein, Lemak, Karbohidrat, Serat FROM Nutrition_Data WHERE Nama IN (${idArray.map(() => '?').join(',')})`;
    
    connection.query(query, idArray, (err, result) => {
      if (err) throw err;
  
      if (result.length === 0) {
        res.status(404).json({ error: 'Data Nutrisi Dari Makanan Tidak Tersedia' });
      } else {
        const nutritionData = result.map(row => ({
          ID: row.ID,
          Nama: row.Nama,
          Energi: row.Energi,
          Protein: row.Protein,
          Lemak: row.Lemak,
          Karbohidrat: row.Karbohidrat,
          Serat: row.Serat
        }));
        res.json(nutritionData);
      }
    });
});
  
  const upload = multer();

// Create a new instance of the GCS client
const gcs = new Storage();

// Specify the name of your GCS bucket
const bucketName = 'nufochild-photo';
const bucket = gcs.bucket(bucketName);

function getPublicUrl(filename) {
  return `https://storage.googleapis.com/${bucketName}/${filename}`;
}

const ImgUpload = {};

ImgUpload.uploadToGcs = (req, res, next) => {
  if (!req.file) return next();

  const gcsname = moment().format('YYYYMMDD-HHmmss'); + path.extname(req.file.originalname);
  const file = bucket.file(gcsname);

  const stream = file.createWriteStream({
    metadata: {
      contentType: req.file.mimetype
    }
  });

  stream.on('error', (err) => {
    req.file.cloudStorageError = err;
    next(err);
  });

  stream.on('finish', () => {
    req.file.cloudStorageObject = gcsname;
    req.file.cloudStoragePublicUrl = getPublicUrl(gcsname);
    next();
  });

  stream.end(req.file.buffer);
};

// post image and upload to ml model
app.post('/upload', upload.single('image'), ImgUpload.uploadToGcs, (req, res) => {
    if (!req.file) {
      res.status(400).json({ error: 'No image file provided' });
    } else {
      const imageUrl = req.file.cloudStoragePublicUrl;
      const predictImageEndpoint = 'https://fastapi-model-ml-rezeodju2q-et.a.run.app/predict_image';
      const predictImageUrl = `${predictImageEndpoint}?url=${encodeURIComponent(imageUrl)}`;
  
      // Make a POST request to predict_image endpoint
      fetch(predictImageUrl, {
        method: 'POST'
      })
        .then(response => {
          if (response.ok) {
            return response.json();
          } else {
            throw new Error('Failed to retrieve image from URL');
          }
        })
        .then(predictionResult => {
          const ids = predictionResult.result; // Assuming the prediction result is the input for the nutrition data retrieval
          const idArray = ids.split(','); // Split the IDs into an array
  
          const query = `SELECT ID, Nama, Energi, Protein, Lemak, Karbohidrat, Serat FROM Nutrition_Data WHERE Nama IN (${idArray.map(() => '?').join(',')})`;
  
          connection.query(query, idArray, (err, result) => {
            if (err) throw err;
  
            if (result.length === 0) {
              res.status(404).json({ error: 'Data Nutrisi Dari Makanan Tidak Tersedia' });
            } else {
              const nutritionData = result.map(row => ({
                ID: row.ID,
                Nama: row.Nama,
                Energi: row.Energi,
                Protein: row.Protein,
                Lemak: row.Lemak,
                Karbohidrat: row.Karbohidrat,
                Serat: row.Serat
              }));
              res.json({ imageUrl: imageUrl, prediction: predictionResult.result, nutritionData: nutritionData });
            }
          });
        })
        .catch(error => {
          res.status(500).json({ error: 'Internal Server Error' });
        });
    }
});
  
// API endpoint to get video links
app.get('/videos', (req, res) => {
    const query = 'SELECT * FROM videos';
    
    connection.query(query, (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: 'Gagal mendapatkan data video' });
      } else {
        res.json(result);
      }
    });
});

// API endpoint to get meals based on function
app.use('/meals', RecomRoute);
app.use('/auth', AuthRoute);
app.use('/profil', ProfilRoute);

app.use((req, res, next) =>{
    const err = new Error("Not found")
    err.status = 404
    next(err)
})

//Error handler
app.use((err, req, res, next) =>{
    res.status(err.status || 500)
    res.send({
        error: {
            status: err.status || 500,
            message: err.message
    }

    })
})

const port = process.env.PORT || 8080;
// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
