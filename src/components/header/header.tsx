type HeaderProps = {
    /**
     * The HeaderText
     */
    children: string
};

export default function Header({ children }: HeaderProps) {
    return <h1 className='text-black font-bold text-xl'>{children}</h1>;
}