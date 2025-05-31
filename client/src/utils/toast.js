import { toast, Bounce } from 'react-toastify';

export const showTost = (message, type = "info") => {
    const config = {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Bounce,
    }

    if (type === "success") {
        toast.success(message, config);
    }
    else if (type === "error") {
        toast.error(message, config);
    } else if (type === "info") {
        toast.info(message, config);
    }
    else if (type === "warn") {
        toast.warn(message, config);
    } else {
        toast(message, config);
    }
}