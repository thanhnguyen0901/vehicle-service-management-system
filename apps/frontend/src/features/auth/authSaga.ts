import { call, put, select, takeLatest } from 'redux-saga/effects';
import {
  authCheckRequest,
  authCheckFailure,
  loginRequest,
  loginSuccess,
  loginFailure,
  logoutRequest,
  logoutSuccess,
  selectIsAuthenticated,
  type LoginPayload,
} from './authSlice';
import { authApi } from './authApi';
import type { PayloadAction } from '@reduxjs/toolkit';

function* handleAuthCheck() {
  try {
    let response: Awaited<ReturnType<typeof authApi.me>>;
    try {
      response = yield call(authApi.me);
    } catch {
      yield call(authApi.refresh);
      response = yield call(authApi.me);
    }
    yield put(loginSuccess(response.user));
  } catch {
    const isAuthenticated: boolean = yield select(selectIsAuthenticated);
    if (!isAuthenticated) {
      yield put(authCheckFailure());
    }
  }
}

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
  yield takeLatest(authCheckRequest.type, handleAuthCheck);
  yield takeLatest(loginRequest.type, handleLogin);
  yield takeLatest(logoutRequest.type, handleLogout);
}
