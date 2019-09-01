const Joi = require("joi");
const mongoose = require("mongoose");
const itemModel = require("./item");
const unitModel = require("./unit");
const userModel = require("./user");
const addressModel = require("./address");
const gblistModel = require("./gblist");
const auctionModel = require("./auction");
const bargainModel = require("./bargain");

const userGeneratedBillSchema = new mongoose.Schema({
    filename: {
      type: String,
      required: false
    },
    addedBy: {
      type: userModel.userSchema,
      required: false
    },
    addedOn: {
      type: Date,
      required: false
    }
  });

const orderSchema = new mongoose.Schema({
    orderno: {
        type: String,
        required: false,
        unique : true
    },
    item: {
        type: itemModel.itemSchema,
        required: false
    },
    quantity: {
        type: Number,
        required: false
    },
    unit: {
        type: String,
        required: false
    },
    cost: {
        type: Number,
        required: false
    },
    discount: {
        type: Number,
        required: false,
        default: 0
    },
    price: {
        type: Number,
        required: false
    },
    address: {                                      // Use for combined address
        type: Object,
        required: false
    },
    buyer: {
        type: userModel.userSchema,
        required: false
    },
    seller: {
        type: userModel.userSchema,
        required: false
    },
    isshippingbillingdiff: {
        type: Boolean,
        required: false
    },
    // shippingdtl: {
    //     type: shipto,
    //     required: false
    // },
    shippingaddress:{
        type: addressModel.addressSchema,
        required: false
    },
    placedTime: {
        type: Date,
        required: false
    },
    confirmedTime: {
        type: Date,
        required: false
    },
    readyTime: {
        type: Date,
        required: false
    },
    shipmentTime: {
        type: Date,
        required: false
    },
    receivedTime: {
        type: Date,
        required: false
    },
    lastUpdated: {
        type: Date,
        required: false
    },
    paymentMode: {
        type: String,
        required: false
    },
    status: {
        type: String,
        enum: ['new', 'confirmed', 'ready', 'shipped', 'delivered', 'cancelled'],
        required: true
    },
    invoiceno :{
        type: String,
        required: false,
        unique : true
    },
    remarks: {
        type: String,
        required: false
    },
    manualbill: {
        type: userGeneratedBillSchema,
        required: false
    },
    ordertype: {
        type: String,
        enum: ['regular', 'groupbuying', 'auction', 'bargainbuy', 'sampleorder', 'agentorder'],
        required: false
    },
    reversechargemech:{
        type: Boolean,
        required: false,
        default: false
    },
    transportcost: {
        type: Number,               
        required: false,
        default : 0
    },
    insurancecharges: {
        type: Number,
        required: false,
        default : 0
    },
    referenceGB: {
        type: gblistModel.groupbuyingSchema,
        required: false
    },
    referenceAuction: {
        type: auctionModel.auctionSchema,
        required: false
    },
    referenceBargain: {
        type: bargainModel.bargainSchema,
        required: false
    }
});

const Order = mongoose.model("Order", orderSchema);

function validateOrder(order) {
    const schema = {
        orderno: Joi.string().optional(),
        itemId: Joi.objectId().required(),
        quantity: Joi.number().optional(),
        unit: Joi.string().required(),
        cost: Joi.number().optional(),
        discount: Joi.number().optional(),
        price: Joi.number().optional(),
        address: Joi.object().optional(),               // To hold partial address
        buyerId: Joi.objectId().optional(),
        sellerId: Joi.objectId().optional(),
        isshippingbillingdiff: Joi.boolean().optional(),
        shippingaddress: Joi.objectId().optional(),
        placedTime: Joi.string().required(),
        confirmedTime: Joi.string().optional(),
        readyTime: Joi.string().optional(),
        shipmentTime: Joi.string().optional(),
        receivedTime: Joi.string().optional(),
        lastUpdated: Joi.string().optional(),
        paymentMode: Joi.string().optional(),
        status: Joi.string().required(),
        invoiceno: Joi.string().optional(),
        remarks: Joi.string().optional(),
        manualbill: Joi.object().optional(),
        ordertype: Joi.string().optional(),
        reversechargemech: Joi.boolean().optional(),
        transportcost: Joi.number().optional(),
        insurancecharges: Joi.number().optional,
        referenceGBId: Joi.objectId().optional(),
        referenceAuctionId: Joi.objectId().optional(),
        referenceBargain: Joi.objectId().optional()
    };

    return Joi.validate(order, schema);
}

exports.orderSchema = orderSchema;
exports.Order = Order;
exports.validate = validateOrder;
