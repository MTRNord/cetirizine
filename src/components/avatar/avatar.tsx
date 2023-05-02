import { FC, memo } from "react";

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

const Avatar: FC<AvatarProps> = memo(({ avatarUrl, displayname, dm = false, online = false }: AvatarProps) => {
    if (avatarUrl) {
        return (
            <div className="flex relative min-w-[2rem] min-h-[2rem] justify-center items-center m-0 mr-3 text-xl rounded-full text-white">
                <img className="rounded-full w-8 h-8" alt={displayname} src={avatarUrl} />
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
        <div className="flex relative min-w-[2rem] min-h-[2rem] bg-orange-500 justify-center items-center m-0 mr-3 text-xl rounded-full text-white">
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
})

export default Avatar;