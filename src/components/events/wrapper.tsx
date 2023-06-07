import { FC, memo } from "react";
import { OnlineState } from "../../app/sdk/api/otherEnums";
import Avatar from "../avatar/avatar";
import { Bot } from "lucide-react";

export type MessageWrapperProps = {
    /**
     * The displayname to render
     */
    displayname: string;
    /**
     * The avatar_url to render
     */
    avatar_url: string;
    /**
     * If the sender is a bot
     */
    isBot: boolean;
    /**
     * If the sender is online
     */
    onlineState: OnlineState;
    /**
     * If the room is a DM
     */
    dm: boolean;
    /**
     * If the previous event was sent by the same user
     */
    hasPreviousEvent?: boolean;
    /**
     * Children to render
     */
    children: React.ReactNode;
};


export const MessageWrapper: FC<MessageWrapperProps> = memo(({ hasPreviousEvent, displayname, avatar_url, onlineState, isBot, dm, children }) => {
    return (
        <div className={!hasPreviousEvent ? "flex flex-row gap-4 p-2 pb-1 hover:bg-gray-200 rounded-md duration-200 ease-in-out items-start" : "flex flex-row p-2 pb-1 pt-1 hover:bg-gray-200 rounded-md duration-200 ease-in-out"}>
            {!hasPreviousEvent && <Avatar
                displayname={displayname}
                avatarUrl={avatar_url}
                online={onlineState}
                dm={dm}
                isBot={isBot}
            />}
            <div className={!hasPreviousEvent ? "flex flex-col gap-1" : "ml-12"}>
                {!hasPreviousEvent && <h2 className="flex flex-row items-center gap-2 text-base font-medium text-red-500 whitespace-pre-wrap">{isBot ? <Bot size={16} /> : <></>}{displayname}</h2>}
                {children}
            </div>
        </div>
    )
});