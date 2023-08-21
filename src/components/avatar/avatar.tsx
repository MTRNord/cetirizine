import { FC, memo } from "react";
import { OnlineState } from "../../app/sdk/api/otherEnums";
import './avatar.scss';

type AvatarProps = {
    /**
     * The URL of the Avatar image
     */
    avatarUrl?: string
    /**
     * The displayname of the avatar user
     */
    displayname: string
    /**
     * Wether it is a DM or not
     */
    dm: boolean
    /**
     * Wether the user is online. Only used if dm is true.
     */
    online: OnlineState
    /**
     * Wether the user is a bot
     * @default false
     */
    isBot: boolean
    size?: string
};

const Avatar: FC<AvatarProps> = memo(({ avatarUrl, displayname, dm = false, online = OnlineState.Unknown, size = "2rem" }: AvatarProps) => {

    return (
        <div style={{ minWidth: size, minHeight: size, width: size, height: size }} className="avatar">
            <img alt={displayname} src={avatarUrl} />
            {
                dm ?
                    (
                        online === OnlineState.Online ?
                            <div className="online"></div> :
                            (online === OnlineState.Offline ? <div className="offline"></div> :
                                <div className="unknown"></div>)
                    ) :
                    <></>
            }
        </div>
    );
})

export default Avatar;