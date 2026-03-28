"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePasswordSchema = exports.resetPasswordSchema = exports.verifyOtpSchema = exports.forgotPasswordSchema = exports.registerSchema = exports.loginSchema = exports.createPasswordConfirmFields = exports.otpField = exports.oldPasswordField = exports.passwordField = exports.strongPasswordField = exports.fullNameField = exports.emailField = void 0;
const joi_1 = __importDefault(require("joi"));
/* ========= REUSABLE FIELDS ========= */
exports.emailField = joi_1.default.string()
    .email({ tlds: false })
    .required()
    .messages({
    "string.empty": "Vui lòng nhập email!",
    "string.email": "Email không hợp lệ!",
    "any.required": "Email là bắt buộc!",
});
exports.fullNameField = joi_1.default.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
    "string.empty": "Vui lòng nhập họ tên!",
    "string.min": "Họ tên phải có ít nhất 2 ký tự!",
    "string.max": "Họ tên không được vượt quá 100 ký tự!",
    "any.required": "Họ tên là bắt buộc!",
});
// Password mạnh - dùng cho register, reset, change password
exports.strongPasswordField = joi_1.default.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
    "string.empty": "Vui lòng nhập mật khẩu!",
    "string.min": "Mật khẩu phải có ít nhất 8 ký tự!",
    "string.pattern.base": "Mật khẩu phải chứa chữ hoa, chữ thường và số!",
    "any.required": "Mật khẩu là bắt buộc!",
});
// Password đơn giản - dùng cho login (vì user đã tạo account rồi)
exports.passwordField = joi_1.default.string()
    .min(6)
    .required()
    .messages({
    "string.empty": "Vui lòng nhập mật khẩu!",
    "string.min": "Mật khẩu phải có ít nhất 6 ký tự!",
    "any.required": "Mật khẩu là bắt buộc!",
});
exports.oldPasswordField = joi_1.default.string()
    .min(6)
    .required()
    .messages({
    "string.empty": "Vui lòng nhập mật khẩu cũ!",
    "any.required": "Mật khẩu cũ là bắt buộc!",
});
exports.otpField = joi_1.default.string()
    .pattern(/^[0-9]{6}$/)
    .required()
    .messages({
    "string.empty": "Vui lòng nhập mã xác nhận!",
    "string.pattern.base": "Mã xác nhận phải gồm 6 chữ số!",
    "any.required": "Mã xác nhận là bắt buộc!",
});
/* ========= HELPER FUNCTION ========= */
const createPasswordConfirmFields = (passwordFieldName = "password", confirmFieldName = "rePassword", passwordValidator = exports.strongPasswordField) => ({
    [passwordFieldName]: passwordValidator,
    [confirmFieldName]: joi_1.default.string()
        .empty('')
        .valid(joi_1.default.ref(passwordFieldName))
        .required()
        .messages({
        "string.empty": "Vui lòng nhập lại mật khẩu!",
        "any.only": "Mật khẩu nhập lại không khớp!",
        "any.required": "Xác nhận mật khẩu là bắt buộc!",
    }),
});
exports.createPasswordConfirmFields = createPasswordConfirmFields;
/* ========= SCHEMAS ========= */
exports.loginSchema = joi_1.default.object({
    email: exports.emailField,
    password: exports.passwordField, // Login dùng passwordField đơn giản
});
exports.registerSchema = joi_1.default.object({
    email: exports.emailField,
    fullName: exports.fullNameField,
    ...(0, exports.createPasswordConfirmFields)("password", "rePassword", exports.strongPasswordField),
});
exports.forgotPasswordSchema = joi_1.default.object({
    email: exports.emailField,
});
exports.verifyOtpSchema = joi_1.default.object({
    code: exports.otpField,
});
exports.resetPasswordSchema = joi_1.default.object({
    ...(0, exports.createPasswordConfirmFields)("newPassword", "reNewPassword", exports.strongPasswordField),
});
exports.changePasswordSchema = joi_1.default.object({
    oldPassword: exports.oldPasswordField,
    ...(0, exports.createPasswordConfirmFields)("newPassword", "reNewPassword", exports.strongPasswordField),
});
