import { FC } from "react";

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
    online: boolean
};

const Avatar: FC<AvatarProps> = ({ avatarUrl, displayname, dm = false, online = false }: AvatarProps) => {
    if (avatarUrl) {
        return (
            <div className="flex relative w-8 h-8 justify-center items-center m-1 mr-2 text-xl rounded-full text-white">
                <img className="rounded-full" alt={displayname} src={avatarUrl} />
                {
                    dm ?
                        (
                            online ?
                                <div className="bg-green-500 rounded-full w-3 h-3 absolute bottom-0 right-0"></div> :
                                <div className="bg-red-500 rounded-full w-3 h-3 absolute bottom-0 right-0"></div>
                        ) :
                        <></>
                }
            </div>
        );
    }
    return (
        <div className="flex relative w-8 h-8 bg-orange-500 justify-center items-center m-1 mr-2 text-xl rounded-full text-white">
            {displayname[0].toUpperCase()}
            {
                dm ?
                    (
                        online ?
                            <div className="bg-green-500 rounded-full w-3 h-3 absolute bottom-0 right-0"></div> :
                            <div className="bg-red-500 rounded-full w-3 h-3 absolute bottom-0 right-0"></div>
                    ) :
                    <></>
            }
        </div>
    );
}

export default Avatar;