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

export class OlmMachineNotSetup extends SDKError {
    constructor() {
        super("Olm machine must be set first")
    }
}