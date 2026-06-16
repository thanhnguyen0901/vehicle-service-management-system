import { call, put, takeLatest } from 'redux-saga/effects';
import {
  loginRequest,
  loginSuccess,
  loginFailure,
  logoutRequest,
  logoutSuccess,
  type LoginPayload,
} from './authSlice';
import { authApi } from './authApi';
import type { PayloadAction } from '@reduxjs/toolkit';

function* handleLogin(action: PayloadAction<LoginPayload>) {
  try {
    const response: Awaited<ReturnType<typeof authApi.login>> = yield call(
      authApi.login,
      action.payload,
    );
    yield put(loginSuccess(response.user));
  } catch (err: unknown) {
    const message =
      (err as { response?: { data?: { error?: { message?: string } } } })
        ?.response?.data?.error?.message ?? 'Đăng nhập thất bại';
    yield put(loginFailure(message));
  }
}

function* handleLogout() {
  try {
    yield call(authApi.logout);
  } finally {
    yield put(logoutSuccess());
  }
}

export function* authSaga() {
  yield takeLatest(loginRequest.type, handleLogin);
  yield takeLatest(logoutRequest.type, handleLogout);
}
