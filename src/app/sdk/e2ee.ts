import {
    DeviceId,
    DeviceLists,
    KeysBackupRequest,
    KeysClaimRequest,
    KeysQueryRequest,
    KeysUploadRequest,
    OlmMachine,
    RequestType,
    RoomId,
    RoomMessageRequest,
    SignatureUploadRequest,
    ToDeviceRequest,
    UserId
} from "@mtrnord/matrix-sdk-crypto-js";
import { MatrixClient } from "./client";
import { OwnUser } from "./ownUser";
import { Room } from "./room";
import { IRoomEvent } from "./api/events";

export class MatrixE2EE {
    private olmMachine?: OlmMachine;
    private outgoingRequestsBeingProcessed = false;
    private missingSessionsBeingRequested = false;

    constructor(private client: MatrixClient, private user: OwnUser) { }

    public async decryptRoomEvent(roomID: string, event: IRoomEvent<any>) {
        return await this.olmMachine?.decryptRoomEvent(JSON.stringify(event), new RoomId(roomID));
    }

    public async receiveSyncData(
        to_device_events: string,
        changed_devices: DeviceLists,
        one_time_key_counts: Map<any, any>,
        unused_fallback_keys?: Set<any>
    ) {
        await this.olmMachine?.receiveSyncChanges(
            to_device_events,
            changed_devices,
            one_time_key_counts,
            unused_fallback_keys
        );
    }

    public async encryptRoomEvent(roomID: RoomId, type: string, content: any): Promise<any> {
        if (!this.client.isLoggedIn) {
            throw Error("Not logged in");
        }
        if (!this.user.hostname) {
            throw Error("Hostname must be set first");
        }
        if (!this.olmMachine) {
            throw Error("Olm machine must be set first");
        }
        await this.olmMachine?.encryptRoomEvent(roomID, type, content);
    }

    public async initOlmMachine(userID: UserId, deviceID: DeviceId, storePassphrase?: string) {
        this.olmMachine = await OlmMachine.initialize(userID, deviceID, "cetirizine-crypto", storePassphrase);
    }

    public async updateTrackedUsers(users: any[]) {
        await this.olmMachine?.updateTrackedUsers(users);
    }

    public async sendIdentifyAndOneTimeKeys() {
        if (!this.client.isLoggedIn) {
            throw Error("Not logged in");
        }
        if (!this.user.slidingSyncHostname) {
            throw Error("Hostname must be set first");
        }
        if (!this.olmMachine) {
            throw Error("Olm machine must be set first");
        }

        if (this.outgoingRequestsBeingProcessed) {
            return;
        }
        this.outgoingRequestsBeingProcessed = true;

        const outgoing_requests = await this.olmMachine.outgoingRequests();

        for (const request of outgoing_requests) {
            await this.processRequest(request);
        }

        await this.getMissingSessions();
        this.outgoingRequestsBeingProcessed = false;
    }

    public async shareKeysForRoom(room: Room) {
        if (!this.client.isLoggedIn) {
            throw Error("Not logged in");
        }
        if (!this.user.slidingSyncHostname) {
            throw Error("Hostname must be set first");
        }
        if (!this.olmMachine) {
            throw Error("Olm machine must be set first");
        }
        const encryptionSettings = room.getEncryptionSettings();
        if (encryptionSettings) {
            const requests = await this.olmMachine.shareRoomKey(new RoomId(room.roomID), room.getJoinedMemberIDs().map(id => new UserId(id)), encryptionSettings);
            for (const request of requests) {
                await this.processRequest(request);
            }
        }
    }

    public async getMissingSessions() {
        if (!this.client.isLoggedIn) {
            throw Error("Not logged in");
        }
        if (!this.user.slidingSyncHostname) {
            throw Error("Hostname must be set first");
        }
        if (!this.olmMachine) {
            throw Error("Olm machine must be set first");
        }

        if (this.missingSessionsBeingRequested) {
            return;
        }
        this.missingSessionsBeingRequested = true;

        const encryptedRooms = [...this.client.getRooms()].filter(room => room.isEncrypted());
        const users = encryptedRooms.map(room => room.getJoinedMemberIDs().map(id => new UserId(id))).flat();
        const request = await this.olmMachine?.getMissingSessions(users);
        if (request) {
            await this.processRequest(request);
        }

        this.missingSessionsBeingRequested = false;
    }

