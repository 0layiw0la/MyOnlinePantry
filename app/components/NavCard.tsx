import Image, { StaticImageData } from "next/image";

interface CardProps {
  iconSrc: string | StaticImageData;
  name: string;
  cardText: string;
}

export default function NavCard({ iconSrc, name, cardText }: CardProps) {
  return (
    <div className="bg-[#fdf6e4] border-2 border-[#d1ccb6] rounded-lg p-4 w-[60vw] md:max-w-[15vw] md:h-[15vw] h-[40vh] flex flex-col gap-4 items-center justify-center text-center 
    transition-transform transition-shadow duration-100 ease-in-out hover:shadow-lg hover:scale-[1.03]">
      <Image src={iconSrc} alt={name} width={80} height={80} className="rounded-md" />
      <h2 className="text-lg font-semibold text-green-900">{name}</h2>
      <p className="text-[#254635] text-sm">{cardText}</p>
    </div>
  );
}


