import { useRef } from 'react';

export default function ImageUpload({ label = "Imagen", value, onChange }) {
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            alert('Imagen muy grande (máx 5MB)');
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            onChange(reader.result); // Base64 string
        };
        reader.readAsDataURL(file);
    };

    const clearImage = (e) => {
        e.stopPropagation();
        e.preventDefault();
        onChange('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const imageUrl = () => {
        if (!value) return '';
        if (value.startsWith('http') || value.startsWith('data:')) return value;
        return `/${value}`; // Assuming local storage URL
    };

    return (
        <div className="form-group">
            <label>{label}</label>
            <div className="img-upload" onClick={() => fileInputRef.current?.click()}>
                {value ? (
                    <>
                        <img src={imageUrl()} alt="Preview" />
                        <button type="button" className="img-remove" onClick={clearImage}>
                            &times;
                        </button>
                    </>
                ) : (
                    <div className="placeholder">
                        <i className="fas fa-cloud-upload-alt"></i>
                        Click o arrastra una imagen
                    </div>
                )}
                <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileChange} 
                    ref={fileInputRef}
                />
            </div>
        </div>
    );
}
