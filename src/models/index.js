const Sequelize = require('sequelize');
const sequelize = require('../../config/database');

const Evaluacion = require('./evaluacion');

module.exports = {
    sequelize,
    Sequelize,
    Evaluacion
};