import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { loginRequest, selectAuthLoading, selectAuthError } from './authSlice';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';

const validationSchema = Yup.object({
  username: Yup.string().required('Vui lòng nhập tên đăng nhập'),
  password: Yup.string().required('Vui lòng nhập mật khẩu'),
});

export function LoginPage() {
  const dispatch = useDispatch();
  const isLoading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);

  const formik = useFormik({
    initialValues: { username: '', password: '' },
    validationSchema,
    onSubmit: (values) => {
      dispatch(loginRequest(values));
    },
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="login-card">
        {/* Logo / Title */}
        <div className="text-center mb-8">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-lg bg-primary-700">
            <i className="pi pi-car text-white text-2xl" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">VSMS</h1>
          <p className="text-gray-500 text-sm mt-1">Hệ Thống Quản Lý Dịch Vụ Xe</p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4">
            <Message severity="error" text={error} className="w-full" />
          </div>
        )}

        <form onSubmit={formik.handleSubmit} noValidate className="space-y-5">
          {/* Username */}
          <div className="flex flex-col gap-1">
            <label htmlFor="username" className="text-sm font-medium text-gray-700">
              Tên đăng nhập
            </label>
            <InputText
              id="username"
              name="username"
              value={formik.values.username}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Nhập tên đăng nhập"
              className={`w-full ${formik.touched.username && formik.errors.username ? 'p-invalid' : ''}`}
              autoComplete="username"
            />
            {formik.touched.username && formik.errors.username && (
              <small className="text-red-500 text-xs">{formik.errors.username}</small>
            )}
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="text-sm font-medium text-gray-700">
              Mật khẩu
            </label>
            <Password
              inputId="password"
              name="password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Nhập mật khẩu"
              feedback={false}
              toggleMask
              className={`w-full ${formik.touched.password && formik.errors.password ? 'p-invalid' : ''}`}
              inputClassName="w-full"
              autoComplete="current-password"
            />
            {formik.touched.password && formik.errors.password && (
              <small className="text-red-500 text-xs">{formik.errors.password}</small>
            )}
          </div>

          {/* Submit */}
          <Button
            type="submit"
            label="Đăng nhập"
            icon="pi pi-sign-in"
            loading={isLoading}
            disabled={isLoading}
            className="w-full mt-2"
          />
        </form>

        <p className="text-center text-xs text-gray-400 mt-6">
          © {new Date().getFullYear()} Vehicle Service Management System
        </p>
      </div>
    </div>
  );
}