    private async processRequest(request: any) {
        if (!this.client.isLoggedIn) {
            throw Error("Not logged in");
        }
        if (!this.user.slidingSyncHostname) {
            throw Error("Hostname must be set first");
        }
        if (!this.olmMachine) {
            throw Error("Olm machine must be set first");
        }
        // Check which type the request is
        if (request.type === RequestType.KeysUpload) {
            // Send the key
            const request_typed = request as KeysUploadRequest;
            const response = await fetch(
                `${this.user.hostname}/_matrix/client/v3/keys/upload`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${this.user.access_token}`
                    },
                    body: request_typed.body
                }
            )
            if (!response.ok) {
                if (response.status === 401) {
                    await this.client.logout();
                    console.error(response);
                }
                console.error("Failed to upload keys", response);
                return;
            }
            this.olmMachine.markRequestAsSent(request_typed.id!, request_typed.type, await response.text());
        } else if (request.type === RequestType.KeysQuery) {
            const request_typed = request as KeysQueryRequest;
            const response = await fetch(
                `${this.user.hostname}/_matrix/client/v3/keys/query`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${this.user.access_token}`
                    },
                    body: request_typed.body
                }
            )
            if (!response.ok) {
                if (response.status === 401) {
                    await this.client.logout();
                    console.error(response);
                }
                console.error("Failed to query keys", response);
                return;
            }
            this.olmMachine.markRequestAsSent(request_typed.id!, request_typed.type, await response.text());
        } else if (request.type === RequestType.KeysClaim) {
            const request_typed = request as KeysClaimRequest;
            const response = await fetch(
                `${this.user.hostname}/_matrix/client/v3/keys/claim`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${this.user.access_token}`
                    },
                    body: request_typed.body
                }
            )
            if (!response.ok) {
                if (response.status === 401) {
                    await this.client.logout();
                    console.error(response);
                }
                console.error("Failed to claim keys", response);
                return;
            }
            this.olmMachine.markRequestAsSent(request_typed.id!, request_typed.type, await response.text());
        } else if (request.type === RequestType.ToDevice) {
            const request_typed = request as ToDeviceRequest;
            const response = await fetch(
                `${this.user.hostname}/_matrix/client/v3/sendToDevice/${request_typed.event_type}/${request_typed.txn_id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${this.user.access_token}`
                    },
                    body: request_typed.body
                }
            )
            if (!response.ok) {
                if (response.status === 401) {
                    await this.client.logout();
                    console.error(response);
                }
                console.error("Failed to send to device", response);
                return;
            }
            this.olmMachine.markRequestAsSent(request_typed.id ?? request_typed.txn_id, request_typed.type, await response.text());
        } else if (request.type === RequestType.SignatureUpload) {
            const request_typed = request as SignatureUploadRequest;
            const response = await fetch(
                `${this.user.hostname}/_matrix/client/v3/keys/signatures/upload`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${this.user.access_token}`
                    },
                    body: request_typed.body
                }
            )
            if (!response.ok) {
                if (response.status === 401) {
                    await this.client.logout();
                    console.error(response);
                }
                console.error("Failed to upload signatures", response);
                return;
            }
            this.olmMachine.markRequestAsSent(request_typed.id!, request_typed.type, await response.text());
        } else if (request.type === RequestType.RoomMessage) {
            const request_typed = request as RoomMessageRequest;
            const response = await fetch(
                `${this.user.hostname}/_matrix/client/v3/rooms/${request_typed.room_id}/send/${request_typed.event_type}/${request_typed.txn_id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${this.user.access_token}`
                    },
                    body: request_typed.body
                }
            )
            if (!response.ok) {
                if (response.status === 401) {
                    await this.client.logout();
                    console.error(response);
                }
                console.error("Failed to send message", response);
                return;
            }
            this.olmMachine.markRequestAsSent(request_typed.id!, request_typed.type, await response.text());
        } else if (request.type === RequestType.KeysBackup) {
            const request_typed = request as KeysBackupRequest;
            const response = await fetch(
                `${this.user.hostname}/_matrix/client/v3/room_keys/keys`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${this.user.access_token}`
                    },
                    body: request_typed.body
                }
            )
            if (!response.ok) {
                if (response.status === 401) {
                    await this.client.logout();
                    console.error(response);
                }
                console.error("Failed to backup keys", response);
                return;
            }
            this.olmMachine.markRequestAsSent(request_typed.id!, request_typed.type, await response.text());
        }
    }

    public logoutE2ee() {
        this.missingSessionsBeingRequested = false;
        this.outgoingRequestsBeingProcessed = false;
    }
}