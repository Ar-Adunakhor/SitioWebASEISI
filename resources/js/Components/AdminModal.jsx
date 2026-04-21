import { useEffect, useRef } from 'react';

export default function AdminModal({ children, show = false, onClose = () => {}, title }) {
    const modalRef = useRef(null);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && show) {
                onClose();
            }
        };

        if (show) {
            document.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        } else {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [show, onClose]);

    if (!show) {
        return null;
    }

    return (
        <div className="modal-overlay active" onClick={onClose}>
            <div 
                className="modal" 
                ref={modalRef} 
                onClick={(e) => e.stopPropagation()}
            >
                <button className="modal-close" onClick={onClose} type="button">
                    <i className="fas fa-times"></i>
                </button>
                {title && <h3>{title}</h3>}
                <div className="modal-body">
                    {children}
                </div>
            </div>
        </div>
    );
}
