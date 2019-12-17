const Joi = require("joi");
const mongoose = require("mongoose");
Joi.objectId = require('joi-objectid')(Joi);

const bankAccountSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true
    },
    name: {
        type: String,
        required: false
    },
    bank: {
        type: String,
        required: false
    },
    accountType: {
        type: String,
        enum: ['Current', 'Savings' ,'Nodal'],
        required: false
    },
    accountNo: {
        type: String
        , required: true
    },
    micr: {
        type: String
        , required: false
    },
    ifsc: {
        type: String
        , required: true
    },
    accountPreference: {
        type: String,
        enum: ['Primary', 'Secondary', 'Tertiary','Others'],
        required: false
    },
    approved: {
        type: Boolean,
        default: false
    },
    remarks: {
        type: String,
        required: false
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true
    },
    createdAt: {
        type: Date,
        required: false
    },
    updatedAt: {
        type: Date,
        required: false
    }
});

const BankAccount = mongoose.model('BankAccount', bankAccountSchema);

function validateBankAccount(bankaccount) {
    const schema = {
        user: Joi.objectId().required(),
        name: Joi.string().optional(),
        bank: Joi.string().optional(),
        accountType: Joi.string().optional(),
        accountNo: Joi.string().optional(),
        micr: Joi.string().optional(),
        ifsc: Joi.string().required(),
        accountPreference: Joi.string().optional(),
        approved: Joi.boolean(),
        remarks: Joi.string(),
        createdAt: Joi.string(),
        createdBy: Joi.objectId(),
        updatedAt: Joi.string()
    };

    return Joi.validate(bankaccount, schema);
}

exports.bankAccountSchema = bankAccountSchema;
exports.BankAccount = BankAccount;
exports.validate = validateBankAccount;
