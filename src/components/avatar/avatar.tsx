import { FC, memo, useState } from "react";
import { OnlineState } from "../../app/sdk/api/otherEnums";

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
};

const Avatar: FC<AvatarProps> = memo(({ avatarUrl, displayname, dm = false, online = OnlineState.Unknown }: AvatarProps) => {
    const [error, setError] = useState(false);

    if (avatarUrl && !error) {
        return (
            <div className="flex relative min-w-[2rem] min-h-[2rem] w-[2rem] h-[2rem] justify-center items-center m-0 mr-3 text-xl rounded-full text-white">
                <img className="rounded-full w-8 h-8 object-cover" alt={displayname} src={avatarUrl} onError={() => { setError(true) }} />
                {
                    dm ?
                        (
                            online === OnlineState.Online ?
                                <div className="bg-green-500 rounded-full w-3 h-3 absolute right-0 bottom-0"></div> :
                                (online === OnlineState.Offline ? <div className="bg-red-500 rounded-full w-3 h-3 absolute right-0 bottom-0"></div> :
                                    <div className="bg-gray-500 rounded-full w-3 h-3 absolute right-0 bottom-0"></div>)
                        ) :
                        <></>
                }
            </div>
        );
    }
    return (
        <div className="flex relative min-w-[2rem] min-h-[2rem] w-[2rem] h-[2rem] bg-orange-500 justify-center items-center m-0 mr-3 text-xl rounded-full text-white">
            {displayname.replace('@', '').replace('!', '').replace('#', '')[0].toUpperCase()}
            {
                dm ?
                    (
                        online === OnlineState.Online ?
                            <div className="bg-green-500 rounded-full w-3 h-3 absolute right-0 bottom-0"></div> :
                            (online === OnlineState.Offline ? <div className="bg-red-500 rounded-full w-3 h-3 absolute right-0 bottom-0"></div> :
                                <div className="bg-gray-500 rounded-full w-3 h-3 absolute right-0 bottom-0"></div>)
                    ) :
                    <></>
            }
        </div>
    );
})

export default Avatar;