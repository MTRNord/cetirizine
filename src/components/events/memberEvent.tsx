import { memo } from "react";
import { IRoomMemberEvent } from "../../app/sdk/api/events";
import { FC } from "react";

type MemberEventProps = {
    /**
     * The event to render
     */
    event: IRoomMemberEvent;
};

const MemberEvent: FC<MemberEventProps> = memo(({ event }) => {
    const renderCorrectMessage = (event: IRoomMemberEvent) => {
        // TODO: Make sure we render avatar and name changes correctly

        return <p className="p-2 hover:bg-gray-200 rounded-md duration-200 ease-in-out">
            {
                event.content.displayname ?
                    event.content.displayname :
                    event.state_key
            } {
                event.content.membership === "join" ?
                    "joined the room" :
                    (
                        event.content.membership === "leave" ?
                            // TODO: Handle kick
                            "left the room" :
                            (
                                event.content.membership === "ban" ?
                                    "was banned from the room by " + event.sender :
                                    (
                                        event.content.membership === "invite" ?
                                            "was invited to the room by " + event.sender :
                                            (
                                                event.content.membership === "knock" ?
                                                    "knocked on the room" :
                                                    "changed their membership status to " + event.content.membership
                                            )
                                    )
                            )
                    )
            }
        </p>
    }

    return renderCorrectMessage(event);
});

export default MemberEvent;