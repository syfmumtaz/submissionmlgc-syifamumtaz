const predictClassification = require('../services/inferenceService');
const crypto = require('crypto');
const storeData = require('../services/storeData');
const { Firestore } = require('@google-cloud/firestore');

async function postPredictHandler(request, h) {
    const { image } = request.payload;
    const { model } = request.server.app;

    const { label, suggestion } = await predictClassification(model, image);
    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();

    const data = {
        "id": id,
        "result": label,
        "suggestion": suggestion,
        "createdAt": createdAt
    }

    await storeData(id, data);

    const response = h.response({
        status: 'success',
        message: 'Model is predicted successfully',
        data
    })
    response.code(201);
    return response;
};

async function getPredictionHistory(request, h) {
    
    const db = new Firestore();
    const historiesget = await db.collection('prediction').get();
    let HistoryArr= [];
    historiesget.forEach(doc => {
      HistoryArr.push(doc.data());
    });

    const response = h.response({
        status: 'success',
        data: HistoryArr
    });
    response.code(200);
    return response;
};

module.exports = {postPredictHandler, getPredictionHistory};