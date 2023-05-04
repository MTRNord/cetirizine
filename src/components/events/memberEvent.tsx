import { memo } from "react";
import { IRoomEvent } from "../../app/sdk/api/apiTypes";
import { FC } from "react";

type MemberEventProps = {
    /**
     * The event to render
     */
    event: IRoomEvent;
};

const MemberEvent: FC<MemberEventProps> = memo(({ event }) => {
    const renderCorrectMessage = (event: IRoomEvent) => {
        return <></>
    }

    return renderCorrectMessage(event);
});

export default MemberEvent;