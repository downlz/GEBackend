const Joi = require("joi");
const mongoose = require("mongoose");

const agentbidSchema = new mongoose.Schema({
    // bid: {
    //     type: mongoose.Schema.Types.ObjectId, ref: 'Bid', required: true
    // },
    partyname: {
        type: String,
        required: false
    },
    partyphone: {
        type: String,
        required: false
    },
    createdAt: {
        type: Date,
        required: false
    },
    // createdBy: {
    //     type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true
    // },
    // manufacturer: {
    //     type: mongoose.Schema.Types.Mixed,
    //     required: false
    // },
    // marketingExpense: {
    //     type: Number,
    //     required: false
    // },
    // orderConfirmed: {
    //     type: Boolean,
    //     required: false,
    //     default: false
    // }
});

const AgentBid = mongoose.model("AgentBid", agentbidSchema);

function validateAgentBid(agentbid) {
    const schema = {
        partyname: Joi.string().optional(),
        partyphone: Joi.string().optional(),
        // bid: Joi.objectId(),
    };

    return Joi.validate(agentbid, schema);
}

exports.agentbidSchema = agentbidSchema;
exports.AgentBid = AgentBid;
exports.validate = validateAgentBid;
