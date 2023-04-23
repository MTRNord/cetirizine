import { FC } from "react";

type HeaderProps = {
    /**
     * The HeaderText
     */
    children: string
};

const Header: FC<HeaderProps> = ({ children }: HeaderProps) => {
    return <h1 className='text-black font-bold text-xl'>{children}</h1>;
}

export default Header