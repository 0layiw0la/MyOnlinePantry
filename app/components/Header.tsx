import Image from 'next/image';
import Link from 'next/link';
import Logo from '@/app/assets/logo.png';
import Btn from './Btn';

type Props = {col? : boolean,
                text: boolean
};

export default function Header({col = true,text=false} : Props){
    return(
        <div className={`flex ${col ? 'flex-row items-center' : 'flex-row items-center justify-center'} gap-2 sm:gap-3 mt-[3vh] px-2 sm:px-4 md:px-6`}>
            {/* Logo and Title */}
            <Image 
                className="bg-transparent w-[40px] sm:w-[50px] md:w-[60px]"
                src={Logo}
                alt="Logo" 
            />
            <h1 className='text-lg sm:text-xl md:text-2xl text-[rgb(29,79,54)] font-bold'>
                <span className="hidden sm:inline">MyOnlinePantry</span>
                <span className="sm:hidden text-2xl">{text ? 'My Online Pantry' : ''}</span>
            </h1>
            
            {/* Auth Buttons */}
            {col && (
                <div className='ml-auto flex items-center gap-2 sm:gap-3 md:gap-4'>
                    <Link href='/signup'>
                        <div className="text-xs sm:text-sm md:text-base ">
                            <Btn text={'Sign Up'} />
                        </div>
                    </Link>
                    <Link href='/login'>
                        <div className="text-xs sm:text-sm md:text-base ">
                            <Btn text={'Log In'} />
                        </div>
                    </Link>
                </div>
            )}
        </div>
    );
}