import Joi from "joi";

/* ========= REUSABLE FIELDS ========= */

export const emailField = Joi.string()
  .email({ tlds: false })
  .required()
  .messages({
    "string.empty": "Vui lòng nhập email!",
    "string.email": "Email không hợp lệ!",
    "any.required": "Email là bắt buộc!",
  });

export const fullNameField = Joi.string()
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
export const strongPasswordField = Joi.string()
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
export const passwordField = Joi.string()
  .min(6)
  .required()
  .messages({
    "string.empty": "Vui lòng nhập mật khẩu!",
    "string.min": "Mật khẩu phải có ít nhất 6 ký tự!",
    "any.required": "Mật khẩu là bắt buộc!",
  });

export const oldPasswordField = Joi.string()
  .min(6)
  .required()
  .messages({
    "string.empty": "Vui lòng nhập mật khẩu cũ!",
    "any.required": "Mật khẩu cũ là bắt buộc!",
  });

export const otpField = Joi.string()
  .pattern(/^[0-9]{6}$/)
  .required()
  .messages({
    "string.empty": "Vui lòng nhập mã xác nhận!",
    "string.pattern.base": "Mã xác nhận phải gồm 6 chữ số!",
    "any.required": "Mã xác nhận là bắt buộc!",
  });

/* ========= HELPER FUNCTION ========= */

export const createPasswordConfirmFields = (
  passwordFieldName: string = "password",
  confirmFieldName: string = "rePassword",
  passwordValidator: Joi.StringSchema = strongPasswordField
) => ({
  [passwordFieldName]: passwordValidator,
  [confirmFieldName]: Joi.string()
    .empty('')
    .valid(Joi.ref(passwordFieldName))
    .required()
    .messages({
      "string.empty": "Vui lòng nhập lại mật khẩu!",
      "any.only": "Mật khẩu nhập lại không khớp!",
      "any.required": "Xác nhận mật khẩu là bắt buộc!",
    }),
});

/* ========= SCHEMAS ========= */

export const loginSchema = Joi.object({
  email: emailField,
  password: passwordField, // Login dùng passwordField đơn giản
});

export const registerSchema = Joi.object({
  email: emailField,
  fullName: fullNameField,
  ...createPasswordConfirmFields("password", "rePassword", strongPasswordField),
});

export const forgotPasswordSchema = Joi.object({
  email: emailField,
});

export const verifyOtpSchema = Joi.object({
  code: otpField,
});

export const resetPasswordSchema = Joi.object({
  ...createPasswordConfirmFields("newPassword", "reNewPassword", strongPasswordField),
});

export const changePasswordSchema = Joi.object({
  oldPassword: oldPasswordField,
  ...createPasswordConfirmFields("newPassword", "reNewPassword", strongPasswordField),
});