import { all } from "redux-saga/effects";
import { apiSagas } from "../api/api";

export default function* rootSaga() {
  yield all([apiSagas()]);
}
