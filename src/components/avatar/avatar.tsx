type AvatarProps = {
    /**
     * The URL of the Avatar image
     */
    avatarUrl?: string
    /**
     * The displayname of the avatar user
     */
    userID: string
    /**
     * Wether it is a DM or not
     */
    dm: boolean
    /**
     * Wether the user is online. Only used if dm is true.
     */
    online: boolean
};

export default function Avatar({ avatarUrl, userID, dm = false, online = false }: AvatarProps) {
    if (avatarUrl) {
        return (
            <div className="flex relative w-12 h-12 justify-center items-center m-1 mr-2 text-xl rounded-full text-white">
                <img className="rounded-full" alt={userID} src={avatarUrl} />
                {
                    dm ?
                        (
                            online ?
                                <div className="bg-green-500 rounded-full w-3 h-3 absolute bottom-[2px] right-[2px]"></div> :
                                <div className="bg-red-500 rounded-full w-3 h-3 absolute bottom-[2px] right-[2px]"></div>
                        ) :
                        <></>
                }
            </div>
        );
    }
    return (
        <div className="flex relative w-12 h-12 bg-orange-500 justify-center items-center m-1 mr-2 text-xl rounded-full text-white">
            {userID[0].toUpperCase()}
            {
                dm ?
                    (
                        online ?
                            <div className="bg-green-500 rounded-full w-3 h-3 absolute bottom-[2px] right-[2px]"></div> :
                            <div className="bg-red-500 rounded-full w-3 h-3 absolute bottom-[2px] right-[2px]"></div>
                    ) :
                    <></>
            }
        </div>
    );
}