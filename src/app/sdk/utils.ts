import { IErrorResp } from "./api/apiTypes"

export class SDKError extends Error {
    protected constructor(msg?: string) {
        if (msg) {
            super(msg)
        } else {
            super("The Matrix SDK encountered and unknown error")
        }
    }
}

export class NotLogeedInError extends SDKError {
    constructor() {
        super("Not logged in")
    }
}

export class HostnameMissingError extends SDKError {
    constructor() {
        super("Hostname must be set first")
    }
}

export class HostnameMissingHTTPSError extends SDKError {
    constructor() {
        super("Hostname must start with 'https://'")
    }
}

export class OlmMachineNotSetupError extends SDKError {
    constructor() {
        super("Olm machine must be set first")
    }
}

export class AccessTokenMissingError extends SDKError {
    constructor() {
        super("Access token must be set first")
    }
}

export class ProfileFetchError extends SDKError {
    constructor(public readonly response: Response) {
        super("Error fetching profile info.")
    }
}

export class LogoutError extends SDKError {
    constructor(public readonly response: Response) {
        super("Error logging out.")
    }
}

export class LoginFlowRequestError extends SDKError {
    constructor(public readonly response: Response) {
        super("Error requesting login flows.")
    }
}

export class UsernameMissingError extends SDKError {
    constructor() {
        super("Username must be set")
    }
}

export class PasswordMissingError extends SDKError {
    constructor() {
        super("Password must be set")
    }
}

export class SlidingSyncProxyNotFoundError extends SDKError {
    constructor() {
        super("No sliding sync proxy found")
    }
}

export class LoginError extends SDKError {
    constructor(public readonly response?: Response, public readonly matrix_error?: IErrorResp) {
        super("Error logging in.")
    }
}

export class PasswordLoginNotSupportedError extends SDKError {
    constructor() {
        super("Password login is not supported by this homeserver")
    }
}

export class FailedSendingError extends SDKError {
    constructor(public readonly response: Response) {
        super(`Failed to send message: ${response.status} ${response.statusText}`)
    }
}

export class SyncError extends SDKError {
    constructor(public readonly response: Response) {
        super(`Error syncing`)
    }
}