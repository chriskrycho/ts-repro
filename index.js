"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var field_1 = __importDefault(require("@olo/principled-forms/field"));
var formFromUser = function (user) { return ({
    age: field_1.default.required({ value: user.age }),
    name: field_1.default.optional({ value: user.name }),
    email: field_1.default.optional({ value: user.email })
}); };
var a = formFromUser({
    age: 31,
    name: "Chris"
});
