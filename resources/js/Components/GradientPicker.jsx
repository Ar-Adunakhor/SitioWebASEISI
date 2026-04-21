import { useState, useEffect } from 'react';

export default function GradientPicker({ label = "Color del banner", value, onChange }) {
    const [c1, setC1] = useState('#B71C1C');
    const [c2, setC2] = useState('#D32F2F');

    useEffect(() => {
        if (value) {
            const m = value.match(/#[0-9A-Fa-f]{6}/g);
            if (m && m.length >= 2) {
                setC1(m[0]);
                setC2(m[1]);
            }
        }
    }, [value]);

    const handleColorChange = (newC1, newC2) => {
        setC1(newC1);
        setC2(newC2);
        onChange(`linear-gradient(135deg,${newC1},${newC2})`);
    };

    const gradient = value || `linear-gradient(135deg,${c1},${c2})`;

    return (
        <div className="form-group">
            <label>{label}</label>
            <div className="color-picker-row">
                <input 
                    type="color" 
                    value={c1} 
                    onChange={(e) => handleColorChange(e.target.value, c2)} 
                />
                <input 
                    type="color" 
                    value={c2} 
                    onChange={(e) => handleColorChange(c1, e.target.value)} 
                />
                <div 
                    className="gradient-preview" 
                    style={{ background: gradient }}
                ></div>
            </div>
        </div>
    );
}
