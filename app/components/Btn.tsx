type Props = {text? : string};

export default function Btn ({text}: Props){
    return (
        <div className="px-6 py-3 bg-[#098c04] flex items-center text-center text-white text-bold rounded-lg">
                {text}
        </div>
    )
}