import { useState, useRef, useEffect } from 'react';

const EMOJIS = ['📅','💻','🤖','🌐','🚀','🏆','📱','🎓','💡','🔬','🎯','🎮','📊','🔒','⚡','🌟','🎉','🏫','🤝','📢','🗳️','⚖️','👩‍💻','👨‍💻','👩‍🎓','👨‍🔬','👩‍🔧','👨‍🎨','👤','🧑‍💼','📷','🎨','🎭','🎵','🏅','🔥','💪','🌎','❤️','💙','🧠','🛡️','📝','📚','🔗','⭐','💎','🏗️','🎪','🗂️'];

export default function EmojiPicker({ label = "Emoji", value, onChange }) {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (emoji) => {
        onChange(emoji);
        setIsOpen(false);
    };

    return (
        <div className="form-group" ref={wrapperRef}>
            <label>{label}</label>
            <div className="emoji-picker-wrap">
                <div className="emoji-input-row" onClick={() => setIsOpen(!isOpen)}>
                    <div className="emoji-preview">
                        {value || '📅'}
                    </div>
                    <input 
                        value={value || '📅'} 
                        readOnly 
                        style={{ cursor: 'pointer' }} 
                    />
                </div>
                <div className={`emoji-grid ${isOpen ? 'open' : ''}`}>
                    {EMOJIS.map((e, idx) => (
                        <span key={idx} onClick={(evt) => { evt.stopPropagation(); handleSelect(e); }}>
                            {e}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}
