import { memo } from "react";
import { IRoomEvent } from "../../app/sdk/api/apiTypes";
import { FC } from "react";

type UnknownEventProps = {
    /**
     * The event to render
     */
    event: IRoomEvent;
};

const UnknownEvent: FC<UnknownEventProps> = memo(({ event }) => {
    return <p className="whitespace-break-spaces">{JSON.stringify(event, null, 4)}</p>;
});

export default UnknownEvent;