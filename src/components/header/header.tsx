import { FC, memo } from "react";
import "./header.scss"

type HeaderProps = {
    /**
     * The HeaderText
     */
    children: string
};

const Header: FC<HeaderProps> = memo(({ children }: HeaderProps) => {
    return <h1 className='header'>{children}</h1>;
})

export default Header