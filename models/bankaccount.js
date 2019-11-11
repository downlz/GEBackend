const Joi = require("joi");
const mongoose = require("mongoose");
Joi.objectId = require('joi-objectid')(Joi);

const bankAccountSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true
    },
    accountType: {
        type: String,
        enum: ['Current', 'Savings'],
        required: false
    },
    accountNo: {
        type: String
        , required: true
    },
    micr: {
        type: String
        , required: true
    },
    ifsc: {
        type: String
        , required: true
    },
    accountPreference: {
        type: String,
        enum: ['Primary', 'Secondary', 'Tertiary'],
        required: true
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
        accountType: Joi.string().optional(),
        accountNo: Joi.string().optional(),
        micr: Joi.string().required(),
        ifsc: Joi.string().required(),
        accountPreference: Joi.string().required(),
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
