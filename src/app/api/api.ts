import { BaseQueryFn, FetchArgs, FetchBaseQueryError, createApi, fetchBaseQuery, retry, } from '@reduxjs/toolkit/query/react'
import { RootState } from '../store';

import { ILoginFlows, ILoginParams, ILoginResponse, IRateLimitError, IWellKnown } from './apiTypes';
import { createAction, createReducer } from '@reduxjs/toolkit';
// async function login(baseUrl: string, userId: string, password: string): Promise<MatrixClient> {
//     //const client = await initMatrixClient(baseUrl, userId, undefined, undefined, password);

//     window.localStorage.setItem("accessToken", client.getAccessToken()!);
//     window.localStorage.setItem("baseUrl", client.baseUrl);
//     window.localStorage.setItem("userId", client.getUserId()!);
//     window.localStorage.setItem("deviceId", client.getDeviceId()!);

//     return client;
// }

export const setHost = createAction<string, 'auth/host'>('auth/host');
export const setAccessToken = createAction<string, 'auth/access_token'>('auth/access_token');
export const setLoggedIn = createAction<boolean, 'auth/logged_in'>('auth/logged_in');
interface IAuthState {
    host?: string;
    accessToken?: string;
    logged_in: boolean;
}
const initialAuthState: IAuthState = {
    logged_in: false,
}
export const auth = createReducer(initialAuthState, (builder) => builder
    .addCase(setHost, (state, action) => { state.host = action.payload })
    .addCase(setAccessToken, (state, action) => { state.accessToken = action.payload })
    .addCase(setLoggedIn, (state, action) => { state.logged_in = action.payload })
);

const baseQuery: BaseQueryFn<string | FetchArgs,
    unknown,
    FetchBaseQueryError> = async (args, api, extraOptions) => {
        const baseUrl = (api.getState() as RootState).auth.host;
        // gracefully handle scenarios where data to generate the URL is missing
        if (!baseUrl) {
            return {
                error: {
                    status: 400,
                    statusText: 'Bad Request',
                    data: 'Invalid Matrix Host',
                },
            };
        }

        return rawBaseQuery(baseUrl)(args, api, extraOptions);
    };

const baseQueryWithRetry = retry(
    async (args: string | FetchArgs, api, extraOptions) => {
        const result = await baseQuery(args, api, extraOptions);
        if (result.error?.status === 429) {
            const retryAfterMs = (result.error.data as IRateLimitError).retry_after_ms;
            if (retryAfterMs) {
                await new Promise((resolve) => setTimeout(resolve, retryAfterMs));
            }
        }
        return result;
    }, { maxRetries: 3 });

export const matrixApi = createApi({
    reducerPath: 'matrixApi',
    baseQuery: baseQueryWithRetry,
    refetchOnReconnect: true,
    tagTypes: ['Login', 'Flows', "WellKnown"],
    endpoints: (builder) => ({
        getWellKnown: builder.query<IWellKnown, undefined>({
            query: () => `/.well-known/matrix/client`,
            providesTags: ['WellKnown'],
            async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
                try {
                    const { data, meta } = await queryFulfilled;
                    const response = (meta as { request: Request, response: Response }).response;
                    if (response.status === 200) {
                        if (data?.["m.homeserver"]?.base_url) {
                            dispatch(setHost(data["m.homeserver"].base_url))
                        }
                    }
                } catch (err) {
                    // `onError` side-effect
                }
            },
        }),
        getLoginFlows: builder.query<ILoginFlows, undefined>({
            query: () => `/_matrix/client/v3/login`,
            providesTags: ['Flows'],
        }),
        doLogin: builder.mutation<ILoginResponse, ILoginParams>({
            query: (data) => ({
                url: `/_matrix/client/r0/login`,
                method: 'POST',
                body: data,
            }),
            async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
                try {
                    const { data, meta } = await queryFulfilled;
                    const response = (meta as { request: Request, response: Response }).response;

                    if (response.status === 200) {
                        dispatch(setLoggedIn(true))
                        dispatch(setAccessToken(data.access_token))
                        if (data.well_known?.["m.homeserver"]?.base_url) {
                            dispatch(setHost(data.well_known["m.homeserver"].base_url))
                        }
                    } else {
                        dispatch(setLoggedIn(false))
                    }
                } catch (err) {
                    // `onError` side-effect
                    dispatch(setLoggedIn(false))
                }
            },
            invalidatesTags: ['Login'],
        }),
        sync: builder.query<any[], void>({
            keepUnusedDataFor: 2147483647,
            // The query is not relevant here as the data will be provided via streaming updates.
            // A queryFn returning an empty array is used, with contents being populated via
            // streaming updates below as they are received.
            queryFn: () => ({ data: [] }),
            async onCacheEntryAdded(_arg, { updateCachedData, cacheEntryRemoved, getState }) {
                // TODO: /sync loop
                /*
                updateCachedData((draft) => {
                    draft.push(JSON.parse(event.data))
                })
                */
                await cacheEntryRemoved
                // Cleanup?
            },
        }),
    }),
});

const rawBaseQuery = (baseUrl: string) => fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers, { getState }) => {
        const token = (getState() as RootState).auth.accessToken;
        !!token && headers.set('Authorization', `Bearer ${token}`);

        return headers;
    },
});


// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const { useLazyGetLoginFlowsQuery, useDoLoginMutation, useLazyGetWellKnownQuery, useSyncQuery } = matrixApi
