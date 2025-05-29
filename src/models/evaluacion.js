const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Evaluacion = sequelize.define('Evaluacion', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
            is: /^[a-zA-Z\s]+$/i // Validación contra números
        }
    },
    episodio: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    fecha: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    categoria: {
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue: null
    },
    psico: {
        type: DataTypes.TINYINT,
        allowNull: false
    },
    bio: {
        type: DataTypes.TINYINT,
        allowNull: false
    },
    social: {
        type: DataTypes.TINYINT,
        allowNull: false
    }
}, {
    tableName: 'evaluaciones',
    timestamps: false
});
module.exports = Evaluacion;